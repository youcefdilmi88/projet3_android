import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';


export class EllipseService {

constructor() { }

private io:Server;

  initRectangle(server:Server) {
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
    socket.on("ENDELLIPSE",()=>{
      console.log("ENDELLIPSE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endellipse")
      // socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDELLIPSE",{});
    })
  }


}

const ellipseService = new EllipseService();
export default ellipseService;