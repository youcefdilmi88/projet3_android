import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild} from '@angular/core';
import { Socket } from 'socket.io-client';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {

  @ViewChild('chatinput') chatinput:HTMLElement;
  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";
  //"http://localhost:8080/";
  
  @ViewChild('my-message') chatzone: HTMLElement;

  socket:Socket;

  constructor(
    private http: HttpClient,
    private socketService: SocketService
    ) { }

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  sendchatinput(text:String) {
    console.log("string to send "+text);
    const currentTime = Date.now();

    const datepipe: DatePipe = new DatePipe('en-US')
    let formattedDate = datepipe.transform(currentTime, 'dd-MMM-YYYY HH:mm:ss')

    this.socketService.getSocket().emit("msg", {id: this.socketService.getSocket().id, time: formattedDate, mesg: text});

    this.socketService.getSocket().on("room1", (data)=>{
      var html = 
      '<div class= "message-box my-message-box">' +
      '<div class="message my-message"> ' + "id " + data.id + " time " + data.time + ' </div>' +
      '<div class="seperator"></div>' + " mesg " + data.mesg
      '</div>';

      document.getElementById("message-area")!.innerHTML += `${html}`;
      console.log(data);
    });
  }

  createRoom(roomName: string) {
    this.socket.emit("CREATE_ROOM", {roomName});
  }

  public userDataCall() {
    let link=this.BASE_URL+"userData/msg";

    this.http.post<any>(link,{msg:"sjdakjsd",user:"admin"}).subscribe((data: any) => {
      console.log(data);
    });
  }
}
