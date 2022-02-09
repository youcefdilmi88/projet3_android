import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
//import { UserService } from '@app/services/fetch-users/user.service';


@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;
  //private userService: UserService;

  constructor() { }

  initSocket(): void {
    console.log("socket initiation");
    this.socket=io('https://projet3-3990-207.herokuapp.com/', {
      reconnectionAttempts: 2,
      transports : ['websocket'],
      //query : { user: this.userService.getTempUsername() }
    })
    this.socket.on("connected",(data)=>{
      console.log(data);
    })
    this.socket.emit("connection", "");
    /*this.socket.on("room1", (data)=>{
      console.log(data);
    });*/
  }

  getSocket() {
    return this.socket;
  }
}

