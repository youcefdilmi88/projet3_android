import { Room } from "../class/Room";
import RoomSchema from "../Entities/RoomSchema";
import databaseService from "./databaseService";

export class RoomService {

  private rooms=new Map<String,Room>(); // roomName and room
  public socketToRoom=new Map<string,string>(); //socketid and roomName

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

  getRoomNameBySocket(socketId:string) {
    if(this.socketToRoom.has(socketId)) {
      return this.socketToRoom.get(socketId);
    }
    let message:String="socket not found";
    return message;
  }

  

}

const roomService=new RoomService();
export default roomService;
