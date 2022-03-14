import express, { NextFunction, Request, Response } from 'express';
import { Room } from '../class/Room';
import { User } from '../class/User';
import { HTTPMESSAGE } from '../Constants/httpMessage';
import { SOCKETEVENT } from '../Constants/socketEvent';
import { MessageInterface } from '../Interface/Message';
import { UserInterface } from '../Interface/User';
import roomService from '../Services/roomService';
import socketService from '../Services/socketService';
import userService from '../Services/userService';


const router = express.Router();

const getRooms=(req:Request,res:Response,next:NextFunction)=>{
    let rooms:Room[]=[];
    roomService.getAllRooms().forEach((v,k)=>{
       rooms.push(v);
    })
    return res.status(200).json(rooms);
}


const joinRoom=(req:Request,res:Response,next:NextFunction)=>{
    
    let userInterface:UserInterface=req.body.user as UserInterface;
    let user:User=userService.getUserByUseremail(userInterface.useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;

    let socket=socketService.getIo().sockets.sockets.get(socketId);
   

    let newRoom:String=req.body.newRoomName as String;
    let useremail:String=user.getUseremail();
   
    if(roomService.getAllRooms().has(newRoom)) {
         let nextRoom:Room=roomService.getRoomByName(newRoom) as Room;
       
         nextRoom.addUserToRoom(useremail);
         roomService.getSocketsRoomNames().delete(socket?.id as string);
         roomService.getSocketsRoomNames().set(socket?.id as string,newRoom as string);
         const joinRoomNotification={useremail:useremail,roomName:newRoom};

         socket?.join(newRoom as string);
     
         socketService.getIo().emit(SOCKETEVENT.JOINROOM,JSON.stringify(joinRoomNotification));
         console.log("ROOM CHANGE:"+newRoom);
          
         const message={message:HTTPMESSAGE.SUCCESS};
         return res.status(200).json(message);
    }
    const message={message:HTTPMESSAGE.FAILED}
    return res.status(404).json(message);
}


const createRoom=(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body.roomName);
    console.log(req.body.creator);
    let roomName:String=req.body.roomName as String;
    let creator:String=req.body.creator as String;
    let members:String[]=[];
    let messages:MessageInterface[]=[];

    const user:User=userService.getUserByUseremail(creator) as User;

    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    console.log(socketId);
   
    if(roomService.getAllRooms().has(roomName)) {
        console.log("room already exists");
        return res.status(404).json({message:HTTPMESSAGE.FAILED});
    }
    
    roomService.createRoom(roomName,creator,members,messages).then(()=>{
        const message={message:"room created"};
        console.log("new room event sent");
        socketService.getIo().emit(SOCKETEVENT.CREATEROOM,JSON.stringify(message));
    }).catch((e:Error)=>{
        console.log(e);
    });
    return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
}

const deleteRoom=(req:Request,res:Response,next:NextFunction)=>{
   let roomName:String=req.body.roomName as String;
   console.log("room to delete:"+roomName);
   if(roomName!=roomService.getDefaultRoom().getRoomName()) {
    roomService.deleteRoom(roomName).then(()=>{
        const message={message:"room deleted"};
        socketService.getIo().emit(SOCKETEVENT.ROOMDELETED,JSON.stringify(message));
    });
    return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
   }
   return res.status(404).json({message:HTTPMESSAGE.FAILED});
  
}

router.get('/getAllRooms',getRooms);
router.post('/joinRoom',joinRoom);
router.post('/createRoom',createRoom);
router.delete('/deleteRoom',deleteRoom);

export=router;