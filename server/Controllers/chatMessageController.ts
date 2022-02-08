import express, { NextFunction, Request, Response } from 'express';
import messageService from '../Services/messageService';


const router = express.Router();

const getRoomMessages=(req:Request,res:Response,next:NextFunction)=>{
    return res.status(200).json(messageService.getMessages());
}

router.get('/getRoomMessages',getRoomMessages);
export=router;