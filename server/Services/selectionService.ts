import { Server, Socket } from "socket.io";
import roomService from "./roomService";
import { v4 as uuidv4 } from 'uuid';


export class SelectionService {

  constructor() { }

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

  startSelect(socket:Socket) {
    socket.on("STARTSELECT",(data)=>{
      console.log("data here " + data);
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("user "+socket.id+" starts selecting");
      console.log("STARTSELECT");
      console.log(data+""+roomService.getRoomNameBySocket(socket.id))
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("STARTSELECT",JSON.stringify(data));
    })
  }

  drawSelect(socket:Socket) {
    socket.on("DRAWSELECT",(data)=>{
      data=JSON.parse(data);
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DRAWSELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  resizeSelect(socket:Socket) {
    socket.on("SIZESELECT",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("SIZESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  deleteSelect(socket:Socket) {
    socket.on("DELETESELECT",(data)=>{
      data=JSON.parse(data);
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("DELETESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  endSelect(socket:Socket) {
    socket.on("ENDSELECT",(data)=>{
      data=JSON.parse(data);
      console.log("user "+socket.id+" ends select");

      console.log(data);
      console.log("ENDLINE");
      console.log(roomService.getRoomNameBySocket(socket.id)+" endline")
      this.io.to(roomService.getRoomNameBySocket(socket.id) as string).emit("ENDLINE",JSON.stringify(data));
    })
  }


}

const selectionService=new SelectionService();
export default selectionService;
