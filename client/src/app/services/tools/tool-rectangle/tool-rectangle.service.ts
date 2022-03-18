import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faSquareFull } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
// import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { FilledShape } from './filed-shape.model';
// import { RectangleCommand } from './rectangle-command';
import { SocketService } from '@app/services/socket/socket.service';

/// Outil pour créer des rectangle, click suivis de bouge suivis de relache crée le rectangle
/// et avec shift créer un carrée
@Injectable({
  providedIn: 'root',
})
export class ToolRectangleService implements Tools {
  readonly faIcon: IconDefinition = faSquareFull;
  readonly toolName = 'Outil Rectangle';
  readonly id = ToolIdConstants.RECTANGLE_ID;
  private identif: string;

  private rectangle2: SVGRectElement;
  private rectangleAttributes: FilledShape;


  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;

  private isSquare = false;

  private x: number;
  private y: number;

  renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private socketService:SocketService,
    //private rendererService: RendererProviderService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.rectStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      rectStyle: this.rectStyle,
    });
  }

  setUpRectangle() {
    console.log("rectangle set up completed");

    this.socketService.getSocket().on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      console.log(data);
      console.log("STARTRECTANGLE");
      this.rectangleAttributes={
        id:data.id,
        x:data.x,
        y:data.y,
        width:data.width,
        height:data.height,
        strokeWidth: data.strokeWidth,
        fill: data.fill,
        stroke: data.stroke,
        fillOpacity: data.fillOpacity,
        strokeOpacity: data.strokeOpacity,
      };
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

    this.socketService.getSocket().on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      if (this.rectangleAttributes.id == this.identif) {
        this.setSize(data.x as number, data.y as number);
      }
      //this.setSize(data.x as number, data.y as number);
    });

    this.socketService.getSocket().on("ENDRECTANGLE",(data)=>{
      console.log(data);
      console.log("ENDRECTANGLE");
    });
  }

  renderSVG(): void {
      console.log("RENDERED RECTANGLE");
      this.rectangle2 = this.renderer.createElement('rect', 'svg');
      this.renderer.setAttribute(this.rectangle2, 'x', this.rectangleAttributes.x.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'y', this.rectangleAttributes.y.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'width', this.rectangleAttributes.width.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'height', this.rectangleAttributes.height.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'stroke-width', (this.rectangleAttributes!.strokeWidth).toString() + 'px');
      this.renderer.setStyle(this.rectangle2, 'fill', this.rectangleAttributes!.fill);
      this.renderer.setStyle(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
      this.renderer.setStyle(this.rectangle2, 'fillOpacity', this.rectangleAttributes!.fillOpacity);
      this.renderer.setStyle(this.rectangle2, 'strokeOpacity', this.rectangleAttributes!.strokeOpacity);
      this.drawingService.addObject(this.rectangle2);
  }


  /// Quand le bouton de la sourie est enfoncé, on crée un rectangle et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === LEFT_CLICK) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      //this.x = offset.x;
      //this.y = offset.y;
      let rectangleObj: FilledShape;
      rectangleObj = {
        id:"",
        x: offset.x, 
        y: offset.y,
        width: 0, height: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };
      rectangleObj!.stroke = this.colorTool.primaryColorString;
      rectangleObj!.fill = this.colorTool.secondaryColorString;
      this.socketService.getSocket().emit("STARTRECTANGLE",JSON.stringify(rectangleObj));
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
    this.socketService.getSocket().emit("ENDRECTANGLE", JSON.stringify(this.rectangleAttributes));
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    //const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    //this.setSize(offset.x, offset.y);
    if(event.button === LEFT_CLICK) {
      this.socketService.getSocket().emit("DRAWRECTANGLE",JSON.stringify(this.offsetManager.offsetFromMouseEvent(event)));
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
    if (!this.rectangle2 || !this.rectangleAttributes) {
      return;
    }
    let strokeFactor = 0;
    if (this.rectangleAttributes.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
    }

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

    if (this.isSquare) {
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

    this.rectangleAttributes.x = (width - strokeFactor) <= 0 ? xValue + strokeFactor / 2 + (width - strokeFactor) : xValue + strokeFactor / 2;
    if (this.rectangle2) {
      this.renderer.setAttribute(this.rectangle2, 'x', this.rectangleAttributes.x.toString() + 'px');
    }
    this.rectangleAttributes.y = (height - strokeFactor) <= 0 ? yValue + strokeFactor / 2 + (height - strokeFactor) : yValue + strokeFactor / 2
    if (this.rectangle2) {
      this.renderer.setAttribute(this.rectangle2, 'y', this.rectangleAttributes.y.toString() + 'px');
    }
    this.rectangleAttributes.height = (height - strokeFactor) <= 0 ? 1 : (height - strokeFactor);
    if (this.rectangle2) {
      this.renderer.setAttribute(this.rectangle2, 'height', this.rectangleAttributes.height.toString() + 'px');
    }
    this.rectangleAttributes.width = (width - strokeFactor) <= 0 ? 1 : (width - strokeFactor);
    if (this.rectangle2) {
      this.renderer.setAttribute(this.rectangle2, 'width', this.rectangleAttributes.width.toString() + 'px');
    }
  }

  /// Pour definir le style du rectangle (complet, contour, centre)
  private setStyle(primaryColor: string, primaryAlpha: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.rectangleAttributes) {
      return;
    }
    switch (this.rectStyle.value) {
      case 'center':
        this.rectangleAttributes.fill = primaryColor;
        this.rectangleAttributes.fillOpacity = primaryAlpha;
        this.rectangleAttributes.stroke = 'none';
        this.rectangleAttributes.strokeOpacity = 'none';
        break;

      case 'border':
        this.rectangleAttributes.fill = 'none';
        this.rectangleAttributes.fillOpacity = 'none';
        this.rectangleAttributes.stroke = secondaryColor;
        this.rectangleAttributes.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.rectangleAttributes.fill = primaryColor;
        this.rectangleAttributes.fillOpacity = primaryAlpha;
        this.rectangleAttributes.stroke = secondaryColor;
        this.rectangleAttributes.strokeOpacity = secondaryAlpha;
        break;
    }
  }

}
