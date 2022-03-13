import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { URL } from '../../../constants';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;

  constructor() { }

  initSocket(): void {
    console.log("socket initiation");
    this.socket=io(//'https://projet3-3990-207.herokuapp.com/'
    URL, {
      reconnectionAttempts: 2,
      transports : ['websocket'],
    })
    this.socket.on("connected",(data)=>{
      console.log(data);
    })
    this.socket.emit("connection", "");
    this.socket.on("room1", (data)=>{
      console.log(data);
    });
  }

  getSocket() {
    return this.socket;
  }
}
