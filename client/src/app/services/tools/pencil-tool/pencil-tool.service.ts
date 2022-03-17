import { Injectable, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faPencilAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { Pencil } from './pencil.model';
import { Renderer2 } from '@angular/core';
import { Point } from 'src/app/model/point.model';
import { SocketService } from '@app/services/socket/socket.service';


/// Service de l'outil pencil, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: 'root',
})
export class PencilToolService implements Tools {
  readonly toolName = 'Outil Crayon';
  readonly faIcon: IconDefinition = faPencilAlt;
  readonly id = ToolIdConstants.PENCIL_ID;
  private strokeWidth: FormControl;
  private pencil: Pencil | null;
  private dot: SVGCircleElement | null = null;
  private pencil2: SVGPolylineElement | null = null;
  parameters: FormGroup;
  private identif: string;


  renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private socketService:SocketService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
    });

  }

  setUpPencil() {
    console.log("pencil set up completed");

    this.socketService.getSocket().on("STARTLINE",(data)=>{
      data=JSON.parse(data);
      console.log(data);
      console.log("STARTLINE");
      this.pencil={
        id:data.id,
        //user: data.user,
        pointsList:data.pointsList,
        strokeWidth:data.strokeWidth,
        fill:data.fill,
        stroke:data.stroke,
        fillOpacity:data.fillOpacity,
        strokeOpacity:data.strokeOpacity,
      };
      this.identif = data.id;
      
      /*if (data.user == this.socketService.nickname) {
        this.pencil.id = data.id as string;
      }*/

      console.log("shapeid:",this.pencil.id);
      console.log("renderSVG");
      this.renderSVG();
    });

    this.socketService.getSocket().on("DRAWLINE",(data)=>{
      data=JSON.parse(data);
      //if (this.identif == data.shapeId) {
        if (this.identif == this.pencil?.id) {
        //this.addPointToLine({x:data.point.x, y:data.point.y} as Point);
        this.addPointToLine({x:data.x, y:data.y} as Point);
      }
      //this.addPointToLine({x:data.x,y:data.y} as Point);
    });

    this.socketService.getSocket().on("ENDLINE",()=>{
      console.log("ENDLINE");
    });

  }

  renderSVG(): void {
    console.log("GOT RENDERED");
    //FOR A DOT
    if (this.pencil!.pointsList.length <= 1) {
      console.log("dot");
      this.dot = this.renderer.createElement('circle', 'svg') as SVGCircleElement;
      this.renderer.setAttribute(this.dot,'id',this.pencil?.id as string);
      this.renderer.setAttribute(this.dot, 'cx', this.pencil!.pointsList[0].x.toString() + 'px');
      this.renderer.setAttribute(this.dot, 'cy', this.pencil!.pointsList[0].y.toString() + 'px');
      this.renderer.setAttribute(this.dot, 'r', (this.pencil!.strokeWidth / 2).toString() + 'px');
      this.renderer.setStyle(this.dot, 'fill', this.pencil!.stroke);
      this.renderer.setStyle(this.dot, 'fillOpacity', this.pencil!.strokeOpacity);
      this.drawingService.addObject(this.dot);
    }
    //FOR A LINE
    else {
      console.log("line");
      this.pencil2 = this.renderer.createElement('polyline', 'svg') as SVGPolylineElement;
      this.renderer.setAttribute(this.pencil2,'id',this.pencil?.id as string);
      this.renderer.setAttribute(this.pencil2, 'points', this.pointString());
      this.renderer.setAttribute(this.pencil2, 'stroke-width', (this.pencil!.strokeWidth).toString() + 'px');
      this.renderer.setStyle(this.pencil2, 'fill', this.pencil!.fill);
      this.renderer.setStyle(this.pencil2, 'stroke', this.pencil!.stroke);
      this.renderer.setStyle(this.pencil2, 'fillOpacity', this.pencil!.fillOpacity);
      this.renderer.setStyle(this.pencil2, 'strokeOpacity', this.pencil!.strokeOpacity);
      this.drawingService.addObject(this.pencil2);
    }
  }

  private pointString(): string {
    let pointString = "";
    for (const point of this.pencil!.pointsList) {
        pointString += `${point.x} ${point.y},`;
    }
    return pointString.substring(0, pointString.length - 1);
  }

  addPointToLine(point: Point): void {
    console.log(point);
    this.pencil?.pointsList?.push(point);
    if (this.pencil!.pointsList.length > 1 && this.dot) {
        this.renderSVG();
    }
}

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    // START TO DRAW
    if (event.button === LEFT_CLICK) {
      if (this.strokeWidth.valid) {
       const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        // INITIALISE PENCIL
        //this.pencil
        let pencilObj = {
          id:"",
          //user: this.socketService.nickname,
          pointsList:[offset],
          strokeWidth: this.strokeWidth.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        };
        //pencilObj.pointsList?.push({x:offset.x as number,y:offset.y as number});

        //this.pencil
        pencilObj!.stroke = this.colorTool.primaryColorString;
        //this.pencil
        pencilObj!.strokeOpacity = this.colorTool.primaryAlpha.toString();

        this.socketService.getSocket().emit("STARTLINE",JSON.stringify(pencilObj));
      }
    }
    // FOR CHOOSING COLOR ON SIDEBAR
    if (event.button === RIGHT_CLICK) {
      this.pencil!.stroke = this.colorTool.primaryColorString;
      this.pencil!.strokeOpacity = this.colorTool.primaryAlpha.toString();
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void | ICommand {
    this.socketService.getSocket().emit("ENDLINE",JSON.stringify(this.pencil));
    return;
  }

  /// Ajout d'un point selon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if(event.button === LEFT_CLICK) {
      this.socketService.getSocket().emit("DRAWLINE",JSON.stringify(this.offsetManager.offsetFromMouseEvent(event)));
      //this.socketService.getSocket().emit("DRAWLINE",JSON.stringify({ point:this.offsetManager.offsetFromMouseEvent(event), shapeId:this.id } ));
    }  
  }

  onKeyUp(event: KeyboardEvent): void {
    return;
  }
  onKeyDown(event: KeyboardEvent): void {
    return;
  }
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
}