import express, { NextFunction, Request, Response } from 'express';
import { Room } from '../class/Room';
import { User } from '../class/User';
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
         const joinRoomNotification={useremail:useremail,roomName:newRoom};

         socket?.join(newRoom as string);
         socket?.emit("JOINROOM",JSON.stringify(joinRoomNotification));

         console.log("ROOM CHANGE:"+newRoom);
          
         roomService.getSocketsRoomNames().delete(socket?.id as string);
         roomService.getSocketsRoomNames().set(socket?.id as string,newRoom as string);
         const message={message:"success"};
         return res.json(message);
    }
    const message={message:"failed"}
    return res.status(404).json(message);
}


const createRoom=(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body.roomName);
    let roomName:String=req.body.roomName as String;
    let creator:String=req.body.creator as String;
    let members:String[]=[];
    let messages:MessageInterface[]=[];

    if(roomService.getAllRooms().has(roomName)) {
        console.log("room already exists");
        return res.status(404).json({message:"room already exists"});
    }
    roomService.createRoom(roomName,creator,members,messages);
    return res.status(200).json({message:"success"});
}

router.get('/getAllRooms',getRooms);
router.post('/joinRoom',joinRoom);
router.post('/createRoom',createRoom);

export=router;