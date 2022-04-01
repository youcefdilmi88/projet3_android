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
// import { BaseShapeInterface } from '@app/interfaces/BaseShapeInterface';
// import { checkLine } from '@app/interfaces/LineInterface';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
// import { checkEllipse } from '@app/interfaces/EllipseInterface';
// import { checkRectangle } from '@app/interfaces/RectangleInterface';
import { FilledShape } from '@app/services/tools/tool-rectangle/filed-shape.model';
// import { DrawingService } from '@app/services/drawing/drawing.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { Point } from 'src/app/model/point.model';
import { Pencil } from '@app/services/tools/pencil-tool/pencil.model';
import { French, English } from '@app/interfaces/Langues';


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
  public nbrMembres:Array<number> = [];
  public centerImage: number = 0;
  public leftImage: number = this.imageUrlArray.length - 1;
  public rightImage: number = 1;
  public bool: boolean = true;
  public numberOfDrawings: number;

  renderer: Renderer2;
  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;
  public pencil: Pencil | null;
  public rectangleAttributes: FilledShape;

  public drawingTitle: string;
  public drawingInput: string;
  public creaDrawing: string;
  public drawName: string;
  public numberOfPeople: string;
  public own: string;
  public visib: string;
  public open: string;
  public delete: string;

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
    // private drawingService: DrawingService,
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
    if(this.socketService.language == "french") {
      this.drawingTitle = French.drawingTitle;
      this.drawingInput = French.drawingInput;
      this.creaDrawing = French.createDrawing;
      this.drawName = French.drawingName;
      this.numberOfPeople = French.numberOfPeople;
      this.own = French.owner;
      this.visib = French.visibility;
      this.open = French.open;
      this.delete = French.delete;
    }
    else {
      this.drawingTitle = English.drawingTitle;
      this.drawingInput = English.drawingInput;
      this.creaDrawing = English.createDrawing;
      this.drawName = English.drawingName;
      this.numberOfPeople = English.numberOfPeople;
      this.own = English.owner;
      this.visib = English.visibility;
      this.open = English.open;
      this.delete = English.delete;
    }
    
    this.getAllDrawings();
    this.roomListerner();
    this.redirect();
    this.loadImages();
  }


  roomListerner() {
    // let link3 = this.BASE_URL + "drawing/getAllDrawings";

    this.socketService.getSocket().on("DRAWINGDELETED", (data) => {
      this.getAllDrawings();
      // console.log("HELLO?????");
      // data = JSON.parse(data);
      // this.names = [];
      // this.owners = [];
      // this.visibite = [];
      // this.imageUrlArray = [];
      // this.http.get<any>(link3).subscribe((data: any) => { 
      //   data.forEach((drawing:any)=>{
      //     this.imageUrlArray.push("../../../assets/avatar_1.png");
      //     this.names.push(drawing.drawingName); 
      //     this.owners.push(drawing.owner); 
      //     this.visibite.push(drawing.visibility);
      //   });
      // });
    });

    this.socketService.getSocket().on("JOINDRAWING", (data) => {
      data = JSON.parse(data);
      console.log("JOINED: ", data.drawing.drawingName);
      console.log("members join: ", data.drawing.members);
      this.getAllDrawings();
      // this.nbrMembres = [];

    });

    this.socketService.getSocket().on("LEAVEDRAWING", (data) => {
      data = JSON.parse(data);
      console.log("members left: ", data.drawing.members);
      this.getAllDrawings();
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

    this.socketService.getSocket().on("ALBUMMODIFIED", (data) => {
      data=JSON.parse(data);
      
    
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
    console.log("album name", this.socketService.albumName);
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.names = [];
      this.owners = [];
      this.visibite = [];
      data.forEach((drawing:any)=>{
        this.imageUrlArray.push("../../../assets/avatar_1.png");
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        
        this.names.push(drawing.drawingName); 
        console.log("drawing names:", this.names);
        this.owners.push(drawing.owner);
        this.visibite.push(drawing.visibility);
        this.nbrMembres.push(drawing.members.length);
        console.log("memb", drawing.members);
      });
      
    });
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
        console.log("CA MARCHE OPEN");
        console.log("join dessins:" + element.textContent.trim().slice(7));
        this.router.navigate(['/', 'sidenav']);
        this.dialog.open(NewDrawingComponent);
        console.log("CREATED CANVAS");

      //   let counter:number = 0;
      //   let drawingObj = this.drawingTempSerivce.drawings.get(element.textContent.trim().slice(7));
      //   drawingObj?.getElementsInterface().forEach((element:BaseShapeInterface)=>{
      //     counter++;
      //     if(checkLine(element)) {

      //     }
      //     if(checkEllipse(element)) {
      //       this.toolEllipseService.ellipseAttributes = element;
      //       this.toolEllipseService.renderSVG();
      //     }
      //     if(checkRectangle(element)) {
      //       this.toolRectangleService.rectangleAttributes = element;
      //       this.toolRectangleService.renderSVG();
      //     }
      // });

      // console.log("counter", counter);

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
            console.log("current room;" + this.socketService.currentRoom);
          }
        });
      }
    });
  }

  deleteDessins(element: any): void {
    this.bool = false;
    // if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(10))) {
      console.log("delete dessins:"+ element.textContent.trim().slice(10));
      let link2 = this.BASE_URL + "drawing/deleteDrawing";

      this.http.post<any>(link2, {drawingName: element.textContent.trim().slice(10)}).subscribe((data:any) => {
        if (data.message == "success") {
          console.log("DELETE DRAWING IS " + data);
        }
      });
    // }
  } 

  drawing: string;

  createDrawing(text: string) {
    let link = this.BASE_URL+"drawing/createDrawing";
    let link5 = this.BASE_URL + "drawing/joinDrawing";
    let link6 = this.BASE_URL + "album/addDrawing";
    
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
      this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "private"}).subscribe((data: any) => { 
        console.log(data);
        if (data.message == "success") {
          console.log("CREATE DRAWING: " + data.message);
          
          this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim()}).subscribe((data:any) => {
            if(data.message == "success") {
              this.router.navigate(['/', 'sidenav']);
              this.dialog.open(NewDrawingComponent);
            }
          });

          this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: this.socketService.albumName }).subscribe((data:any) => {
            if (data.message == "success") {
              console.log("dessin ajoute a album " + this.socketService.albumName);
            }
          });

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

  setVisibilityToPrivate(name: string) :  void {
    let link = this.BASE_URL + "drawing/updateDrawing";

    const drawingObj = {
      drawingName: name,
      visibility: "private",
    }

    this.http.post<any>(link,{useremail: this.socketService.email, drawing: drawingObj}).pipe( 
      catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
        // if(data.message == "success") {
        //   console.log("CHANGED VISIBILITY");
        // }
      });
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

  // private setStyle(primaryColor: string, primaryAlpha: string, secondaryColor: string, secondaryAlpha: string): void {
  //   if (!this.rectangleAttributes) {
  //     return;
  //   }
  //   // switch (this.rectStyle.value) {
  //   //   case 'center':
  //   //     this.rectangleAttributes.fill = primaryColor;
  //   //     this.rectangleAttributes.fillOpacity = primaryAlpha;
  //   //     this.rectangleAttributes.stroke = 'none';
  //   //     this.rectangleAttributes.strokeOpacity = 'none';
  //   //     break;

  //   //   case 'border':
  //   //     this.rectangleAttributes.fill = 'none';
  //   //     this.rectangleAttributes.fillOpacity = 'none';
  //   //     this.rectangleAttributes.stroke = secondaryColor;
  //   //     this.rectangleAttributes.strokeOpacity = secondaryAlpha;
  //   //     break;

  //   //   case 'fill':
  //       this.rectangleAttributes.fill = primaryColor;
  //       this.rectangleAttributes.fillOpacity = primaryAlpha;
  //       this.rectangleAttributes.stroke = secondaryColor;
  //       this.rectangleAttributes.strokeOpacity = secondaryAlpha;

  //       // break;
  //   // }
  // }


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
