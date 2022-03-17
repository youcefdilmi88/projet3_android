import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SocketService } from '@app/services/socket/socket.service';
// import { EllipseCommand } from './ellipse-command';

/// Outil pour créer des ellipse, click suivis de bouge suivis de relache crée l'ellipse
/// et avec shift créer un cercle
@Injectable({
  providedIn: 'root',
})
export class ToolEllipseService implements Tools {
  readonly faIcon: IconDefinition = faCircle;
  readonly toolName = 'Outil Ellipse';
  readonly id = ToolIdConstants.ELLIPSE_ID;

  // private ellipse: FilledShape | null;
  // private ellipseCommand: EllipseCommand | null;
  private ellipse2: SVGEllipseElement;
  private ellipseAttributes: FilledShape;
  private identif: string;

  private contour: SVGRectElement | null;
  // private contourId: number;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private ellipseStyle: FormControl;

  private isCircle = false;
  // private oldX = 0;
  // private oldY = 0;
  private x: number;
  private y: number;

  renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private socketService: SocketService,
    private rendererService: RendererProviderService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.ellipseStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      ellipseStyle: this.ellipseStyle,
    });
  }

  setUpEllipse() : void {
    this.socketService.getSocket().on("STARTELLIPSE", (data) => {
      data = JSON.parse(data);
      this.ellipseAttributes = {
        id: data.id,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        strokeWidth: data.strokeWidth,
        fill: data.fill,
        stroke: data.stroke,
        fillOpacity: data.fillOpacity,
        strokeOpacity: data.strokeOpacity
      }
      this.identif = data.id;
      this.x = data.x;
      this.y = data.y;
      this.setStyle(
        data.fill,
        data.strokeOpacity,
        data.stroke,
        data.fillOpacity,
      ); 
      this.renderSVG();
    });
    this.socketService.getSocket().on("DRAWELLIPSE", (data) => {
      data = JSON.parse(data);
      if(this.ellipseAttributes.id == this.identif) {
        this.setSize(data.x as number, data.y as number);
      }
    });
    this.socketService.getSocket().on("ENDELLIPSE", (data) => {

    });
  }


  renderSVG(): void {
    this.ellipse2 = this.renderer.createElement('ellipse', 'svg');
    this.renderer.setAttribute(this.ellipse2, 'cx', this.ellipseAttributes.x.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'cy', this.ellipseAttributes.y.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'width', this.ellipseAttributes.width.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'height', this.ellipseAttributes.height.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'rx', (this.ellipseAttributes.width / 2).toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'ry', (this.ellipseAttributes.height / 2).toString() + 'px');
    this.renderer.setStyle(this.ellipse2, 'stroke-width', this.ellipseAttributes!.strokeWidth.toString() + 'px');
    this.renderer.setStyle(this.ellipse2, 'fill', this.ellipseAttributes!.fill);
    this.renderer.setStyle(this.ellipse2, 'stroke', this.ellipseAttributes!.stroke);
    this.renderer.setStyle(this.ellipse2, 'fillOpacity', this.ellipseAttributes!.fillOpacity);
    this.renderer.setStyle(this.ellipse2, 'strokeOpacity', this.ellipseAttributes!.strokeOpacity);
    this.drawingService.addObject(this.ellipse2);
}

  /// Quand le bouton de la sourie est enfoncé, on crée un ellipse et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === LEFT_CLICK) {
      this.contour = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(this.contour, 'stroke', `rgba(0, 0, 0, 1)`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-dasharray', `10,10`);
      this.rendererService.renderer.setStyle(this.contour, 'd', `M5 40 l215 0`);
      this.rendererService.renderer.setStyle(this.contour, 'fill', `none`);
      // if (this.contour) {
      //   this.contourId = this.drawingService.addObject(this.contour);
      // }

      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      // this.oldX = offset.x;
      // this.oldY = offset.y;

      let ellipse: FilledShape;
      ellipse = {
        id: "",
        x: offset.x, y: offset.y,
        width: 0, height: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };
      ellipse!.stroke = this.colorTool.primaryColorString;
      ellipse!.fill = this.colorTool.secondaryColorString;

      this.socketService.getSocket().emit("STARTELLIPSE", JSON.stringify(ellipse));

      }
       if(event.button === RIGHT_CLICK) {
        this.setStyle(
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
        );  

      }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(event: MouseEvent): ICommand | void {
    this.socketService.getSocket().emit("ENDELLIPSE",JSON.stringify(this.ellipseAttributes));
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    if(event.button === LEFT_CLICK) {
      this.socketService.getSocket().emit("DRAWELLIPSE", JSON.stringify(this.offsetManager.offsetFromMouseEvent(event)));
    }

  }

  /// Verification de la touche shift
  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    return;
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Transforme le size de l'objet courrant avec un x et un y en entrée
  private setSize(mouseX: number, mouseY: number): void {
    if (!this.ellipse2 || !this.ellipseAttributes) {
      return;
    }
    let strokeFactor = 0;
    if (this.ellipseAttributes.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
    }

    // this.oldX = mouseX;
    // this.oldY = mouseY;

    let width = Math.abs(mouseX - this.x);
    let height = Math.abs(mouseY - this.y);
    let xValue = this.x;
    let yValue = this.y;

    if (mouseY < this.y) {
      yValue = mouseY;
    }
    if (mouseX < this.x) {
      xValue = mouseX;
    }

    if (this.isCircle) {
      const minSide = Math.min(width, height);
      if (mouseX < this.x) {
        xValue += (width - minSide);
      }
      if (mouseY < this.y) {
        yValue += (height - minSide);
      }
      width = minSide;
      height = minSide;
    }
    xValue += width / 2;
    yValue += height / 2;

    this.ellipseAttributes.x = xValue;
    if (this.ellipse2) {
      this.renderer.setAttribute(this.ellipse2, 'cx', this.ellipseAttributes.x.toString() + 'px');
    }
    this.ellipseAttributes.y = yValue;
    if (this.ellipse2) {
      this.renderer.setAttribute(this.ellipse2, 'cy', this.ellipseAttributes.y.toString() + 'px');
    }
    this.ellipseAttributes.height = (height - strokeFactor) <= 0 ? 1 : (height - strokeFactor);
    if (this.ellipse2) {
      this.renderer.setAttribute(this.ellipse2, 'height', this.ellipseAttributes.height.toString() + 'px');
      this.renderer.setAttribute(this.ellipse2, 'ry', (this.ellipseAttributes.height / 2).toString() + 'px');
    }
    this.ellipseAttributes.width = (width - strokeFactor) <= 0 ? 1 : (width - strokeFactor);
    if (this.ellipse2) {
      this.renderer.setAttribute(this.ellipse2, 'width', this.ellipseAttributes.width.toString() + 'px');
      this.renderer.setAttribute(this.ellipse2, 'rx', (this.ellipseAttributes.width / 2).toString() + 'px');
    }

    // this.ellipseCommand.setCX(xValue);
    // this.ellipseCommand.setCY(yValue);
    // this.ellipseCommand.setHeight((height - strokeFactor) <= 0 ? 1 : (height - strokeFactor));
    // this.ellipseCommand.setWidth((width - strokeFactor) <= 0 ? 1 : (width - strokeFactor));

    this.rendererService.renderer.setAttribute(this.contour, 'x', (xValue - width / 2).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'y', (yValue - height / 2).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'width', (width).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'height', (height).toString());
  }

  /// Ajustement du style de l'ellipse
  private setStyle(primaryColor: string, primaryAlphas: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.ellipseAttributes) {
      return;
    }
    switch (this.ellipseStyle.value) {
      case 'center':
        this.ellipseAttributes.fill = primaryColor;
        this.ellipseAttributes.fillOpacity = primaryAlphas;
        this.ellipseAttributes.stroke = 'none';
        this.ellipseAttributes.strokeOpacity = 'none';
        break;

      case 'border':
        this.ellipseAttributes.fill = 'none';
        this.ellipseAttributes.fillOpacity = 'none';
        this.ellipseAttributes.stroke = secondaryColor;
        this.ellipseAttributes.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.ellipseAttributes.fill = primaryColor;
        this.ellipseAttributes.fillOpacity = primaryAlphas;
        this.ellipseAttributes.stroke = secondaryColor;
        this.ellipseAttributes.strokeOpacity = secondaryAlpha;
        break;
    }
  }
}

