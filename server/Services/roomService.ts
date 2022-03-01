import { Server, Socket } from "socket.io";
import { Room } from "../class/Room";
import RoomSchema from "../Entities/RoomSchema";
import databaseService from "./databaseService";


export class RoomService {

  private rooms=new Map<String,Room>(); // roomName and room
  private socketidToEmail=new Map<string,String>(); // socketid and useremail
  private socketToRoom=new Map<string,string>(); //socketid and roomName
  private io:Server;

  constructor() {
    this.createDefaultRoom();
  }

  /*************************** socket section *********************/
  initRoom(server:Server) {
    this.io=server;
    this.connect();
  }

  connect():void {
    this.io.on("connection",(socket:Socket)=>{
      /***************** add user to connected users *****************/
      let useremail:String=socket.handshake.query.useremail as String;
      console.log("query email:"+useremail);
      
      
      /****************** join current room during connection *****************/
      // socket.join(this.getRoomNameBySocket(socket.id) as string);
      console.log("user "+useremail+" with socket id:"+socket.id+" is connected to the chat");
      
      this.changeRoom(socket);
    });
  }

    changeRoom(socket:Socket) {
      socket.on("JOINROOM",(data)=>{
        data=this.parseObject(data);

        let newRoom:String=data.newRoomName as String;
        let oldRoom:String=data.oldRoomName as String;
        let useremail:String=data.useremail as String;
   
        if(this.getAllRooms().has(newRoom)) {
          let nextRoom:Room=this.getRoomByName(newRoom) as Room;
          let previousRoom:Room=this.getRoomByName(oldRoom) as Room;
          
          console.log("previous roomname:"+newRoom);
          
          nextRoom.addUserToRoom(useremail);
          previousRoom.removeUserFromRoom(useremail);
          
          console.log("ROOM CHANGE:"+newRoom);
          
          this.getSocketsRoomNames().delete(socket.id);
          this.getSocketsRoomNames().set(socket.id,newRoom as string);

          socket.leave(oldRoom as string);
          socket.join(this.getSocketsRoomNames().get(socket.id) as string);
          
          const res={message:"success",currentRoomName:newRoom};
          this.io.to(this.getSocketsRoomNames().get(socket.id) as string).emit("JOINROOM",JSON.stringify(res));
        }
        else {
          const res={message:"room not found", currentRoomName:oldRoom}
          this.io.to(this.getSocketsRoomNames().get(socket.id) as string).emit("JOINROOM",JSON.stringify(res));
        }
      })
    }
  

  /***** main chat room ********/
  async createDefaultRoom() {
    await this.loadAllRoom();
    if(this.rooms.has("DEFAULT")==false) {
      const roomName="DEFAULT";
      const creator="ADMIN";
      let members:String[]=[];
      members.push("admin");
      this.createRoom(roomName,creator,members);
      console.log("roomservice created");
    }
    else {
      console.log("DEFAULT room already created");
    }
  }

  getDefaultRoom():Room {
    return this.rooms.get("DEFAULT") as Room;
  }

  async loadAllRoom() {
    this.rooms.clear();
    await databaseService.getAllRooms().then((rooms)=>{
      rooms.forEach((room)=>{
        let roomObj:Room=new Room(room.roomName,room.creator,room.members);
        this.rooms.set(roomObj.getRoomName(),roomObj);
      })
    }).catch((e:any)=>{
        console.log(e);
    });
  }

  async createRoom(name:String,creatorName:String,members:String[]) {
    try {
      const room=new RoomSchema({roomName:name,creator:creatorName,members:members});
      await room.save();
      this.loadAllRoom();
    }
    catch(error) {
      console.log(error);
    }
  }

  getAllRooms():Map<String,Room> {
    return this.rooms;
  }

  /************** set socketId and useremail **********************/
  setSocketIdAndEmail(socketId:string,email:String) {
    if(this.socketidToEmail.has(socketId)==false) {
      this.socketidToEmail.set(socketId,email);
    }
  }

  /************** returns useremail using socketId key ************/
  getUseremailBySocketId(socketId:string) {
    if(this.socketidToEmail.has(socketId)) {
      return this.socketidToEmail.get(socketId);
    }
    let message:String="useremail not found";
    return message;
  }

  /************** set socketId and roomname to map ***************/
  setUserSocketIdAndRoom(socketId:string,roomName:string) {
    if(this.socketToRoom.has(socketId)==false) {
        this.socketToRoom.set(socketId,roomName);
    }
  }

  getSocketsRoomNames():Map<string,string> {
    return this.socketToRoom;
  }

  /************** returns the roomname using the socketid key ****************/
  getRoomNameBySocket(socketId:string) {
    if(this.socketToRoom.has(socketId)) {
      return this.socketToRoom.get(socketId);
    }
    let message:String="roomname not found";
    return message;
  }

  getRoomByName(name:String) {
    if(this.rooms.has(name)) {
      return this.rooms.get(name) as Room;
    }
    let message:string="room does not exists";
    return message;
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
  

}

const roomService=new RoomService();
export default roomService;
