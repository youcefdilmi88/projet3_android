import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";
import { Drawing } from "../class/Drawing";
import { Line } from "../class/Line";


export class PencilService {

  constructor() { }

  private io:Server;

  initPencil(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start drawing "+socket.id);
        this.startLine(socket);    
        this.drawLine(socket);
        this.endLine(socket);
    })
  }

  startLine(socket:Socket) {
    socket.on("STARTLINE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("user "+socket.id+" starts drawing");
      console.log("STARTLINE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTLINE",JSON.stringify(data));
    })
  }

  drawLine(socket:Socket) {
    socket.on("DRAWLINE",(data)=>{
      data=JSON.parse(data);
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDLINE",(data)=>{
      data=JSON.parse(data);
      console.log("user "+socket.id+" ends drawing");

      console.log(data);
      // save to one drawing currently have to change when users can be in a specific drawing with socketInDrawing
      let drawing:Drawing=drawingService.drawings.get("drawing123") as Drawing;
      let line:Line=new Line(data);
      drawing.elementById.set(line.getId(),line);

      console.log("ENDLINE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endline")
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
    })
  }


}

const pencilService=new PencilService();
export default pencilService;
