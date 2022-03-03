import http from 'http';
import { Server } from "socket.io";
import messageService from "./messageService";
import roomService from './roomService';


class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     messageService.initChat(this.io);
     roomService.initRoom(this.io);
  }

  getIo() {
     return this.io;
  }

}

const socketService=new SocketService();
export default socketService;
