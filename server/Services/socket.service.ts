import http from 'http';
import { Socket,Server } from "socket.io";
import messageService from "./messageService";
import userService from "./userService";

class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     this.connect();
  }

  connect():void {
    this.io.on("connection",(socket:Socket)=>{
      console.log(socket.id+" is connected");
       this.sendMessage(socket);
    });
  }

  parseObject(arg: any): Object {
    if ((!!arg) && arg.constructor === Object) {
        return arg
    } else {
        try {
            return JSON.parse(arg);
        } catch(E){
            return {};
        }
    }
}

  sendMessage(socket:Socket) {
    socket.on("msg",async (data)=> {    // listen for event named random with data
      data = this.parseObject(data);
      console.log(data);
      await messageService.createMessage(data.time,data.useremail,data.message);  
      socket.broadcast.emit("room1",data);  // send msg to all listener listening to room1 the right side json
    })
  }

  disconnect(socket:Socket) {
    socket.on("disconnect",()=>{
      userService.getConnectedUsers().delete(socket.id);
    });
  }
}

const socketService=new SocketService();
export default socketService;
