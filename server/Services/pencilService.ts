import { Server, Socket } from "socket.io";
import roomService from "./roomService";

export class PencilService {

  constructor() { }

  private io:Server;

  initChat(server:Server) {
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
      console.log("STARTLINE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTLINE",JSON.stringify(data));
    })
  }

  drawLine(socket:Socket) {
    socket.on("DRAWLINE",(data)=>{
      data=JSON.parse(data);
      console.log("DRAWLINE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDLINE",(data)=>{
      data=JSON.parse(data);
      console.log("ENDLINE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      socket.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",JSON.stringify(data));
    })
  }


}

const pencilService=new PencilService();
export default pencilService;
