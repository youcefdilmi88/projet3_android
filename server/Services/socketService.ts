import http from 'http';
import { Server } from "socket.io";
import drawingService from './drawingService';
import messageService from "./messageService";
import pencilService from './pencilService';


class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     messageService.initChat(this.io);
     pencilService.initPencil(this.io);
     drawingService.initDrawing(this.io);
  }

  getIo():Server {
     return this.io;
  }

}

const socketService=new SocketService();
export default socketService;
