import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";


export class SelectionService {

  constructor() { }

  /*
  private io:Server;

  initSelection(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start selection "+socket.id);
        this.startSelect(socket);    
        this.drawSelect(socket);
        this.endSelect(socket);
        this.resizeSelect(socket);
        this.deleteSelect(socket);
    })
  }
  */

  startSelect(socket:Socket) {
    socket.on("STARTSELECT",(data)=>{
      console.log("data here " + data);
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("user "+socket.id+" starts selecting");
      console.log("STARTSELECT");
      console.log(data+""+drawingService.socketInDrawing.get(socket?.id)?.getName())
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTSELECT",JSON.stringify(data));
    })
  }

  drawSelect(socket:Socket) {
    socket.on("DRAWSELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DRAWSELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  resizeSelect(socket:Socket) {
    socket.on("SIZESELECT",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("SIZESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  deleteSelect(socket:Socket) {
    socket.on("DELETESELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DELETESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  endSelect(socket:Socket) {
    socket.on("ENDSELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("ENDSELECT",JSON.stringify(data));
    })
  }


  downSelect(socket:Socket) {
    socket.on("DOWNSELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DOWNSELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

}

const selectionService=new SelectionService();
export default selectionService;
