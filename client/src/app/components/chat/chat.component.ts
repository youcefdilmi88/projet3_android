import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
//import { RoomsComponent } from '../rooms/rooms.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { URL } from '../../../../constants';
import { BaseShapeInterface } from '@app/interfaces/BaseShapeInterface';
import { checkLine } from '@app/interfaces/LineInterface';
import { checkEllipse } from '@app/interfaces/EllipseInterface';
import { checkRectangle } from '@app/interfaces/RectangleInterface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilledShape } from '@app/services/tools/tool-rectangle/filed-shape.model';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {
  @ViewChild('chatinput') input: any;
  private readonly BASE_URL: string = URL;

  public message = new Array<string>();
  public others = new Array<string>();
  public time = new Array<string>();


  renderer: Renderer2;
  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;

  private rectangle2: SVGRectElement;
  public rectangleAttributes: FilledShape;

  public ellipseAttributes: FilledShape;


  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private router: Router,
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

  ngAfterViewInit(): void {  
    console.log("start");
    this.reDraw();
    console.log("end");
    let link=this.BASE_URL+"message/getRoomMessages/" + `${this.socketService.currentRoom}`;  
    console.log("CHECK MOI HEHE:" + this.socketService.currentRoom);
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MM-yyyy HH:mm:ss') as string;

        if (this.socketService.nickname == data[i].nickname) {
          this.others.push(formattedDate);
          this.others.push(data[i].nickname);
          this.others.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          this.others.push("\n");
          this.message.push("");
          this.message.push("");
          this.message.push("");
          this.message.push("\n");

        }

        if (this.socketService.nickname != data[i].nickname) {
          this.message.push(formattedDate);
          this.message.push(data[i].nickname);
          this.message.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          this.message.push("\n");
          this.others.push("");
          this.others.push("");
          this.others.push("");
          this.others.push("\n");
        }
      }
    });

    this.socketService.getSocket().on("MSG", (data)=>{
      data = JSON.parse(data);
      console.log("socket room " + this.socketService.currentRoom.trim());
      console.log("data room " + data.roomName);
      if (data.roomName == this.socketService.currentRoom.slice(8).trim()) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;
        this.message.push(formattedDate);
        this.message.push(data.msg.nickname);
        this.message.push(data.msg.message.replace(/(\r\n|\n|\r)/gm, " "));
        this.message.push("\n");
        this.others.push("");
        this.others.push("");
        this.others.push("");
        this.others.push("\n");
      }
      else if (data.roomName == this.socketService.currentRoom.trim()) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;
        this.message.push(formattedDate);
        this.message.push(data.msg.nickname);
        this.message.push(data.msg.message.replace(/(\r\n|\n|\r)/gm, " "));
        this.message.push("\n");
        this.others.push("");
        this.others.push("");
        this.others.push("");
        this.others.push("\n");
      }
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  leaveDrawing() {
    let link = this.BASE_URL + "drawing/leaveDrawing";

    this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
      if(data.message == "succeful") {
        console.log("EXITED DRAWING" + data.useremail);
      }
    });
  }

  changeRoom(): void {
    //this.dialog.open(RoomsComponent, { disableClose: true });
    this.router.navigate(['/', 'rooms']);
    this.leaveDrawing();
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim() != '') {
      const msg = { time: currentTime, nickname: this.socketService.nickname, message: text.trim() };
      //const mesg = { roomName: this.socketService.currentRoom, msg: { time: currentTime, nickname: this.socketService.nickname, message: text.trim() }};
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(currentTime, 'dd-MM-yyyy HH:mm:ss') as string;
      this.others.push(formattedDate);
      this.others.push(this.socketService.nickname);
      this.others.push(text.toString().trim().replace(/(\r\n|\n|\r)/gm, " "));
      this.others.push("\n");
      this.message.push("");
      this.message.push("");
      this.message.push("");
      this.message.push("\n");

      this.socketService.getSocket().emit("MSG",JSON.stringify(msg));

      this.input.nativeElement.value = ' ';
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    this.input.nativeElement.focus();
  }

  public userDataCall() {
    let link=this.BASE_URL + "userData/msg";

    this.http.post<any>(link,{ msg:"sjdakjsd",user:"admin" }).subscribe((data: any) => {
      console.log(data);
    });
  }

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
    this.renderer.setStyle(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
    this.renderer.setAttribute(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
    this.renderer.setStyle(this.rectangle2, 'fillOpacity', this.rectangleAttributes!.fillOpacity);
    this.renderer.setStyle(this.rectangle2, 'strokeOpacity', this.rectangleAttributes!.strokeOpacity);
    this.drawingService.addObject(this.rectangle2);
    console.log("BITCH");
  }

  reDraw (): void {
    let drawingObj = this.drawingTempSerivce.drawings.get(this.socketService.currentRoom);
    drawingObj?.getElementsInterface().forEach((element:BaseShapeInterface)=>{
      if(checkLine(element)) {
        // this.pencilToolService.pencil = element;
        // // console.log(this.pencilToolService.pencil);
        // // console.log(element);
        // this.pencilToolService.renderSVG();
      }
      if(checkEllipse(element)) {
        this.toolEllipseService.ellipseAttributes = element;
        this.toolEllipseService.renderSVG();
      }
      if(checkRectangle(element)) {
        // this.rectangleAttributes = {
        //   id: element.id,
        //   user: element.user,
        //   x:element.x,
        //   y:element.y,
        //   width:element.width,
        //   height:element.height,
        //   strokeWidth: element.strokeWidth,
        //   fill: element.fill,
        //   stroke: element.stroke,
        //   fillOpacity: element.fillOpacity,
        //   strokeOpacity: element.strokeOpacity,
        // };

        // this.setStyle(
        //   element.fill,
        //   element.strokeOpacity,
        //   element.stroke,
        //   element.fillOpacity,
        // );
        // this.renderRectangleSVG();
        this.toolRectangleService.rectangleAttributes = element;
        this.toolRectangleService.renderSVG();
      }
  });
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

    this.leaveDrawing()
  }
}
