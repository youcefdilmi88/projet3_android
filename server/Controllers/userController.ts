import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userService from '../Services/userService';
import { User } from '../Interface/User';

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{

       if(userService.getUsers().has(req.body.useremail)) {
           return res.json(404);
       }
      
        const salt=await bcrypt.genSalt();
        const hashedPassword=await bcrypt.hash(req.body.password,salt);
        console.log(salt);
        console.log(hashedPassword);
        userService.createUser(req.body.useremail,hashedPassword,req.body.nickname);
        return res.json(200);
       

}

const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    
    const user=userService.getUser(req.body.useremail) as User;
    console.log(user);
    if(user==null) {
        return res.status(400).json({message:'Cannot find user'});
    }
    try {
      if(await bcrypt.compare(req.body.password,user.password as string)) {
         return res.status(200).json({message:"success"});
      }
      else {
        return res.status(404).json({message:"password does not match"});
      }
    }
    catch {
       return res.json(404);
    }
    
}

router.post('/createUser',createUser);
router.post('/loginUser',loginUser);

export=router;
