import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";
import { Drawing } from "../class/Drawing";
import { Ellipse } from "../class/Ellipse";


export class EllipseService {

constructor() { }

private io:Server;

  initEllipse(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start ellipse "+socket.id);
        this.startEllipse(socket);    
        this.drawEllipse(socket);
        this.endEllipse(socket);
    })
  }

  startEllipse(socket:Socket) {
    socket.on("STARTELLIPSE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("STARTELLIPSE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTELLIPSE",JSON.stringify(data));
    })
  }

  drawEllipse(socket:Socket) {
    socket.on("DRAWELLIPSE",(data)=>{
      data=JSON.parse(data);
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWELLIPSE",JSON.stringify(data));
    })
  }

  endEllipse(socket:Socket) {
    socket.on("ENDELLIPSE",(data)=>{
      data=JSON.parse(data);
      console.log("ENDELLIPSE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endellipse")

      console.log(data);
      let drawing:Drawing=drawingService.drawings.get("drawing123") as Drawing;
      let ellipse:Ellipse=new Ellipse(data);
      drawing.elementById.set(ellipse.getId(),ellipse);

      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDELLIPSE",JSON.stringify(data));
    })
  }


}

const ellipseService = new EllipseService();
export default ellipseService;