import express, { NextFunction, Request, Response } from 'express';
import userService from '../Services/userService';
import { User } from '../Interface/User';

let bcrypt=require("bcryptjs");

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{
    if(userService.getUsers().has(req.body.useremail)) {
        return res.json(404);
    }    
    const salt=await bcrypt.genSalt();
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    userService.createUser(req.body.useremail,hashedPassword,req.body.nickname);
    return res.json(200);
}

const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    const user=userService.getUser(req.body.useremail as String) as User;
    console.log(userService.getConnectedUsers().has(user.useremail as string))
    if(user==null) {
        return res.status(400).json({message:'Cannot find user'});
    }
    if(userService.getConnectedUsers().has(user.useremail as string)) {
        return res.json({message:"user already connected"})
    }
    else {
      try {
        if(await bcrypt.compare(req.body.password,user.password as string)) {
          return res.status(200).json({message:"success",useremail:user.useremail,nickname:user.nickname});
        }
        else {
          return res.status(404).json({message:"password does not match",useremail:user.useremail,nickname:user.nickname});
        }
      }
      catch {
        return res.json(404);
      }
    }
}

const logoutUser=async(req:Request,res:Response,next:NextFunction)=>{
    let useremail=req.body.useremail;
    if(userService.getConnectedUsers().has(useremail)) {
        // userService.removeUserFromRoom(req.body.socketId);
        userService.getConnectedUsers().delete(useremail);
        return res.status(200).json({message:"logout"})
    }
    return res.status(400).json({message:"user not found !"});
}

router.post('/registerUser',createUser);
router.post('/loginUser',loginUser);
router.post('/logoutUser',logoutUser);

export=router;
