import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chattest',
  templateUrl: './chattest.component.html',
  styleUrls: ['./chattest.component.scss']
})
export class ChattestComponent implements AfterViewInit {

  @ViewChild('username') username:ElementRef;
  @ViewChild('password') password:ElementRef;
  @ViewChild('chatinput') chatinput:HTMLElement;
  private readonly BASE_URL: string ="http://localhost:8080/";
  //"https://projet3-3990-207.herokuapp.com/";
  //"http://localhost:8080/";

  socket:Socket;
  email:string;
  name:string;

  constructor(private http: HttpClient) { }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  login() {
    let link=this.BASE_URL+"user/loginUser";
    let username:String=this.username.nativeElement.value as String;
    let password:String=this.password.nativeElement.value as String;
  
    console.log(username);
    console.log(password);
    
    this.http.post<any>(link,{useremail:username,password:password}).subscribe((data: any) => {
      console.log(data.message);
      if(data.message=="success") {
        this.email=data.useremail;
        this.name=data.nickname;
        this.connectSocket();
      }
    });
    
  }

  connectSocket() {
    this.socket=io(this.BASE_URL, {
      reconnectionAttempts: 2,
      transports : ['websocket'],
      query:{useremail:this.email}
    })

    //this.email=Date.now().toString()+"@hotmail.ca";

    this.socket.on("connected",(data)=>{
      console.log(data);
    })

    this.socket.emit("connection",{useremail:this.email});
    this.socket.on("MSG", (data)=>{
      console.log(JSON.stringify(data));
    });

    this.socket.on("ROOM_CREATED", (data)=>{
      console.log(data);
    });
  }

  logout() {
    let link=this.BASE_URL+"user/logoutUser";

    console.log(this.email);

    this.socket.on("DISCONNECT",(data)=>{
      console.log(data);
    });
    this.socket.emit("DISCONNECT",JSON.stringify({useremail:this.email}));

    this.http.post<any>(link,{useremail:this.email}).subscribe((data: any) => {
      console.log(data);
    });
  }

 

  sendchatinput(text:String) {
    console.log("string to send "+text);
    const currentTime=Date.now();
    const msg={time:currentTime,nickname:this.name,message:text}
    this.socket.emit("MSG",JSON.stringify(msg));
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

