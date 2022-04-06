import { Server, Socket } from "socket.io";
import { BaseShape } from "../class/BaseShape";
import { Drawing } from "../class/Drawing";
import { ProtectedDrawing } from "../class/ProtectedDrawing";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import { VISIBILITY } from "../Constants/visibility";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { MessageInterface } from "../Interface/Message";
import { ProtectedDrawingInterface } from "../Interface/ProtectedDrawingInterface";
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
  public drawings:Map<String,any>;  // drawingName and Drawing
  public socketInDrawing:Map<string,any>;
  
  constructor() { 
    this.drawings=new Map<String,any>();
    this.socketInDrawing=new Map<string,any>();
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
      drawings.forEach((drawing:any)=>{
        if(drawing.visibility==VISIBILITY.PUBLIC || drawing.visibility==VISIBILITY.PRIVATE) {
          let drawingObj:Drawing=new Drawing(drawing);
          this.drawings.set(drawingObj.getName(),drawingObj);
        }
        if(drawing.visibility==VISIBILITY.PROTECTED) {
          let drawingObj:ProtectedDrawing=new ProtectedDrawing(drawing);
          this.drawings.set(drawingObj.getName(),drawingObj);
        }
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

  async createDrawing(drawing:any) {

    let drawingDoc=new DrawingSchema.drawingSchema({
        drawingName:drawing.drawingName,
        owner:drawing.owner,
        elements:drawing.elements as BaseShapeInterface[],
        roomName:drawing.roomName,
        members:drawing.members,
        visibility:drawing.visibility,
        creationDate:drawing.creationDate,
        likes:drawing.likes
    });

    let drawingObj=new Drawing(drawingDoc as DrawingInterface);

    if(drawing.visibility==VISIBILITY.PUBLIC || drawing.visibility==VISIBILITY.PRIVATE) {
      try {
        await drawingDoc.save().then(()=>{
          console.log("drawing saved");
          this.drawings.set(drawingObj.getName(),drawingObj);
        }).catch((e:Error)=>{
          console.log(e);
        });
      }
      catch(e) {
        console.log(e);
      }
    }

    if(drawing.visibility==VISIBILITY.PROTECTED && drawing.password!=undefined) {
      drawingDoc=new DrawingSchema.protectedDrawingSchema({
        drawingName:drawing.drawingName,
        owner:drawing.owner,
        elements:drawing.elements,
        roomName:drawing.roomName,
        members:drawing.members,
        visibility:drawing.visibility,
        creationDate:drawing.creationDate,
        likes:drawing.likes,
        password:drawing.password
      });
                   
      let proDrawingInterface={
        drawingName:drawing.drawingName,
        owner:drawing.owner,
        elements:drawing.elements,
        roomName:drawing.roomName,
        members:drawing.members,
        visibility:drawing.visibility,
        creationDate:drawing.creationDate,
        likes:drawing.likes,
        password:drawing.password
      } as ProtectedDrawingInterface;

      let proDrawingObj:ProtectedDrawing=new ProtectedDrawing(proDrawingInterface);
      console.log(proDrawingObj);
  
      try {
        await drawingDoc.save().then(()=>{
          console.log("drawing saved");
          this.drawings.set(proDrawingObj.getName(),proDrawingObj);
        }).catch((e:Error)=>{
          console.log(e);
        });
      }
      catch(e) {
        console.log(e);
      }
    }

      
    let users:String[]=[];
    let messages:MessageInterface[]=[];
    await roomService.createRoom(drawing.roomName,drawing.owner,users,messages).then(()=>{
        const messageDrawing={message:"drawing created"};
        const messageRoom={message:"room created"};
        socketService.getIo().emit(SOCKETEVENT.DRAWINGCREATED,JSON.stringify(messageDrawing));
        socketService.getIo().emit(SOCKETEVENT.CREATEROOM,JSON.stringify(messageRoom));
    }).catch((e:Error)=>{
        console.log(e);
    })
   
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
        await DrawingSchema.drawingSchema.deleteOne({drawingName:drawingName}).then((data)=>{
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

  async joinDrawing(drawingName:String,useremail:String) {

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

    let drawing:any={};
    if(this.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PUBLIC || this.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PRIVATE) {
      drawing=this.drawings.get(drawingName) as Drawing;
      let drawingInterface:any={
        drawingName:this.sourceDrawingName(drawing.getName()),
        owner:drawing.getOwner(),
        elements:drawing.getElementsInterface(),
        roomName:drawing.roomName,
        members:drawing.getMembers(),
        visibility:drawing.getVisibility(),
        creationDate:drawing.getCreationDate(),
        likes:drawing.getLikes()
      }
      drawing.addMember(socket?.id as string,useremail);
      drawing.modified=true;
      await this.autoSaveDrawing(drawing.getName());
      this.drawings[`${drawing.getName()}`]=drawing;
      this.socketInDrawing.set(socket?.id as string,drawing);
      const joinDrawingNotification={useremail:useremail,drawing:drawingInterface};
      socketService.getIo().emit(SOCKETEVENT.JOINDRAWING,JSON.stringify(joinDrawingNotification));
    }
    if(this.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PROTECTED) {
      drawing=this.drawings.get(drawingName) as ProtectedDrawing;
      let drawingInterface:any={
        drawingName:this.sourceDrawingName(drawing.getName()),
        owner:drawing.getOwner(),
        elements:drawing.getElementsInterface(),
        roomName:drawing.roomName,
        members:drawing.getMembers(),
        visibility:drawing.getVisibility(),
        creationDate:drawing.getCreationDate(),
        likes:drawing.getLikes()
      }
      drawingInterface["password"]=drawing.getPassword();
      drawing.addMember(socket?.id as string,useremail);
      drawing.modified=true;
      await this.autoSaveDrawing(drawing.getName());
      this.drawings[`${drawing.getName()}`]=drawing;
      this.socketInDrawing.set(socket?.id as string,drawing);
      const joinDrawingNotification={useremail:useremail,drawing:drawingInterface};
      socketService.getIo().emit(SOCKETEVENT.JOINDRAWING,JSON.stringify(joinDrawingNotification));
    }

  }

  async leaveDrawing(socket:Socket,mail:String) {
    let drawing:any={};
    console.log(this.socketInDrawing.get(socket?.id as string).getVisibility());
    if(this.socketInDrawing.get(socket?.id as string).getVisibility()==VISIBILITY.PUBLIC || this.socketInDrawing.get(socket?.id as string).getVisibility()==VISIBILITY.PRIVATE) {
      drawing=this.socketInDrawing.get(socket?.id as string) as Drawing;
      let drawingInterface:any={
        drawingName:this.sourceDrawingName(drawing.getName()),
        owner:drawing.getOwner(),
        elements:drawing.getElementsInterface(),
        roomName:drawing.roomName,
        members:drawing.getMembers(),
        visibility:drawing.getVisibility(),
        creationDate:drawing.getCreationDate(),
        likes:drawing.getLikes()
      }
      console.log("leave drawing:"+drawing.getName());
      socket?.leave(drawing.getName() as string);
      roomService.leaveRoom(socket,this.sourceDrawingName(drawing.getName()),mail);
      drawingService.socketInDrawing.delete(socket?.id as string);
      
      drawing.removeMember(socket?.id as string);
      drawing.modified=true;
      await this.autoSaveDrawing(drawing.getName());
  
      this.drawings[`${drawing.getName()}`]=drawing;
      this.socketInDrawing.set(socket?.id as string,drawing);
  
      const message={useremail:mail,drawing:drawingInterface};
      socketService.getIo().emit(SOCKETEVENT.LEAVEDRAWING,JSON.stringify(message));
    }

    if(this.socketInDrawing.get(socket?.id as string).getVisibility()==VISIBILITY.PROTECTED) {
      drawing=this.socketInDrawing.get(socket?.id as string) as ProtectedDrawing;
      let drawingInterface:any={
        drawingName:this.sourceDrawingName(drawing.getName()),
        owner:drawing.getOwner(),
        elements:drawing.getElementsInterface(),
        roomName:drawing.roomName,
        members:drawing.getMembers(),
        visibility:drawing.getVisibility(),
        creationDate:drawing.getCreationDate(),
        likes:drawing.getLikes()
      }
      drawingInterface["password"]=drawing.getPassword();
      console.log("leave drawing:"+drawing.getName());
      socket?.leave(drawing.getName() as string);
      roomService.leaveRoom(socket,this.sourceDrawingName(drawing.getName()),mail);
      drawingService.socketInDrawing.delete(socket?.id as string);
      
      drawing.removeMember(socket?.id as string);
      drawing.modified=true;
      this.autoSaveDrawing(drawing.getName());
  
      this.drawings[`${drawing.getName()}`]=drawing;
      this.socketInDrawing.set(socket?.id as string,drawing);
  
      const message={useremail:mail,drawing:drawingInterface};
      socketService.getIo().emit(SOCKETEVENT.LEAVEDRAWING,JSON.stringify(message));
    }

   
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
      let drawingDoc=await DrawingSchema.drawingSchema.findOne(filter);
      await DrawingSchema.drawingSchema.updateOne(filter,drawingUpdate).catch((e:Error)=>{
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
           let drawingDoc=await DrawingSchema.drawingSchema.findOne(filter);
           await DrawingSchema.drawingSchema.updateOne(filter,drawingUpdate).catch((e:Error)=>{
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
