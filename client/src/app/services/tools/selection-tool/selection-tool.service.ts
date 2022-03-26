import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SelectionCommandConstants } from './command-type-constant';
import { SelectionTransformService } from './selection-transform.service';
import { SocketService } from '@app/services/socket/socket.service';


@Injectable({
  providedIn: 'root',
})
export class SelectionToolService implements Tools {

  readonly id: number = ToolIdConstants.SELECTION_ID;
  readonly faIcon: IconDefinition = faMousePointer;
  readonly toolName = 'Sélection';
  parameters: FormGroup;

  private hasSelectedItems = false;
  private isAlt = false;
  private isShift = false;

  private pointsSideLength = 10;
  private pointsList: Point[] = [
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ];
  private ctrlPoints: SVGRectElement[] = [];
  private controlPoints: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
  private ctrlG: SVGGElement;
  private rectSelection: SVGPolygonElement;

  private rectInversement: SVGRectElement;
  private firstInvObj: SVGElement | null;
  private recStrokeWidth = 1;

  private objects: SVGElement[] = [];
  private tmpX: number;
  private tmpY: number;
  private wasMoved = false;
  private isIn = false;

  renderer: Renderer2

  constructor(
    rendererFactory: RendererFactory2,
    private drawingService: DrawingService,
    private offsetManager: OffsetManagerService,
    private rendererService: RendererProviderService,
    private selectionTransformService: SelectionTransformService,
    private socketService: SocketService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.setRectInversement();
    this.setRectSelection();
    this.setCtrlPoints();
  }

  setUpSelection() {
    this.socketService.getSocket().on("STARTSELECT", (data)=>{
      data=JSON.parse(data);

      this.tmpX = data.off.x;
      this.tmpY = data.off.y;
      const obj = this.drawingService.getObject(Number(data.identif));

      if (this.isInside(data.off.x, data.off.y)) {
        this.isIn = true;
        if (!this.selectionTransformService.hasCommand()) {
          this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
        }
      }
      else {
        let counter = 0;
        let newid = "";
        this.ctrlPoints.forEach((point) => {
          newid = data.identif + `${counter++}`;
          this.rendererService.renderer.setAttribute(point, 'id', newid as string);
          this.controlPoints.set(newid, point);
          this.rendererService.renderer.setAttribute(point, 'x', data.off.x.toString() + 'px');
          this.rendererService.renderer.setAttribute(point, 'y', data.off.y.toString() + 'px');
        });
        this.removeSelection();

        if (obj && (this.objects.length < 2 || !this.objects.includes(obj))) {
          this.objects.push(obj!);
          this.setSelection();
          this.isIn = true;

          this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
          this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
          this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
          return;
        }
      }

      this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.removeInversement();
      this.selectionTransformService.endCommand();
      this.isIn = data.inside;

      const allObject: SVGElement[] = [];
      this.drawingService.getObjectList().forEach((value) => {
        if (value.tagName.toLowerCase() !== 'defs') {
          allObject.push(value);
        }
      });

      const rectBox = this.rectSelection.getBoundingClientRect();

      allObject.forEach((obj) => {
        const box = obj.getBoundingClientRect();
        console.log("rectbox", rectBox);
        this.objects.splice(this.objects.indexOf(obj, 0), 1);
        console.log("box", box);
        this.objects.push(obj);
      });
    });

    this.socketService.getSocket().on("DRAWSELECT", (data)=>{
      data=JSON.parse(data);

      this.wasMoved = true;
      if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
        this.selectionTransformService.resize(data.x, data.y, data.off);
        this.setSelection();
        return;
      }
      if (this.isIn) {
        if (this.selectionTransformService.getCommandType() !== SelectionCommandConstants.TRANSLATE) {
          this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
        }
        this.selectionTransformService.translate(data.x, data.y);
        this.setSelection();
      }
      else {
        this.setSizeOfSelectionArea(data.x, data.y, this.rectSelection);
      }
    });

