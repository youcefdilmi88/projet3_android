import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';


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
      console.log("user "+socket.id+" is drawing");
      console.log("DRAWLINE");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWLINE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDLINE",()=>{
      console.log("user "+socket.id+" ends drawing");
      console.log("ENDLINE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endline")
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",{});
    })
  }


}

const pencilService=new PencilService();
export default pencilService;
