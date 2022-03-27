import { Server, Socket } from "socket.io";
import { Drawing } from "../class/Drawing";
import { Room } from "../class/Room";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import albumService from "./albumService";
import databaseService from "./databaseService";
import roomService from "./roomService";
import socketService from "./socketService";
import userService from "./userService";


class DrawingService {

  private io:Server;
  public drawings:Map<String,Drawing>;  // drawingName and Drawing
  public socketInDrawing:Map<string,Drawing>;
  public roomInfo:Room;
  
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

  async createDrawing(drawingName:String,owner:String,elements:BaseShapeInterface[],roomName:String,members:String[],visibility:String) {
    try {
      const drawing=new DrawingSchema({drawingName:drawingName,owner:owner,elements:elements,roomName:roomName,members:members,visibility:visibility});
      await drawing.save().then(()=>{
        console.log("drawing saved");
      }).catch((e:Error)=>{
        console.log(e);
      })
      const drawingInterface:DrawingInterface={
        drawingName:drawingName,
        owner:owner,
        elements:elements,
        roomName:roomName,
        members:members,
        visibility:visibility
      }
      const drawingObj=new Drawing(drawingInterface);
      this.drawings.set(drawingObj.getName(),drawingObj);
      await roomService.createRoom(roomName,owner,this.roomInfo.getUsersInRoom(),this.roomInfo.getRoomMessages()).then(()=>{
          const messageDrawing={message:"drawing created"};
          const messageRoom={message:"room created"};
          socketService.getIo().emit(SOCKETEVENT.DRAWINGCREATED,JSON.stringify(messageDrawing));
          socketService.getIo().emit(SOCKETEVENT.CREATEROOM,JSON.stringify(messageRoom));
      }).catch((e:Error)=>{
          console.log(e);
      })
    }
    catch(error) {
      console.log(error);
    }
  }

  kickUsersFromDrawing(drawingName:String) {
    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
    this.socketInDrawing.forEach((v,k)=>{
      if(v==drawing) {
        let socket=socketService.getIo().sockets.sockets.get(k);
        socket?.leave(drawing.getName() as string);
        this.socketInDrawing.delete(k);
      }
    })
    drawing?.setMembers([] as String[]); // set all members in drawing to nothing
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
          });
          const drawingNotification={drawingName:drawingName}
          socketService.getIo().emit(SOCKETEVENT.DRAWINGDELETED,JSON.stringify(drawingNotification));
        });
        await roomService.deleteRoom(this.sourceDrawingName(drawingName));
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

    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;

    drawingService.socketInDrawing.set(socket?.id as string,drawing);
    drawing.addMember(socket?.id as string,useremail);4

    const joinDrawingNotification={useremail:useremail,drawingName:drawingService.sourceDrawingName(drawingName),members:drawing.getMembers()}
    socketService.getIo().emit(SOCKETEVENT.JOINDRAWING,JSON.stringify(joinDrawingNotification));
  }

  leaveDrawing(socket:Socket,mail:String) {
    let drawing:Drawing=this.socketInDrawing.get(socket?.id as string) as Drawing;
    console.log("leave drawing:"+drawing.getName());
    socket?.leave(drawing.getName() as string);
    drawingService.socketInDrawing.delete(socket?.id as string);
    drawing.removeMember(socket?.id as string);
    const message={drawingName:this.sourceDrawingName(drawing.getName()),useremail:mail,members:drawing.getMembers()};
    socketService.getIo().emit(SOCKETEVENT.LEAVEDRAWING,JSON.stringify(message));
  }

  async overwriteDrawingName(newName:String,drawing:Drawing) {
    let oldName:String=drawing.getName();
    this.roomInfo=roomService.getAllRooms().get(this.sourceDrawingName(oldName)) as Room;
    await this.deleteDrawing(drawing.getName()).then(()=>{
      drawing.setName(newName);
      drawing.roomName=this.sourceDrawingName(newName);
      this.drawings.set(newName,drawing);
    });
    await this.createDrawing(drawing.getName(),drawing.getOwner(),drawing.getElementsInterface(),drawing.roomName,drawing.getMembers(),drawing.getVisibility()).then(()=>{
      this.socketInDrawing.forEach((v,k)=>{
        if(v.getName()==oldName) {
          let socket=socketService.getIo().sockets.sockets.get(k);
          socket?.join(newName as string);
          this.socketInDrawing.set(k,drawing);
        }
      })
      roomService.getSocketsRoomNames().forEach((v,k)=>{
        if(v==this.sourceDrawingName(oldName)) {
           let socket=socketService.getIo().sockets.sockets.get(k);
           socket?.join(drawing.roomName as string);
           roomService.getSocketsRoomNames().set(socket?.id as string,this.sourceDrawingName(newName) as string);
        }
      })
    });
  }

  overwriteDrawingVisibility(drawing:Drawing) {
    this.drawings[`${drawing.getName()}`]=drawing;
    this.socketInDrawing.forEach((v,k)=>{
      if(v.getName()==drawing.getName()) {
        this.socketInDrawing[k]=drawing;
      }
    });
    console.log(this.drawings.get(drawing.getName()));
    drawing.modified=true;
    this.autoSaveDrawing(drawing.getName()).then(()=>{
      socketService.getIo().emit(SOCKETEVENT.VISIBILITYCHANGED,JSON.stringify({drawing:drawing}));
    })
  }


  async autoSaveDrawing(drawingName:String) {
    if(this.drawings.has(drawingName)) 
    {
     let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
     if(drawing.modified==true) {
      const filter={drawingName:drawingName};
      const drawingUpdate = {
           $set:{
             "owner":drawing.getOwner(),
             "elements":drawing.getElementsInterface(),
             "members":drawing.getMembers(),
             "visibility":drawing.getVisibility()
           }
       };
        try {
           let drawingDoc=await DrawingSchema.findOne(filter);
           await DrawingSchema.updateOne(filter,drawingUpdate).catch((e:Error)=>{
             console.log(e);
           });
           await drawingDoc?.save().catch((e:Error)=>{
             console.log(e);
           });
         }
         catch(error) {
          console.log(error);
         }
      }
    }
  }



}

const drawingService=new DrawingService();
export default drawingService;
