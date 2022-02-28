import { Room } from "../class/Room";
import RoomSchema from "../Entities/RoomSchema";
import databaseService from "./databaseService";

export class RoomService {

  private rooms=new Map<String,Room>(); // roomName and id

  constructor() {
    this.createDefaultRoom();
    this.loadAllRoom();
  }

  createDefaultRoom() {
    const roomName="DEFAULT";
    const creator="ADMIN";
    this.createRoom(roomName,creator);
  }

  getDefaultRoom():Room {
    return this.rooms.get("DEFAULT") as Room;
  }

  async loadAllRoom() {
    this.rooms.clear();
    await databaseService.getAllRooms().then((rooms)=>{
      rooms.forEach((room)=>{
        let roomObj=new Room(room.roomName,room.creator);
        this.rooms.set(roomObj.getRoomName(),roomObj);
      })
    }).catch((e:any)=>{
        console.log(e);
    });
  }

  async createRoom(name:String,creatorName:String) {
    try {
      const room=new RoomSchema({roomName:name,creator:creatorName});
      await room.save();
      this.loadAllRoom();
    }
    catch(error) {
      console.log(error);
    }
  }

  /*
  changeRoom(newRoomName:String,previousRoomName:Room):void {
      
  }
  */


}

const roomService=new RoomService();
export default roomService;
