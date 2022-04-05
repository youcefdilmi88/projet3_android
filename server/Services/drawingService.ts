import { Server, Socket } from "socket.io";
import { BaseShape } from "../class/BaseShape";
import { Drawing } from "../class/Drawing";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { MessageInterface } from "../Interface/Message";
import albumService from "./albumService";
import databaseService from "./databaseService";
import ellipseService from "./ellipseService";
import pencilService from "./pencilService";
import rectangleService from "./rectangleService";
import roomService from "./roomService";
import selectionService from "./selectionService";
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

  getIo():Server {
    return this.io;
  }

  initDrawing(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",async (socket:Socket)=>{
        console.log("user start drawing "+socket.id);
        pencilService.startLine(socket);
        pencilService.drawLine(socket);
        pencilService.endLine(socket);

        rectangleService.startRectangle(socket);
        rectangleService.drawRectangle(socket);
        rectangleService.endRectangle(socket);

        ellipseService.startEllipse(socket);
        ellipseService.drawEllipse(socket);
        ellipseService.endEllipse(socket);

        selectionService.startSelect(socket);
        selectionService.drawSelect(socket);
        selectionService.endSelect(socket);
        selectionService.resizeSelect(socket);
        selectionService.deleteSelect(socket);

        this.deleteShape(socket);
        this.resetDrawing(socket);

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

  deleteShape(socket:Socket) {
    socket.on(SOCKETEVENT.DELETESHAPE,(data)=>{
      data=JSON.parse(data);
      if(this.socketInDrawing.has(socket?.id)) {
        let drawingName:String=this.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
        let id:String=data.id;
        drawing.removeElement(id);
        this.drawings[`${drawingName}`]=drawing;
        drawing.modified=true;
        this.autoSaveDrawing(drawing.getName());
      }
      this.getIo().to(this.socketInDrawing.get(socket?.id)?.getName() as string).emit(SOCKETEVENT.DELETESHAPE,JSON.stringify(data));
    });
  }

  resetDrawing(socket:Socket) {
    socket.on(SOCKETEVENT.RESETDRAWING,(data)=>{
      if(this.socketInDrawing.has(socket?.id)) {
        let drawingName:String=this.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
        drawing.setElements([] as BaseShape[]);
        this.drawings[`${drawingName}`]=drawing;
        drawing.modified=true;
        this.autoSaveDrawing(drawing.getName());
      }
      this.getIo().to(this.socketInDrawing.get(socket?.id)?.getName() as string).emit(SOCKETEVENT.RESETDRAWING,JSON.stringify(data));
    })
  }

  async createDrawing(drawingName:String,owner:String,elements:BaseShapeInterface[],roomName:String,members:String[],visibility:String,creationDate:Number,likes:String[]) {
    try {
      const drawing=new DrawingSchema({drawingName:drawingName,owner:owner,elements:elements,roomName:roomName,members:members,visibility:visibility,creationDate:creationDate,likes:likes});
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
        visibility:visibility,
        creationDate:creationDate,
        likes:likes
      }
      const drawingObj=new Drawing(drawingInterface);
      this.drawings.set(drawingObj.getName(),drawingObj);
      let users:String[]=[];
      let messages:MessageInterface[]=[];
      await roomService.createRoom(roomName,owner,users,messages).then(()=>{
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
            if(v.getDrawings().indexOf(drawingName)!=-1) {
              v.removeDrawing(drawingName);      // remove drawing from all albums
              albumService.updateDrawingInAlbum(v);
            }
          });
          const drawingNotification={drawingName:this.sourceDrawingName(drawingName)}
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
    return originalName;
  }

  joinDrawing(drawingName:String,useremail:String) {

    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;

    let socket=socketService.getIo().sockets.sockets.get(socketId);
    console.log("join drawing socket:",socket?.id);

    if(drawingService.socketInDrawing.has(socket?.id as string)) {
      socket?.leave(drawingService.socketInDrawing.get(socket?.id)?.getName() as string);
      // delete user from previous drawing
      drawingService.socketInDrawing.delete(socket?.id as string); 
    }

    socket?.join(drawingName as string);
    roomService.joinRoom(this.sourceDrawingName(drawingName),useremail);

    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;

    drawing.addMember(socket?.id as string,useremail);
  
    this.drawings[`${drawing.getName()}`]=drawing;
    this.socketInDrawing.set(socket?.id as string,drawing);
    
    let drawingInterface:DrawingInterface={
      drawingName:this.sourceDrawingName(drawing.getName()),
      owner:drawing.getOwner(),
      elements:drawing.getElementsInterface(),
      roomName:drawing.roomName,
      members:drawing.getMembers(),
      visibility:drawing.getVisibility(),
      creationDate:drawing.getCreationDate(),
      likes:drawing.getLikes()
    }

    const joinDrawingNotification={useremail:useremail,drawing:drawingInterface};
    socketService.getIo().emit(SOCKETEVENT.JOINDRAWING,JSON.stringify(joinDrawingNotification));
  }

  leaveDrawing(socket:Socket,mail:String) {
    let drawing:Drawing=this.socketInDrawing.get(socket?.id as string) as Drawing;
    console.log("leave drawing:"+drawing.getName());
    socket?.leave(drawing.getName() as string);
    roomService.leaveRoom(socket,this.sourceDrawingName(drawing.getName()),mail);
    drawingService.socketInDrawing.delete(socket?.id as string);
    
    drawing.removeMember(socket?.id as string);

    this.drawings[`${drawing.getName()}`]=drawing;
    this.socketInDrawing.set(socket?.id as string,drawing);

    let drawingInterface:DrawingInterface={
      drawingName:this.sourceDrawingName(drawing.getName()),
      owner:drawing.getOwner(),
      elements:drawing.getElementsInterface(),
      roomName:drawing.roomName,
      members:drawing.getMembers(),
      visibility:drawing.getVisibility(),
      creationDate:drawing.getCreationDate(),
      likes:drawing.getLikes()
    }

    const message={useremail:mail,drawing:drawingInterface};
    socketService.getIo().emit(SOCKETEVENT.LEAVEDRAWING,JSON.stringify(message));
  }

  async overwriteDrawingName(newName:String,drawing:Drawing) {
    let oldName:String=drawing.getName();
    
    const filter={drawingName:drawing.getName()};
      const drawingUpdate = {
           $set:{
             "drawingName":newName,
             "visibility":drawing.getVisibility()
           }
       };
    try {
      let drawingDoc=await DrawingSchema.findOne(filter);
      await DrawingSchema.updateOne(filter,drawingUpdate).catch((e:Error)=>{
        console.log(e);
      });
      await drawingDoc?.save().then(()=>{
        drawing.setName(newName);
        this.drawings.delete(oldName);
        this.drawings.set(drawing.getName(),drawing);
        this.socketInDrawing.forEach((v,k)=>{
          if(v.getName()==oldName) {
            this.socketInDrawing[k]=drawing;
            let socket=socketService.getIo().sockets.sockets.get(k);
            socket?.leave(oldName as string);
            socket?.join(drawing.getName() as string);
          }
        });

        albumService.albums.forEach((v,k)=>{
          if(v.getDrawings().indexOf(oldName)!=-1) {
            v.changeDrawingName(oldName,drawing.getName());
            albumService.updateDrawingInAlbum(v);
          }
        })

        let drawingInterface:DrawingInterface={
          drawingName:this.sourceDrawingName(drawing.getName()),
          owner:drawing.getOwner(),
          elements:drawing.getElementsInterface(),
          roomName:drawing.roomName,
          members:drawing.getMembers(),
          visibility:drawing.getVisibility(),
          creationDate:drawing.getCreationDate(),
          likes:drawing.getLikes()
        }

        const message={oldName:this.sourceDrawingName(oldName),drawing:drawingInterface};
        socketService.getIo().emit(SOCKETEVENT.DRAWINGMODIFIED,JSON.stringify(message));
        
      }).catch((e:Error)=>{
        console.log(e);
      });
      await roomService.updateRoomName(this.sourceDrawingName(newName),this.sourceDrawingName(oldName)).catch((e:Error)=>{
        console.log(e);
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  overwriteDrawingVisibility(drawing:Drawing) {
    this.drawings[`${drawing.getName()}`]=drawing;
    this.socketInDrawing.forEach((v,k)=>{
      if(v.getName()==drawing.getName()) {
        this.socketInDrawing[k]=drawing;
      }
    });
    drawing.modified=true;
    this.autoSaveDrawing(drawing.getName()).then(()=>{
      let drawingInterface:DrawingInterface={
        drawingName:this.sourceDrawingName(drawing.getName()),
        owner:drawing.getOwner(),
        elements:drawing.getElementsInterface(),
        roomName:drawing.roomName,
        members:drawing.getMembers(),
        visibility:drawing.getVisibility(),
        creationDate:drawing.getCreationDate(),
        likes:drawing.getLikes()
      }
      socketService.getIo().emit(SOCKETEVENT.VISIBILITYCHANGED,JSON.stringify({drawing:drawingInterface}));
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
             "visibility":drawing.getVisibility(),
             "likes":drawing.getLikes()
           }
       };
        try {
           let drawingDoc=await DrawingSchema.findOne(filter);
           await DrawingSchema.updateOne(filter,drawingUpdate).catch((e:Error)=>{
             console.log(e);
           });
           await drawingDoc?.save().then(()=>{
             this.socketInDrawing.forEach((v,k)=>{
               if(v.getName()==drawing.getName()) {
                 this.socketInDrawing[k]=drawing;
               }
             })
           }).catch((e:Error)=>{
             console.log(e);
           });
         }
         catch(error) {
          console.log(error);
         }
      }
    }
  }

  convertAllDrawingToSourceName(drawings:String[]):String[] {
    let converted:String[]=[]
    drawings.forEach((drawing)=>{
      converted.push(this.sourceDrawingName(drawing));
    });
    return converted;
  }

  async addLikeDrawing(drawingName:String,useremail:String) {
    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
    drawing.addLikes(useremail);
    drawing.modified=true;
    console.log("WTV", this.drawings.get(drawingName)?.getLikes());
    await this.autoSaveDrawing(drawing.getName());
    const message={drawing:drawing};
    socketService.getIo().emit(SOCKETEVENT.DRAWINGLIKESCHANGED,JSON.stringify(message));
  }

  async removeLikeDrawing(drawingName:String,useremail:String) {
    let drawing:Drawing=this.drawings.get(drawingName) as Drawing;
    drawing.removeLikes(useremail);
    drawing.modified=true;
    await this.autoSaveDrawing(drawing.getName());
    const message={drawing:drawing};
    socketService.getIo().emit(SOCKETEVENT.DRAWINGLIKESCHANGED,JSON.stringify(message));
  }

}

const drawingService=new DrawingService();
export default drawingService;
