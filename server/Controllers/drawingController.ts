import express, { NextFunction, Request, Response } from "express";
import { Drawing } from "../class/Drawing";
import { User } from "../class/User";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { SOCKETEVENT } from "../Constants/socketEvent";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { MessageInterface } from "../Interface/Message";
import drawingService from "../Services/drawingService";
import roomService from "../Services/roomService";
import socketService from "../Services/socketService";
import userService from "../Services/userService";

const router = express.Router();

const joinDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=req.body.drawingName as String;
    let useremail:String=req.body.useremail as String;

    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;

    let socket=socketService.getIo().sockets.sockets.get(socketId);

    if(drawingService.drawings.has(drawingName)) {
        let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;
        if(drawing.membersBySocketId.has(socket?.id as string)==false) {
            socket?.join(drawingName as string);
            drawingService.socketInDrawing.set(socket?.id as string,drawing);
            drawing.addMember(socket?.id as string,useremail);
            return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
        }
        return res.status(404).json({message:HTTPMESSAGE.UCONNECTED});
    }

    return res.status(404).json({message:HTTPMESSAGE.FAILED});

}

const createDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=req.body.drawingName as String;
    let creator:String=req.body.creator as String;
    let elements:BaseShapeInterface[]=[];
    let roomName:String=drawingName;
    let members:String[]=[];

    if(drawingName && creator && roomName) {
      if(drawingService.drawings.has(drawingName)==false) 
      {
        if(roomService.getAllRooms().has(roomName)) 
        {
            return res.status(404).json({message:HTTPMESSAGE.ROOMEXIST});
        }
        drawingService.createDrawing(drawingName,creator,elements,roomName,members).then(()=>{
            let messages:MessageInterface[]=[];
            roomService.createRoom(drawingName,creator,members,messages).then(()=>{
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
    let drawings:Drawing[]=[];
    drawingService.drawings.forEach((v,k)=>{
       drawings.push(v);
    });
    return res.status(200).json(drawings);
}

const leaveDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let useremail:String=req.body.useremail as String;
    let user:User=userService.getUserByUseremail(useremail) as User;
    if(userService.getSocketIdByUser().has(user)) {
        let socketId:string=userService.getSocketIdByUser().get(user) as string;
        let socket=socketService.getIo().sockets.sockets.get(socketId);
        if(drawingService.socketInDrawing.has(socket?.id as string)) {
            let drawing:Drawing=drawingService.socketInDrawing.get(socket?.id as string) as Drawing;
            socket?.leave(drawing.getName() as string);
            drawingService.socketInDrawing.delete(socket?.id as string);
            return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
        }
        return res.status(404).json({message:SOCKETEVENT.UNOTCONNECTED});
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

router.post('/joinDrawing',joinDrawing);
router.post('/createDrawing',createDrawing);
router.get('/getAllDrawings',getAllDrawings);
router.post('leaveDrawing',leaveDrawing);

export=router;