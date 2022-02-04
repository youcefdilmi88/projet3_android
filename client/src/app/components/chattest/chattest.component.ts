import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild} from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chattest',
  templateUrl: './chattest.component.html',
  styleUrls: ['./chattest.component.scss']
})
export class ChattestComponent implements AfterViewInit {

  @ViewChild('chatinput') chatinput:HTMLElement;
  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";
  //"http://localhost:8080/";

  socket:Socket;

  constructor(private http: HttpClient) { }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  connectSocket() {
    //this.socket=io('http://localhost:8080/', {
    this.socket=io('https://projet3-3990-207.herokuapp.com/', {
      reconnectionAttempts: 2,
      transports : ['websocket'],
    })

    this.socket.on("connected",(data)=>{
      console.log(data);
    })

    this.socket.emit("connection", );
    this.socket.on("room1", (data)=>{
      console.log(data);
    });

    this.socket.on("ROOM_CREATED", (data)=>{
      console.log(data);
    });
  }

  sendchatinput(text:String) {
    //console.log("string to send "+text);
    //this.userDataCall();

    this.socket.emit("msg",text);
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

