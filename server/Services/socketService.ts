import http from 'http';
import { Server } from "socket.io";
import messageService from "./messageService";
import pencilService from './pencilService';


class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     messageService.initChat(this.io);
     pencilService.initChat(this.io);
  }

  getIo():Server {
     return this.io;
  }

}

const socketService=new SocketService();
export default socketService;
