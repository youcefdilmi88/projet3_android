import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';


export class RectangleService {

constructor() { }

private io:Server;

  initRectangle(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start rectangle "+socket.id);
        this.startRectangle(socket);    
        this.drawRectangle(socket);
        this.endRectangle(socket);
    })
  }

  startRectangle(socket:Socket) {
    socket.on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("STARTRECTANGLE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTRECTANGLE",JSON.stringify(data));
    })
  }

  drawRectangle(socket:Socket) {
    socket.on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWRECTANGLE",JSON.stringify(data));
    })
  }

  endRectangle(socket:Socket) {
    socket.on("ENDRECTANGLE",()=>{
      console.log("ENDRECTANGLE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endrectangle")
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDRECTANGLE",{});
    })
  }


}

const rectangleService = new RectangleService();
export default rectangleService;