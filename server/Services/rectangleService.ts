import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';
import { Drawing } from "../class/Drawing";
import { Rectangle } from "../class/Rectangle";
import drawingService from "./drawingService";


export class RectangleService {

constructor() { }

private io:Server;

  initRectangle(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        this.startRectangle(socket);    
        this.drawRectangle(socket);
        this.endRectangle(socket);
    })
  }

  startRectangle(socket:Socket) {
    socket.on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTRECTANGLE",JSON.stringify(data));
    })
  }

  drawRectangle(socket:Socket) {
    socket.on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWRECTANGLE",JSON.stringify(data));
    })
  }

  endRectangle(socket:Socket) {
    socket.on("ENDRECTANGLE",(data)=>{
      data=JSON.parse(data);
      if(drawingService.drawings.has("drawing123")) {
       let drawing:Drawing=drawingService.drawings.get("drawing123") as Drawing;
       let rectangle:Rectangle=new Rectangle(data);
       drawing.elementById.set(rectangle.getId(),rectangle);
       drawing.modified=true;
      }
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDRECTANGLE",JSON.stringify(data));
    })
  }


}

const rectangleService = new RectangleService();
export default rectangleService;