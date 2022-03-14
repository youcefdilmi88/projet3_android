import { Server, Socket } from "socket.io";
import roomService from "./roomService";

export class RectangleService {

constructor() { }

private io:Server;

  initRectangle(server:Server) {
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
    socket.on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      console.log("STARTRECTANGLE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTRECTANGLE",JSON.stringify(data));
    })
  }

  drawLine(socket:Socket) {
    socket.on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      console.log("DRAWRECTANGLE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWRECTANGLE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDRECTANGLE",()=>{
      console.log("ENDRECTANGLE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endline")
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDRECTANGLE",{});
    })
  }


}

const rectangleService = new RectangleService();
export default rectangleService;