import express, { NextFunction, Request, Response } from "express";
import { Drawing } from "../class/Drawing";
import { User } from "../class/User";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { SOCKETEVENT } from "../Constants/socketEvent";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { MessageInterface } from "../Interface/Message";
import drawingService from "../Services/drawingService";
import roomService from "../Services/roomService";
import socketService from "../Services/socketService";
import userService from "../Services/userService";

const router = express.Router();

const joinDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String;
    let useremail:String=req.body.useremail as String;

    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;

    let socket=socketService.getIo().sockets.sockets.get(socketId);

    console.log("join drawing name:"+drawingName);

    console.log(drawingService.drawings.has(drawingName));
    drawingService.drawings.forEach((v,k)=>{
        console.log(k);
    })
    
    if(drawingService.drawings.has(drawingName)) {
        let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;

        if(drawing.membersBySocketId.has(socket?.id as string)==false) {
            // join drawing and chat associated
            drawingService.joinDrawing(drawingName,useremail);

            if(roomService.getAllRooms().has(drawing.roomName)) { // if room associated with chat is not deleted
              roomService.joinRoom(drawing.roomName,useremail);
            }
            return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
        }
        return res.status(404).json({message:HTTPMESSAGE.UCONNECTED});
    }

    return res.status(404).json({message:HTTPMESSAGE.FAILED});

}

const createDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String; 
    let creator:String=req.body.creator as String;
    let elements:BaseShapeInterface[]=[];
    let roomName:String=req.body.drawingName as String;
    let members:String[]=[];

    console.log("created drawing name:"+drawingName);

    if(drawingName && creator && roomName) {
      if(drawingService.drawings.has(drawingName)==false) 
      {
        if(roomService.getAllRooms().has(roomName)) 
        {
            return res.status(404).json({message:HTTPMESSAGE.ROOMEXIST});
        }
        drawingService.createDrawing(drawingName,creator,elements,roomName,members).then(()=>{
            let messages:MessageInterface[]=[];
            roomService.createRoom(roomName,creator,members,messages).then(()=>{
                const messageDrawing={message:"drawing created"};
                const messageRoom={message:"room created"};
                socketService.getIo().emit(SOCKETEVENT.DRAWINGCREATED,JSON.stringify(messageDrawing));
                socketService.getIo().emit(SOCKETEVENT.CREATEROOM,JSON.stringify(messageRoom));
            }).catch((e:Error)=>{
                console.log(e);
            }).catch((e:Error)=>{
                console.log(e);
            });
        });
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
      }
      return res.status(404).json({message:HTTPMESSAGE.DRAWINGEXIST});
    }

    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const getAllDrawings=(req:Request,res:Response,next:NextFunction)=>{
    let drawings:DrawingInterface[]=[];
    drawingService.drawings.forEach((v,k)=>{
        let drawing:DrawingInterface={
            drawingName:drawingService.sourceDrawingName(v.getName()),
            creator:v.getCreator(),
            elements:v.getElementsInterface(),
            roomName:v.roomName,
            members:v.getMembers(),
        }
        drawings.push(drawing);
    });
    return res.status(200).json(drawings);
}

const leaveDrawing=(req:Request,res:Response,next:NextFunction)=>{

    let useremail:String=req.body.useremail as String;
    let user:User=userService.getUserByUseremail(useremail) as User;

    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    let socket=socketService.getIo().sockets.sockets.get(socketId);

    if(drawingService.socketInDrawing.has(socket?.id as string)) {

        let drawing:Drawing=drawingService.socketInDrawing.get(socket?.id as string) as Drawing;
        console.log("leave drawing:"+drawing.getName());

        socket?.leave(drawing.getName() as string);
        drawingService.socketInDrawing.delete(socket?.id as string);
        drawing.removeMember(socket?.id as string);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
  
    return res.status(404).json({message:SOCKETEVENT.UNOTCONNECTED});
}

router.post('/joinDrawing',joinDrawing);
router.post('/createDrawing',createDrawing);
router.get('/getAllDrawings',getAllDrawings);
router.post('/leaveDrawing',leaveDrawing);

export=router;