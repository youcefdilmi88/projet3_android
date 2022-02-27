import express, { NextFunction, Request, Response } from 'express';
import userService from '../Services/userService';
import accountService from '../Services/AccountService';
import { Account } from '../class/Account';

let bcrypt=require("bcryptjs");

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{
  req.body.useremail=req.body.useremail as String
    console.log("does account exists ? "+accountService.getAccounts().has(req.body.useremail as String))
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

    if(account==null) {
        return res.status(400).json({message:'Cannot find user'});
    }
    if(userService.getConnectedUsers().has(account.getUserEmail() as string)) {
        return res.json({message:"user already connected"})
    }
    else {
      try {
        if(await bcrypt.compare(req.body.password,account.getUserPassword() as string)) {
          return res.status(200).json({message:"success",useremail:account.getUserEmail(),nickname:account.getUserNickname()});
        }
        else {
          return res.status(404).json({message:"password does not match",useremail:account.getUserEmail(),nickname:account.getUserNickname()});
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
        userService.getConnectedUsers().delete(useremail);
        return res.status(200).json({message:"success"})
    }
    return res.status(400).json({message:"user not found !"});
}

router.post('/registerUser',createUser);
router.post('/loginUser',loginUser);
router.post('/logoutUser',logoutUser);

export=router;
