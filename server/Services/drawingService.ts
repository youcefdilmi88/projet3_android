import { Server, Socket } from "socket.io";
import { Drawing } from "../class/Drawing";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import albumService from "./albumService";
import databaseService from "./databaseService";
import socketService from "./socketService";
import userService from "./userService";


class DrawingService {

  private io:Server;
  public drawings:Map<String,Drawing>;  // drawingName and Drawing
  public socketInDrawing:Map<string,Drawing>;
  
  constructor() { 
    this.drawings=new Map<String,Drawing>();
    this.socketInDrawing=new Map<string,Drawing>();
    this.loadAllDrawings();
  }


  initDrawing(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start drawing "+socket.id);
    })
  }

  async loadAllDrawings() {
    this.drawings.clear();
    await databaseService.getAllDrawings().then((drawings)=>{
      drawings.forEach((drawing)=>{
        let drawingObj:Drawing=new Drawing(drawing);
        this.drawings.set(drawingObj.getName(),drawingObj);
      });
    }).catch((e:Error)=>{
        console.log(e);
    });
  }

  async createDrawing(drawingName:String,creator:String,elements:BaseShapeInterface[],roomName:String,members:String[]) {
    try {
      const drawing=new DrawingSchema({drawingName:drawingName,creator:creator,elements:elements,roomName:roomName,members:members});
      await drawing.save();
      console.log("drawing saved");
      const drawingInterface:DrawingInterface={
        drawingName:drawingName,
        creator:creator,
        elements:elements,
        roomName:roomName,
        members:members,
      }
      const drawingObj=new Drawing(drawingInterface);
      this.drawings.set(drawingObj.getName(),drawingObj);
    }
    catch(error) {
      console.log(error);
    }
  }

  kickUsersFromDrawing(drawingName:String) {
    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
    this.socketInDrawing.forEach((v,k)=>{
      if(v==drawing) {
        this.socketInDrawing.delete(k);
      }
    })
    drawing.setMembers([]); // set all members in drawing to nothing
  }

  async deleteDrawing(drawingName:String) {
    try {
        await DrawingSchema.deleteOne({drawingName:drawingName}).then((data)=>{
          console.log(data);
          this.drawings.delete(drawingName);
          this.kickUsersFromDrawing(drawingName);
          albumService.albums.forEach((v,k)=>{
            if(v.getDrawings().includes(drawingName)) {
              v.removeDrawing(k);      // remove drawing from all albums
            }
          })
          const drawingNotification={drawingName:drawingName}
          socketService.getIo().emit(SOCKETEVENT.DRAWINGDELETED,JSON.stringify(drawingNotification));
        });
      }
      catch(error) {
        console.log(error);
    }
  }

  addonDrawingName(name:String):String {
     let newName:String="drawing"+name;
     return newName;
  }

  sourceDrawingName(name:String):String {
    let originalName:String=name.slice(7);
    console.log(originalName);
    return originalName;
  }

  joinDrawing(drawingName:String,useremail:String) {

    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;

    let socket=socketService.getIo().sockets.sockets.get(socketId);

    if(drawingService.socketInDrawing.has(socket?.id as string)) {
      socket?.leave(drawingService.socketInDrawing.get(socket?.id)?.getName() as string);
      // delete user from previous drawing
      drawingService.socketInDrawing.delete(socket?.id as string); 
    }

    socket?.join(drawingName as string);

    const joinDrawingNotification={useremail:useremail,drawingName:drawingService.sourceDrawingName(drawingName)}
    socketService.getIo().emit(SOCKETEVENT.JOINDRAWING,JSON.stringify(joinDrawingNotification))

    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;

    drawingService.socketInDrawing.set(socket?.id as string,drawing);
    drawing.addMember(socket?.id as string,useremail);
  }

  leaveDrawing(socket:Socket,mail:String) {
    let drawing:Drawing=this.socketInDrawing.get(socket?.id as string) as Drawing;
    console.log("leave drawing:"+drawing.getName());

    socket?.leave(drawing.getName() as string);
    drawingService.socketInDrawing.delete(socket?.id as string);
    drawing.removeMember(socket?.id as string);
    const message={drawingName:drawing.getName(),useremail:mail};
    socketService.getIo().emit(SOCKETEVENT.LEAVEDRAWING,JSON.stringify(message));
  }


  async autoSaveDrawing(drawingName:String) {
    if(this.drawings.has(drawingName)) {
     let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
     const drawingUpdate = {
       $set: {
         "elements": drawing.getElementsInterface(),
         "members":drawing.getMembers()
       }
      };
     try {
       DrawingSchema.findOneAndUpdate({drawingName:drawingName},drawingUpdate).then((data)=>{
       }).catch((error:Error)=>{
         console.log(error);
       })
     }
     catch(error) {
       console.log(error);
     }
   }
  }

}

const drawingService=new DrawingService();
export default drawingService;
