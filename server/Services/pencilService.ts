import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";
import { Drawing } from "../class/Drawing";
import { Line } from "../class/Line";


export class PencilService {

  constructor() { }
/*
  private io:Server;

  initPencil(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        this.startLine(socket);    
        this.drawLine(socket);
        this.endLine(socket);
    })
  }
*/
  startLine(socket:Socket) {
    socket.on("STARTLINE",(data)=>{
      data=JSON.parse(data);
      console.log(data);
      data.id=uuidv4();
      console.log("line id:"+data.id);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTLINE",JSON.stringify(data));
    })
  }

  drawLine(socket:Socket) {
    socket.on("DRAWLINE",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTLINE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDLINE",(data)=>{
      data=JSON.parse(data);
      // save to one drawing currently have to change when users can be in a specific drawing with socketInDrawing
      if(drawingService.socketInDrawing.has(socket?.id)) {
       let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
       let drawing:Drawing=drawingService.drawings.get(name) as Drawing;
       let line:Line=new Line(data);
       drawing.elementById.set(line.getId(),line);
       drawing.modified=true;
      }
      
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTLINE",JSON.stringify(data));
    })
  }


}

const pencilService=new PencilService();
export default pencilService;
