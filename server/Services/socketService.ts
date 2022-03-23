import http from 'http';
import { Server } from "socket.io";
import drawingService from './drawingService';
import ellipseService from './ellipseService';
import messageService from "./messageService";
import pencilService from './pencilService';
import rectangleService from './rectangleService';
import selectionService from './selectionService';


class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     messageService.initChat(this.io);
     rectangleService.initRectangle(this.io);
     ellipseService.initEllipse(this.io);
     pencilService.initPencil(this.io);
     selectionService.initSelection(this.io);
     drawingService.initDrawing(this.io);
  }

  getIo():Server {
     return this.io;
  }

}

const socketService=new SocketService();
export default socketService;