    this.socketService.getSocket().on("SIZESELECT", (data)=>{
      data=JSON.parse(data);

      const obj = this.controlPoints.get(data.identif);
      this.selectionTransformService.createCommand(SelectionCommandConstants.RESIZE, this.rectSelection, this.objects, data.off, obj as SVGRectElement,);
      this.isIn = false;
    });

    this.socketService.getSocket().on("ENDSELECT", (data)=>{
      data=JSON.parse(data);
    });
  }

  /// Quand le bouton gauche de la sourie est enfoncé, soit on selectionne un objet, soit on debute une zone de selection
  /// soit on s'aprete a deplacer un ou plusieurs objet ou soit on enleve une selection.
  /// Avec le bouton droit, on debute une zone d'inversion.
  onPressed(event: MouseEvent): void {
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      let target = event.target as SVGElement;

      if (this.ctrlPoints.includes(target as SVGRectElement)) {
        this.socketService.getSocket().emit("SIZESELECT", JSON.stringify({ off: offset, identif: target.id }));
        return;
      }

      if (target.getAttribute('name') === 'pen') {
        target = target.parentNode as SVGElement;
      }

      const obj = this.drawingService.getObject(Number(target.id));

      if (event.button === LEFT_CLICK) {
        if (this.isInside(offset.x, offset.y)) {
          this.isIn = true;
          if (!this.selectionTransformService.hasCommand()) {
            this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
            this.socketService.getSocket().emit("STARTSELECT", JSON.stringify({ off: offset, identif: target.id, inside: true }));
          }
        }
        else {
            this.socketService.getSocket().emit("STARTSELECT", JSON.stringify({ off: offset, identif: target.id, inside: false }));
        }
      } 
      else {
        if (obj) {
          this.firstInvObj = obj;
        }
        this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectInversement);
        this.wasMoved = true;
      }

      if (this.hasSelectedItems) {
        return;
      }
    }
  }

  /// Quand le bouton de la sourie gauche est relache, soit on selectionne un objet, soit on termine une zone de selection
  /// et on recherche les objets a l'interieur. Avec le droit, on termine la zone d'inversement et on inverse
  /// la selection des objets se situant a l'interieur.
  onRelease(event: MouseEvent): ICommand | void {
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      if (event.button === LEFT_CLICK) {
        if (this.wasMoved && !this.hasSelectedItems) {
          //this.findObjects(this.rectSelection, event.button);
        }
        else if (!this.wasMoved && this.objects.length >= 1 && this.isIn) {
          this.objects = [];
          const target = event.target as SVGElement;
          const obj = this.drawingService.getObject(Number(target.id));
          
          if (obj) {
            this.objects.push(obj);
            this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
          }
        }
      } 
      else {
        this.findObjects(this.rectInversement, event.button);
      }
      if (this.objects.length > 0) {
        //this.setSelection();
      } 
      else {
        //this.removeSelection();
      }

      let returnRectangleCommand;
      if (this.wasMoved) {
        if (this.selectionTransformService.hasCommand()) {
          returnRectangleCommand = this.selectionTransformService.getCommand();
          this.selectionTransformService.endCommand();
        }
        this.wasMoved = false;
        return returnRectangleCommand;
      }
    }
  }

  /// Quand le bouton de la sourie gauche est enfonce et que le bouge la sourie, soit on selectionne un objet,
  /// soit on modifie la dimension du rectangle de selection, soit on deplace un ou plusieurs objets.
  /// Avec le droit, on modifie la dimension du rectangle d'inversement.
  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    if (this.drawingService.drawing) {
      if (event.buttons === 1) {
        this.wasMoved = true;

        if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
          this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: false }));
          return;
        }

        if (this.isIn) {
          if (this.selectionTransformService.getCommandType() !== SelectionCommandConstants.TRANSLATE) {
            //this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
          }
          this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: true }));
        } 
        else {
          this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: offset.x, y: offset.y, off: offset, inside: false }));
        }
      } 
      else if (event.buttons === 2) {
        this.setSizeOfSelectionArea(offset.x, offset.y, this.rectInversement);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isAlt) {
      this.isAlt = event.code === KeyCodes.altR || event.code === KeyCodes.altL;
    }
    if (!this.isShift) {
      this.isShift = event.code === KeyCodes.shiftR || event.code === KeyCodes.shiftL;
    }

    this.wasMoved = true;

    if (this.isAlt) {
      this.selectionTransformService.setAlt(true);
    }
    if (this.isShift) {
      this.selectionTransformService.setShift(true);
      this.setSelection();
    }

    if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
      this.selectionTransformService.resizeWithLastOffset();
      this.setSelection();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (this.isAlt) {
      this.isAlt = !(event.code === KeyCodes.altR || event.code === KeyCodes.altL);
    }
    if (this.isShift) {
      this.isShift = !(event.code === KeyCodes.shiftR || event.code === KeyCodes.shiftL);
    }

    this.wasMoved = true;

    if (!this.isAlt) {
      this.selectionTransformService.setAlt(false);
    }
    if (!this.isShift) {
      this.selectionTransformService.setShift(false);
      this.setSelection();
    }

    if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
      this.selectionTransformService.resizeWithLastOffset();
      this.setSelection();
    }

  }

  /// Methode qui applique un redimensionnement au rectangle de selection ou d'inversement.
  private setSizeOfSelectionArea(x: number, y: number, rectUsing: SVGElement): void {
    let recX = this.tmpX + this.recStrokeWidth / 2;
    let recY = this.tmpY + this.recStrokeWidth / 2;
    let width = x - this.tmpX - this.recStrokeWidth;
    let height = y - this.tmpY - this.recStrokeWidth;

    if (width < 0) {
      recX = x + this.recStrokeWidth / 2;
      width = Math.abs(width) - 2 * this.recStrokeWidth;
    }
    if (height < 0) {
      recY = y + this.recStrokeWidth / 2;
      height = Math.abs(height) - 2 * this.recStrokeWidth;
    }

    if (width < 0) {
      width = 0;
    }
    if (height < 0) {
      height = 0;
    }

    if (rectUsing === this.rectInversement) {
      this.rendererService.renderer.setAttribute(rectUsing, 'x', `${recX}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'y', `${recY}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'height', `${height}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'width', `${width}`);
    } 
    else {
      this.pointsList[0].x = recX; this.pointsList[0].y = recY;
      this.pointsList[1].x = recX + width / 2; this.pointsList[1].y = recY;
      this.pointsList[2].x = recX + width; this.pointsList[2].y = recY;
      this.pointsList[3].x = recX + width; this.pointsList[3].y = recY + height / 2;
      this.pointsList[4].x = recX + width; this.pointsList[4].y = recY + height;
      this.pointsList[5].x = recX + width / 2; this.pointsList[5].y = recY + height;
      this.pointsList[6].x = recX; this.pointsList[6].y = recY + height;
      this.pointsList[7].x = recX; this.pointsList[7].y = recY + height / 2;
      this.rendererService.renderer.setAttribute(rectUsing, 'points', this.pointsToString());
      for (let i = 0; i < 8; i++) {
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'x', `${this.pointsList[i].x + 0.5 - this.pointsSideLength / 2}`);
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'y', `${this.pointsList[i].y + 0.5 - this.pointsSideLength / 2}`);
      }
    }
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Methode qui trouve les objets se situant a l'interieur du rectangle de selection ou d'inversement trace.
  private findObjects(rectUsing: SVGElement, button: number): void {
    const allObject: SVGElement[] = [];
    this.drawingService.getObjectList().forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        allObject.push(value);
      }
    });

    const rectBox = rectUsing.getBoundingClientRect();

    if (button === 0) {
      allObject.forEach((obj) => {
        const box = obj.getBoundingClientRect();
        if (!(rectBox.left > box.right + this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.right < box.left - this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.top > box.bottom + this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.bottom < box.top - this.strToNum(obj.style.strokeWidth) / 2)) {
          this.objects.push(obj);
        }
      });
    } 
    else {
      allObject.forEach((obj) => {
        const box = obj.getBoundingClientRect();
        if (!(rectBox.left > box.right || rectBox.right < box.left || rectBox.top > box.bottom || rectBox.bottom < box.top)) {
          if (obj && obj !== this.firstInvObj) {
            if (this.objects.includes(obj)) {
              this.objects.splice(this.objects.indexOf(obj, 0), 1);
            } 
            else {
              this.objects.push(obj);
            }
          }
        }
      });
      if (this.firstInvObj) {
        if (this.objects.includes(this.firstInvObj)) {
          this.objects.splice(this.objects.indexOf(this.firstInvObj, 0), 1);
        } 
        else {
          this.objects.push(this.firstInvObj);
        }
      }
    }
  }

  /// Methode qui calcule la surface que le rectangle de selection doit prendre en fonction des objets selectionnes.
  private setSelection(): void {
    if (this.hasSelection()) {
      this.hasSelectedItems = true;
      this.rendererService.renderer.setAttribute(this.rectSelection, 'transform', ``);
      this.ctrlPoints.forEach((point) => {
        this.rendererService.renderer.setAttribute(point, 'transform', '');
      });

      let boundingRect = this.objects[0].getBoundingClientRect();

      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      let objStrokeWidth = 0;
      if (this.objects[0].style.stroke !== 'none') {
        objStrokeWidth = this.strToNum(this.objects[0].style.strokeWidth);
      }
      let markerID: string | null = this.objects[0].getAttribute('marker-start');
      if (markerID) {
        objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
      }

      if (this.objects.length === 1 || !this.wasMoved) {
        x = boundingRect.left - this.xFactor() - objStrokeWidth / 2;
        y = boundingRect.top - objStrokeWidth / 2;
        width = boundingRect.width + objStrokeWidth;
        height = boundingRect.height + objStrokeWidth;
      } 
      else {
        let xL = boundingRect.left - objStrokeWidth / 2;
        let xR = boundingRect.right + objStrokeWidth / 2;

        let yT = boundingRect.top - objStrokeWidth / 2;
        let yB = boundingRect.bottom + objStrokeWidth / 2;

        this.objects.forEach((elm) => {
          let value;
          boundingRect = elm.getBoundingClientRect();

          objStrokeWidth = 0;
          if (elm.style.stroke !== 'none') {
            objStrokeWidth = this.strToNum(elm.style.strokeWidth);
          }
          markerID = elm.getAttribute('marker-start');
          if (markerID) {
            objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
          }

          value = boundingRect.left - objStrokeWidth / 2;
          if (value < xL) {
            xL = value;
          }

          value = boundingRect.right + objStrokeWidth / 2;
          if (value > xR) {
            xR = value;
          }

          value = boundingRect.top - objStrokeWidth / 2;
          if (value < yT) {
            yT = value;
          }

          value = boundingRect.bottom + objStrokeWidth / 2;
          if (value > yB) {
            yB = value;
          }
        });

        x = xL - this.xFactor();
        y = yT;
        width = xR - xL;
        height = yB - yT;
      }

      this.pointsList[0].x = x; this.pointsList[0].y = y;
      this.pointsList[1].x = x + width / 2; this.pointsList[1].y = y;
      this.pointsList[2].x = x + width; this.pointsList[2].y = y;
      this.pointsList[3].x = x + width; this.pointsList[3].y = y + height / 2;
      this.pointsList[4].x = x + width; this.pointsList[4].y = y + height;
      this.pointsList[5].x = x + width / 2; this.pointsList[5].y = y + height;
      this.pointsList[6].x = x; this.pointsList[6].y = y + height;
      this.pointsList[7].x = x; this.pointsList[7].y = y + height / 2;

      this.rendererService.renderer.setAttribute(this.rectSelection, 'points', this.pointsToString());
      for (let i = 0; i < 8; i++) {
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'x', `${this.pointsList[i].x + 0.5 - this.pointsSideLength / 2}`);
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'y', `${this.pointsList[i].y + 0.5 - this.pointsSideLength / 2}`);
      }
    }
  }

  /// Methode qui suprime la selection courante .
  removeSelection(): void {
    this.objects = [];
    this.hasSelectedItems = false;

    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);

    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
  }
  /// Methode pour cacher la selection en gardant en memoire les element
  hideSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'hidden');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'hidden');
  }
  // Rendre la selection visible
  showSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'visible');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'visible');

  }

  /// Methode qui suprime le rectangle de selection du dessin.
  private removeInversement(): void {
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectInversement);

    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'width', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'height', '0');
  }

  /// Initialise le rectangle de selection.
  private setRectSelection(): void {
    this.rectSelection = this.rendererService.renderer.createElement('polygon', 'svg');
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke', `rgba(0, 0, 200, 1)`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'pointer-events', 'none');
  }

  /// Initialise les points de controle.
  private setCtrlPoints(): void {
    this.ctrlG = this.rendererService.renderer.createElement('g', 'svg');

    for (let i = 0; i < 8; i++) {
      const point = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(point, 'stroke', `black`);
      this.rendererService.renderer.setStyle(point, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(point, 'fill', `white`);

      this.rendererService.renderer.setAttribute(point, 'width', `${this.pointsSideLength}`);
      this.rendererService.renderer.setAttribute(point, 'height', `${this.pointsSideLength}`);

      this.ctrlPoints.push(point);

      this.rendererService.renderer.appendChild(this.ctrlG, point);
    }

    this.selectionTransformService.setCtrlPointList(this.ctrlPoints);
  }

  /// Initialise le rectangle d'inversement.
  private setRectInversement(): void {
    this.rectInversement = this.rendererService.renderer.createElement('rect', 'svg');
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke', `rgba(200, 0, 0, 1)`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'pointer-events', 'none');
  }

  /// Retourne la liste d'objets selectionne.
  getObjectList(): SVGElement[] {
    return this.objects;
  }

  /// Retourne la position superieur gauche du rectangle de selection.
  getRectSelectionOffset(): Point {
    return this.pointsList[0];
  }

  /// Retourne si il y a une selection ou non.
  hasSelection(): boolean {
    return this.objects.length > 0;
  }

  /// Selectionne tous les objets du dessin.
  selectAll(): void {
    this.removeSelection();
    this.drawingService.getObjectList().forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  /// Applique une selection sur une liste d'objets fourni.
  setNewSelection(newSelectionList: SVGElement[]): void {
    this.removeSelection();
    newSelectionList.forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  /// Verifie si le curseur se situe a l'interieur de la selection.
  private isInside(x: number, y: number): boolean {
    const rectBox = this.rectSelection.getBoundingClientRect();
    return x >= rectBox.left - this.xFactor() && x <= rectBox.right - this.xFactor() && y >= rectBox.top && y <= rectBox.bottom;
  }

  /// Transforme les chiffre en string suivie de 'px' en number.
  private strToNum(str: string | null): number {
    return str ? +str.replace(/[^-?\d]+/g, ',').split(',').filter((el) => el !== '') : 0;
  }

  /// Transforme la liste de points de controle en un string.
  private pointsToString(): string {
    let pointsStr = '';
    this.pointsList.forEach((point) => {
      pointsStr += `${point.x},${point.y} `;
    });
    return pointsStr.substring(0, pointsStr.length - 1);
  }

  /// Retourne le deplacement de la barre de menu.
  private xFactor(): number {
    return (this.drawingService.drawing as SVGSVGElement).getBoundingClientRect().left;
  }
}
