
import { Room } from "../class/Room";
import RoomSchema from "../Entities/RoomSchema";
import { MessageInterface } from "../Interface/Message";
import databaseService from "./databaseService";


export class RoomService {

  private rooms=new Map<String,Room>(); // roomName and room
  private socketidToEmail=new Map<string,String>(); // socketid and useremail
  private socketToRoom=new Map<string,string>(); //socketid and roomName

  constructor() {
    this.createDefaultRoom();
  }



  /***** main chat room ********/
  async createDefaultRoom() {
    await this.loadAllRoom();
    if(this.rooms.has("DEFAULT")==false) {
      const roomName="DEFAULT";
      const creator="ADMIN";
      let members:String[]=[];
      let messages:MessageInterface[]=[];
      members.push("admin");
      this.createRoom(roomName,creator,members,messages);
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
        let roomObj:Room=new Room(room.roomName,room.creator,room.members,room.messages);
        this.rooms.set(roomObj.getRoomName(),roomObj);
      })
    }).catch((e:Error)=>{
        console.log(e);
    });
  }

  async createRoom(name:String,creatorName:String,members:String[],messages:MessageInterface[]) {
    try {
      const room=new RoomSchema({roomName:name,creator:creatorName,members:members,messages:messages});
      await room.save();
      console.log("room saved");
      const roomObj=new Room(name,creatorName,members,messages);
      this.rooms.set(name,roomObj);
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
