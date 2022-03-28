import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { BaseShapeInterface } from '@app/interfaces/BaseShapeInterface';
import { checkLine } from '@app/interfaces/LineInterface';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { checkEllipse } from '@app/interfaces/EllipseInterface';
import { checkRectangle } from '@app/interfaces/RectangleInterface';
import { FilledShape } from '@app/services/tools/tool-rectangle/filed-shape.model';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-dessins',
  templateUrl: './dessins.component.html',
  styleUrls: ['./dessins.component.scss']
})
export class DessinsComponent implements OnInit {

  private readonly BASE_URL: string = "https://projet3-3990-207.herokuapp.com/";
  
  imageUrlArray: string[] = [];
  public names:Array<string> = [];
  public owners:Array<string> = [];
  public visibite:Array<string> = [];
  public centerImage: number = 0;
  public leftImage: number = this.imageUrlArray.length - 1;
  public rightImage: number = 1;
  public bool: boolean = true;
  public numberOfDrawings: number ;

  renderer: Renderer2;
  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private socketService: SocketService,
    private http: HttpClient,
    public drawingTempSerivce: DrawingTempService,
    public pencilToolService: PencilToolService,
    public toolEllipseService: ToolEllipseService,
    public toolRectangleService: ToolRectangleService,
    rendererFactory: RendererFactory2,
    private drawingService: DrawingService,
  ) { 
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.rectStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      rectStyle: this.rectStyle,
    });
  }

  ngOnInit(): void {
    this.getAllDrawings();
    this.roomListerner();
    this.redirect();
    this.loadImages();
  }


  roomListerner() {
    let link3 = this.BASE_URL + "drawing/getAllDrawings";

    this.socketService.getSocket().on("DRAWINGDELETED", (data) => {
      console.log("HELLO?????");
      data = JSON.parse(data);
      this.names = [];
      this.owners = [];
      this.visibite = [];
      this.imageUrlArray = [];
      this.http.get<any>(link3).subscribe((data: any) => { 
        data.forEach((drawing:any)=>{
          this.imageUrlArray.push("../../../assets/avatar_1.png");
          this.names.push(drawing.drawingName); 
          this.owners.push(drawing.owner); 
          this.visibite.push(drawing.visibility);
        });
      });
    });

    this.socketService.getSocket().on("JOINDRAWING", (data) => {
      data = JSON.parse(data);
      console.log("JOINED: " + data.drawing.drawingName);
    });

    this.socketService.getSocket().on("DRAWINGCREATED", (data)=> {
      data=JSON.parse(data);
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("VISIBILITYCHANGED", (data) => {
      data=JSON.parse(data);
      let link = this.BASE_URL + "drawing/getAllDrawings";
      this.http.get<any>(link).subscribe((data: any) => {
        this.visibite = [];
        data.forEach((drawing:any)=>{
          this.visibite.push(drawing.visibility);
        });
      });
    });

  }


  redirect() {
    this.bool = true;
    let link = this.BASE_URL+ "drawing/getAllDrawings";
    this.socketService.getSocket().on("DRAWINGDELETED",(data)=>{
      console.log("ADELE");
      data=JSON.parse(data);
      this.http.get<any>(link).subscribe((data: any) => { 

        // data.forEach((drawing:any)=>{
          let length = Object.keys(data).length;
          this.numberOfDrawings = length;
          console.log("this is it my firend: " + this.socketService.currentRoom);
          if(this.bool) {
            // pour redirect les personnes dans rooms
            for(var i = 0; i <= length; i++) { 
              console.log(data[i].drawingName);
              if(this.socketService.currentRoom != data[i].drawingName) {
                this.router.navigate(['/', 'rooms']);
              }
              else if (this.socketService.currentRoom == data[i].drawingName) {
                this.router.navigate(['/', 'sidenav']);
                break;
              }
            }
          }

      });
    });
  }

  getAllDrawings() {
    let link = this.BASE_URL + "drawing/getAllDrawings";
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.names = [];
      this.owners = [];
      this.visibite = [];
      data.forEach((drawing:any)=>{
        this.imageUrlArray.push("../../../assets/avatar_1.png");
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        // this.drawingTempSerivce.drawings.forEach((v,k) => {
        //   if(k == "1") {
        //     v
        //   }
        // });
        console.log("HERE:",data);
        this.names.push(drawing.drawingName); 
        console.log(this.names);
        this.owners.push(drawing.owner);
        console.log(this.owners);
        this.visibite.push(drawing.visibility);
      });
      
    });
  } 

  private rectangle2: SVGRectElement;
  public rectangleAttributes: FilledShape;


  renderRectangleSVG() : void {
    this.rectangle2 = this.renderer.createElement('rect', 'svg');
    this.renderer.setAttribute(this.rectangle2,'id',this.rectangleAttributes?.id as string);
    this.renderer.setAttribute(this.rectangle2, 'x', this.rectangleAttributes.x.toString() + 'px');
    this.renderer.setAttribute(this.rectangle2, 'y', this.rectangleAttributes.y.toString() + 'px');
    this.renderer.setAttribute(this.rectangle2, 'width', this.rectangleAttributes.width.toString() + 'px');
    this.renderer.setAttribute(this.rectangle2, 'height', this.rectangleAttributes.height.toString() + 'px');
    this.renderer.setAttribute(this.rectangle2, 'stroke-width', (this.rectangleAttributes!.strokeWidth).toString() + 'px');
    this.renderer.setStyle(this.rectangle2, 'fill', this.rectangleAttributes!.fill);
    this.renderer.setAttribute(this.rectangle2, 'fill', this.rectangleAttributes!.fill);
    // this.renderer.setStyle(this.rectangle2, 'fill', 'white');
    this.renderer.setStyle(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
    this.renderer.setAttribute(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
    // this.renderer.setStyle(this.rectangle2, 'stroke', 'black');
    this.renderer.setStyle(this.rectangle2, 'fillOpacity', this.rectangleAttributes!.fillOpacity);
    this.renderer.setStyle(this.rectangle2, 'strokeOpacity', this.rectangleAttributes!.strokeOpacity);
    this.drawingService.addObject(this.rectangle2);
    console.log("BITCH");
  }

  openDessins(element: any): void { 
    this.socketService.joinRoom(element.textContent.trim().slice(7));
    this.socketService.currentRoom = element.textContent.trim().slice(7);
    
    let link = this.BASE_URL + "drawing/joinDrawing";

    // const drawingObj = {
    //   drawingName:"",
    //   owner:"",
    //   elements:BaseShapeInterface[],
    //   roomName:"",
    //   members:String[],
    //   visibility:""
    // }
    console.log(element.textContent.trim().slice(7));
    this.http.post<any>(link, {useremail: this.socketService.email, drawingName: element.textContent.trim().slice(7)}).subscribe((data:any) => {
      if(data.message == "success") {
        console.log("join dessins:" + element.textContent.trim().slice(7));
        this.router.navigate(['/', 'sidenav']);
        this.dialog.open(NewDrawingComponent);

        let counter:number = 0;
        let drawingObj = this.drawingTempSerivce.drawings.get(element.textContent.trim().slice(7));
        // let drawingObj = this.drawingTempSerivce.drawings.get("123");
        drawingObj?.getElementsInterface().forEach((element:BaseShapeInterface)=>{
          counter++;
          if(checkLine(element)) {
            //this.pencilToolService.pencil = element;
            // console.log(this.pencilToolService.pencil);
            //console.log(element);
            // this.pencilToolService.renderSVG();
          }
          if(checkEllipse(element)) {
            //this.toolEllipseService.ellipseAttributes = element;
            // this.toolEllipseService.renderSVG();
          }
          if(checkRectangle(element)) {
            this.rectangleAttributes = {
              id: element.id,
              user: element.user,
              x:element.x,
              y:element.y,
              width:element.width,
              height:element.height,
              strokeWidth: element.strokeWidth,
              fill: element.fill,
              stroke: element.stroke,
              fillOpacity: element.fillOpacity,
              strokeOpacity: element.strokeOpacity,
            };

            this.setStyle(
              element.fill,
              element.strokeOpacity,
              element.stroke,
              element.fillOpacity,
            );
            // console.log(this.rectangleAttributes.stroke);
            // console.log(this.rectangleAttributes.fill);
            this.renderRectangleSVG();
            // console.log("VAGIN ELEMENT stroke", element.stroke);
            // console.log("VAGIN ELEMENT fill", element.fill);
            // this.toolRectangleService.rectangleAttributes = element;
            // this.toolRectangleService.renderSVG();
          }
      });

      console.log("counter", counter);

        let link2 = this.BASE_URL + "room/joinRoom";

        const userObj={
          useremail:this.socketService.email,
          nickname:this.socketService.nickname,
        }
    
        this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
          catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
      
          if(data.message == "success") {
            this.socketService.currentRoom = element.textContent.trim().slice(7);
            console.log("socketsERVICE;" + this.socketService.currentRoom);
            console.log("???:" + element.textContent.trim().slice(7));
          }
        });
      }
    });
  }

  deleteDessins(element: any): void {
    this.bool = false;
    if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(10))) {
      console.log("delete dessins:"+ element.textContent.trim().slice(10));
      let link2 = this.BASE_URL + "drawing/deleteDrawing";

      this.http.post<any>(link2, {drawingName: element.textContent.trim().slice(10)}).subscribe((data:any) => {
        if (data.message == "success") {
          console.log("DELETE DRAWING IS " + data);
        }
      });
    }
  } 

  drawing:string;

  createDrawing(text: string) {
    let link = this.BASE_URL+"drawing/createDrawing";

    // this.socketService.getSocket().on("DRAWINGCREATED", (data)=> {
    //   data=JSON.parse(data);
    //   this.getAllDrawings();
    // });

    this.socketService.getSocket().on("CREATEROOM", (data)=> {
      data=JSON.parse(data);
      console.log(data.message);
    });

    text.trim();
    if (text.trim() != '') {
      console.log("cant create");
      this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email}).subscribe((data: any) => { 
        console.log(data);
        if (data.message == "success") {
          console.log("CREATE DRAWING: " + data.message);
          
          this.router.navigate(['/', 'sidenav']);
          this.dialog.open(NewDrawingComponent);

          //------------ Pour join le nouveau room avec le dessin ---------
          this.socketService.joinRoom(this.drawing.trim());
          this.socketService.currentRoom = this.drawing.trim();
          let link2 = this.BASE_URL + "room/joinRoom";

          const userObj={
            useremail:this.socketService.email,
            nickname:this.socketService.nickname,
          }
      
          this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
            catchError(async (err) => console.log("error catched" + err))
          ).subscribe((data: any) => {
        
            if(data.message == "success") {
              this.socketService.currentRoom = this.drawing.trim();
              console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
            }
          });
          //------------------------------------------------------------
        }
      });
    }

  }

  changerPublic(element: any): void {
    let link = this.BASE_URL + "drawing/updateDrawing";

    const drawingObj = {
      drawingName: element.textContent.trim().slice(7),
      visibility: "public",
      // visibility: element.textContent.trim().split(' ')[0],
    }

    this.http.post<any>(link,{useremail: this.socketService.email, drawing: drawingObj}).pipe( 
      catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
        // if(data.message == "success") {
        //   console.log("CHANGED VISIBILITY");
        // }
      });
  }

  private setStyle(primaryColor: string, primaryAlpha: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.rectangleAttributes) {
      return;
    }
    // switch (this.rectStyle.value) {
    //   case 'center':
    //     this.rectangleAttributes.fill = primaryColor;
    //     this.rectangleAttributes.fillOpacity = primaryAlpha;
    //     this.rectangleAttributes.stroke = 'none';
    //     this.rectangleAttributes.strokeOpacity = 'none';
    //     break;

    //   case 'border':
    //     this.rectangleAttributes.fill = 'none';
    //     this.rectangleAttributes.fillOpacity = 'none';
    //     this.rectangleAttributes.stroke = secondaryColor;
    //     this.rectangleAttributes.strokeOpacity = secondaryAlpha;
    //     break;

    //   case 'fill':
        this.rectangleAttributes.fill = primaryColor;
        this.rectangleAttributes.fillOpacity = primaryAlpha;
        this.rectangleAttributes.stroke = secondaryColor;
        this.rectangleAttributes.strokeOpacity = secondaryAlpha;

        // break;
    // }
  }


  // for right button
  rightSideSlide(): void {
    this.leftImage = this.centerImage;
    this.centerImage = this.rightImage;
    if (this.rightImage >= this.imageUrlArray.length - 1) {
        this.rightImage = 0;
    } else {
        this.rightImage++;
    }
    this.loadImages();
  }

  // for left button
  leftSideSlide(): void {
      this.rightImage = this.centerImage;
      this.centerImage = this.leftImage;
      if (this.leftImage === 0) this.leftImage = this.imageUrlArray.length - 1;
      else {
          this.leftImage--;
      }
      this.loadImages();
  }

  loadImages(): void {
    if (this.imageUrlArray.length === 1) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';
    }
    if (this.imageUrlArray.length === 2) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.background = 'url(' + this.imageUrlArray[this.rightImage] + ')';  
    } 
    else {
        const mainView = document.getElementById('mainView');
        mainView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.centerImage] + ')';

        const leftView = document.getElementById('leftView');
        leftView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.leftImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.rightImage] + ')';
    }
}

  logout() {
    let link = this.BASE_URL + "user/logoutUser";

    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });
  }

}
