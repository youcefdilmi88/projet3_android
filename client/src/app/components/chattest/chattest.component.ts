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
  currentRoom:string;

  constructor(private http: HttpClient) { }
  ngAfterViewInit(): void {
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  login() {
    let link=this.BASE_URL+"user/loginUser";
    let name:String=this.username.nativeElement.value as String;
    let pass:String=this.password.nativeElement.value as String;
  
    console.log(name);
    console.log(pass);
    
    this.http.post<any>(link,{useremail:name,password:pass}).subscribe((data: any) => {
      console.log("message:"+data.message);
      console.log("first:"+data.currentRoom);
      if(data.message=="success") {
        this.getAllRoom();
        this.email=data.user.useremail;
        this.name=data.user.nickname;
        this.currentRoom=data.currentRoom;
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
      data=JSON.parse(data)
      console.log(data);
    })

    this.socket.emit("connection",{useremail:this.email});
    this.socket.on("MSG", (data)=>{
      console.log(data);
    });

  }

  logout() {
    let link=this.BASE_URL+"user/logoutUser";

    console.log(this.email);

    this.socket.on("DISCONNECT",(data)=>{
      data=JSON.parse(data);
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

  getAllRoom() {
    let link:string=this.BASE_URL+"room/getAllRooms";
    this.http.get<any>(link).subscribe((data: any) => {
      data.forEach((room:any)=>{

        console.log( document.getElementById('rooms')?.children)
        let button=document.createElement('BUTTON');
        button.innerHTML=room.roomName;
        console.log("each room "+room.roomName);
        //button.nodeValue=room.roomName;
        button.addEventListener("click",()=>{
          console.log("event listener:"+button.innerHTML as string);
          this.joinRoom(button.innerHTML as string);
        })
        document.getElementById('rooms')?.appendChild(button);
        
    
      })
    })
  }

 joinRoom(roomName:string) {
   console.log(roomName);
   console.log("current room:"+this.currentRoom);
   this.socket.on("JOINROOM",(data)=>{
    data=JSON.parse(data);
    console.log(data);
    this.currentRoom=data.currentRoomName;
  });
  const newRoom={newRoomName:roomName,oldRoomName:this.currentRoom,useremail:this.email};
  this.socket.emit("JOINROOM",JSON.stringify(newRoom));
 }

  createRoom(roomName: string) {
    let link=this.BASE_URL+"room/createRoom";
    this.http.post<any>(link,{roomName:roomName,creator:this.email}).subscribe((data: any) => {
      this.getAllRoom();
    });
  }

  public userDataCall() {
    let link=this.BASE_URL+"userData/msg";

    this.http.post<any>(link,{msg:"sjdakjsd",user:"admin"}).subscribe((data: any) => {
      console.log(data);
    });
  }


}



