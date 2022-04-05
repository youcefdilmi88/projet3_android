import express, { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";
import { Drawing } from "../class/Drawing";
import { User } from "../class/User";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { SOCKETEVENT } from "../Constants/socketEvent";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
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
    let owner:String=req.body.owner as String;
    let elements:BaseShapeInterface[]=[];
    let roomName:String=req.body.drawingName as String;
    let members:String[]=[];
    let visibility:String=req.body.visibility as String;
    let date:Number=Date.now();
    let likes:String[]=[];

    console.log("created drawing name:"+drawingName);

    if(drawingName && owner && roomName) {
      if(drawingService.drawings.has(drawingName)) {
        return res.status(404).json({message:HTTPMESSAGE.DRAWINGEXIST});
      } 
      if(roomService.getAllRooms().has(roomName)) {
        return res.status(404).json({message:HTTPMESSAGE.ROOMEXIST});
      }
      drawingService.createDrawing(drawingName,owner,elements,roomName,members,visibility,date,likes).catch((e:Error)=>{
            console.log(e);
      });
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS}); 
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const deleteDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String;
    let roomName:String=req.body.drawingName as String;

    if(drawingService.drawings.has(drawingName)) {
       drawingService.deleteDrawing(drawingName);
       roomService.deleteRoom(roomName);
       return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }

    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const getAllDrawings=(req:Request,res:Response,next:NextFunction)=>{
    let drawings:DrawingInterface[]=[];
    drawingService.drawings.forEach((v,k)=>{
        let drawing:DrawingInterface={
            drawingName:drawingService.sourceDrawingName(v.getName()),
            owner:v.getOwner(),
            elements:v.getElementsInterface(),
            roomName:v.roomName,
            members:v.getMembers(),
            visibility:v.getVisibility(),
            creationDate:v.getCreationDate(),
            likes:v.getLikes()
        }
        drawings.push(drawing);
    });
    
    return res.status(200).json(drawings);
}

const leaveDrawing=(req:Request,res:Response,next:NextFunction)=>{

    let useremail:String=req.body.useremail as String;
    let user:User=userService.getUserByUseremail(useremail) as User;

    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    let socket:Socket=socketService.getIo().sockets.sockets.get(socketId) as Socket;

    if(drawingService.socketInDrawing.has(socket?.id as string)) {
        drawingService.leaveDrawing(socket,useremail);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
  
    return res.status(404).json({message:SOCKETEVENT.UNOTCONNECTED});
}

const getDrawingByName=async (req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=req.params.drawingName as String;
    if(drawingService.drawings.has(drawingName)) {
        let drawing;
        await DrawingSchema.findOne({drawingName:drawingName}).then((data)=>{
          drawing=data;
      }).catch((e:Error)=>{console.log(e)});
      return res.status(200).json({drawing:drawing});
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const updateDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let useremail:String=req.body.useremail as String;
    let drawingName:String=drawingService.addonDrawingName(req.body.drawing.drawingName) as String;
    let drawingVisibility:String=req.body.drawing.visibility as String;
    
    if(drawingService.drawings.has(drawingName)) {
      let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;
      if(drawing.getOwner()==useremail) {
          drawing.setVisibility(drawingVisibility);
          if(req.body.newName!=undefined) {
            let newName:String=drawingService.addonDrawingName(req.body.newName) as String;
            if(drawingService.drawings.has(newName)) {
                return res.status(404).json({message:HTTPMESSAGE.DRAWINGEXIST});
            }
            if(roomService.getAllRooms().has(drawingService.sourceDrawingName(newName))) {
                return res.status(404).json({message:HTTPMESSAGE.ROOMEXIST});
            }
            drawingService.overwriteDrawingName(newName,drawing);
            return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
          }
          drawingService.overwriteDrawingVisibility(drawing);
          return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
      }
    }
    return res.status(404).json({message:HTTPMESSAGE.DNOTFOUND});
}

const getConnectedUserInDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=req.params.drawingName as String;
    if(drawingService.drawings.has(drawingName)) {
        let count:number=0;
        let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;
        drawing.getMembers().forEach((drawingName)=>{
            count++;
        });
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS,count:count});
    }
    return res.status(404).json({message:HTTPMESSAGE.DNOTFOUND, count:0});
}
 
const likeDrawing=async (req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String;
    let useremail:String=req.body.useremail as String;
    console.log("server drawname", drawingName);
    console.log("server useremail", useremail);

    console.log("1", drawingService.drawings.get(drawingName)?.getLikes());
    console.log("2", drawingService.drawings.get(drawingName)?.getLikes().indexOf(useremail));
    console.log("3", drawingService.drawings.get(drawingName));

    if(drawingService.drawings.get(drawingName)?.getLikes().indexOf(useremail)!=-1) {
       console.log("EMAIL EXIST");
        return res.status(404).json({message:HTTPMESSAGE.UALREADYLIKE});
    }

    if(drawingService.drawings.has(drawingName)) {
        await drawingService.addLikeDrawing(drawingName,useremail);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }

    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const removeLikeDrawing=(req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String;
    let useremail:String=req.body.useremail as String;

    if(drawingService.drawings.get(drawingName)?.getLikes().indexOf(useremail)!=-1) {
      drawingService.removeLikeDrawing(drawingName,useremail);
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}

router.post('/joinDrawing',joinDrawing);
router.post('/createDrawing',createDrawing);
router.get('/getAllDrawings',getAllDrawings);
router.post('/leaveDrawing',leaveDrawing);
router.post('/deleteDrawing',deleteDrawing);
router.get('/getDrawingByName/:drawingName',getDrawingByName);
router.post('/updateDrawing',updateDrawing);
router.get('/getConnectedUser/:roomName',getConnectedUserInDrawing);
router.post('/like',likeDrawing);
router.post('/removeLike',removeLikeDrawing);

export=router;