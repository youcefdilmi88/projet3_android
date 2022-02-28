import express, { NextFunction, Request, Response } from 'express';
import roomService from '../Services/roomService';


const router = express.Router();

const getRooms=(req:Request,res:Response,next:NextFunction)=>{
    return res.status(200).json(roomService.getAllRooms());
}

const createRoom=(req:Request,res:Response,next:NextFunction)=>{
    let roomName:String=req.body.roomName as String;
    let useremail:String=req.body.useremail as String;
    let members:String[]=[];
    members.push(useremail);

    if(roomService.getAllRooms().has(roomName)) {
        console.log("room already exists");
        return res.status(404).json({message:"room already exists"});
    }
    roomService.createRoom(roomName,useremail,members);
    return res.status(200).json();
}

router.get('/getAllRooms',getRooms);
router.get('/createRoom',createRoom);

export=router;