import express, { NextFunction, Request, Response } from 'express';
import { RoomInterface } from '../Interface/Room';
import roomService from '../Services/roomService';


const router = express.Router();

const getRooms=(req:Request,res:Response,next:NextFunction)=>{
    let rooms:RoomInterface[]=[];
    roomService.getAllRooms().forEach((v,k)=>{
       rooms.push(v);
    })
    return res.status(200).json(rooms);
}

const createRoom=(req:Request,res:Response,next:NextFunction)=>{
    let roomName:String=req.body.roomName as String;
    let creator:String=req.body.creator as String;
    let members:String[]=[];

    if(roomService.getAllRooms().has(roomName)) {
        console.log("room already exists");
        return res.status(404).json({message:"room already exists"});
    }
    roomService.createRoom(roomName,creator,members);
    return res.status(200).json({message:"success"});
}

router.get('/getAllRooms',getRooms);
router.post('/createRoom',createRoom);

export=router;