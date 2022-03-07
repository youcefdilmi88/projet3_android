import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
//import { UserService } from '@app/services/fetch-users/user.service';


@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;
  public nickname: string;
  public email: string;
  public isConnected: boolean;
  public currentRoom: string;
  //private userService: UserService;

  constructor() { }

  initSocket(): void {
    console.log("socket initiation");
    this.socket=io('https://projet3-3990-207.herokuapp.com/', {
      reconnectionAttempts: 2,
      transports : ['websocket'],
      query:{useremail:this.email}
    })
    this.socket.on("connected",(data)=>{
      console.log(data);
    })
  
    const user = { useremail: this.email };
    this.socket.emit("connection", JSON.stringify(user));
  }

  disconnectSocket() {
    this.socket.on("DISCONNECT",(data)=>{  // event pour deconnecter le socket d'un user
      data=JSON.parse(data);  // data={message:"success"}
      console.log("disconnect");
      console.log(data);
    });

    const user = { useremail: this.email }
    this.socket.emit("DISCONNECT",JSON.stringify(user));
  }

  joinRoom(room: string) {
    this.socket.on("JOINROOM",(data)=>{  // evenement pour join un room
      data=JSON.parse(data);           // OUBLIER PAS DE PARSE direct quand vous recevez 
      console.log(data);
      //this.currentRoom = data.currentRoomName;
    });
    const newRoom = { newRoomName: room, oldRoomName: this.currentRoom, useremail:this.email};
    console.log(room);
    console.log(this.currentRoom.trim());
    console.log(this.email);
    this.socket.emit("JOINROOM",JSON.stringify(newRoom)); // OUBLIER PAS DE STRINGIFY avant de emit
  }

  getSocket() {
    return this.socket;
  }
}
