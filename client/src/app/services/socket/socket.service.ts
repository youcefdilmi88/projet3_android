import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
//import { UserService } from '@app/services/fetch-users/user.service';


@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;
  public useremail: string;
  public isConnected: boolean;
  //private userService: UserService;

  constructor() { }

  initSocket(): void {
    console.log("socket initiation");
    this.socket=io('https://projet3-3990-207.herokuapp.com/', {
      reconnectionAttempts: 2,
      transports : ['websocket'],
      //query : { user: this.userService.getTempUserEmail() }
    })
    this.socket.on("connected",(data)=>{
      /*if (`${ data }` != "USER FAILED") {
        console.log("socket service");
        this.isConnected = true;
      }
      else {
        console.log("socket service");
        this.isConnected = false;
      }*/
      console.log(data);
    })
    //this.socket.emit("connection", );
    const user = { useremail: this.useremail };
    this.socket.emit("connection", JSON.stringify(user));
    /*this.socket.on("room1", (data)=>{
      console.log(data);
    });*/
  }

  getSocket() {
    return this.socket;
  }
}

