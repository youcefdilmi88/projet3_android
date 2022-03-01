import express, { NextFunction, Request, Response } from 'express';
import userService from '../Services/userService';
import { Account } from '../class/Account';
import accountService from '../Services/accountService';
import { User } from '../class/User';
import roomService from '../Services/roomService';



let bcrypt=require("bcryptjs");

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{
  req.body.useremail=req.body.useremail as String;

    console.log("does account exists ? "+accountService.getAccounts().has(req.body.useremail as String));

    if(accountService.getAccounts().has(req.body.useremail)) {
        console.log("user already exists");
        return res.json(404);
    }    
    const salt=await bcrypt.genSalt();
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
  
    accountService.createAccount(req.body.useremail,hashedPassword,req.body.nickname);
    return res.json(200);
}

const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    const account=accountService.getAccount(req.body.useremail as String) as Account;
    console.log(req.body.useremail as String);
    if(account==null) {
        return res.status(400).json({message:'Cannot find user'});
    }
    if(userService.getLoggedUsers().has(account.getUserEmail() as string)) {
        return res.json({message:"user already connected"})
    }
    else {
      try {
        if(await bcrypt.compare(req.body.password,account.getUserPassword() as string)) {
          const userFound:User=userService.getUsers().find((user)=>user.getUseremail()==account.getUserEmail()) as User;
          userService.getLoggedUsers().set(userFound.getUseremail(),userFound);
       
          let defaultRoomName:String=roomService.getDefaultRoom().getRoomName() as String;
          console.log(defaultRoomName);
          return res.status(200).json({message:"success",user:userFound,currentRoom:defaultRoomName});
        }
        else {
          return res.status(404).json({message:"password does not match"});
        }
      }
      catch {
        return res.json(404);
      }
    }
}

const logoutUser=async(req:Request,res:Response,next:NextFunction)=>{
    let useremail:String=req.body.useremail;
    console.log(useremail+" wants to loggout");
    console.log("user in map for logout ? "+userService.getLoggedUsers().has(useremail))
    if(userService.getLoggedUsers().has(useremail)) {
        userService.getLoggedUsers().delete(useremail);
        return res.status(200).json({message:"success"})
    }
    return res.status(400).json({message:"user not found !"});
}

router.post('/registerUser',createUser);
router.post('/loginUser',loginUser);
router.post('/logoutUser',logoutUser);

export=router;
