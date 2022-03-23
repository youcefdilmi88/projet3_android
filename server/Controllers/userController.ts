import express, { NextFunction, Request, Response } from 'express';
import userService from '../Services/userService';
import { Account } from '../class/Account';
import accountService from '../Services/accountService';
import { User } from '../class/User';
import roomService from '../Services/roomService';
import { HTTPMESSAGE } from '../Constants/httpMessage';
import socketService from '../Services/socketService';
import { Socket } from 'socket.io';



let bcrypt=require("bcryptjs");

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{
  req.body.useremail=req.body.useremail as String;

    console.log("does account exists ? "+accountService.getAccounts().has(req.body.useremail as String));
    if(req.body.useremail && req.body.password && req.body.nickname) {
      if(accountService.getAccounts().has(req.body.useremail)) {
         console.log("user already exists");
         const message={message:HTTPMESSAGE.FAILED};
         return res.status(404).json(message);
      }    
     const salt=await bcrypt.genSalt();
     const hashedPassword=await bcrypt.hash(req.body.password,salt);
  
     accountService.createAccount(req.body.useremail,hashedPassword,req.body.nickname);
     const message={message:HTTPMESSAGE.SUCCESS};
     return res.status(200).json(message);
  }
  else if(!req.body.useremail) {
    const message={message:HTTPMESSAGE.MAILUND};
    console.log("error undefined email");
    return res.status(404).json(message);
  }
  const message={message:HTTPMESSAGE.FAILED};
  return res.status(404).json(message);
}

const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    const account=accountService.getAccount(req.body.useremail as String) as Account;
    console.log(req.body.useremail as String);
    if(account==null) {
        return res.status(400).json({message:HTTPMESSAGE.UNOTFOUND});
    }
    if(userService.getLoggedUsers().has(account.getUserEmail() as string)) {
        return res.status(404).json({message:HTTPMESSAGE.UCONNECTED})
    }
    else {
      try {
        if(await bcrypt.compare(req.body.password,account.getUserPassword() as string)) {
          const userFound:User=userService.getUsers().find((user)=>user.getUseremail()==account.getUserEmail()) as User;
          userService.getLoggedUsers().set(userFound.getUseremail(),userFound);
       
          let defaultRoomName:String=roomService.getDefaultRoom().getRoomName() as String;
          console.log(defaultRoomName);
          return res.status(200).json({message:HTTPMESSAGE.SUCCESS,user:userFound,currentRoom:defaultRoomName});
        }
        else {
          return res.status(404).json({message:HTTPMESSAGE.PASSNOTMATCH});
        }
      }
      catch(e) {
        console.log(e);
        return res.status(404).json(e);
      }
    }
}

const logoutUser=async(req:Request,res:Response,next:NextFunction)=>{
    let useremail:String=req.body.useremail;
    
    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    let socket:Socket=socketService.getIo().sockets.sockets.get(socketId) as Socket;

    console.log(useremail+" wants to loggout");
    console.log("user in map for logout ? "+userService.getLoggedUsers().has(useremail))
    if(userService.getLoggedUsers().has(useremail)) {
        roomService.getAllRooms().forEach((v,k)=>{
          if(v.getUsersInRoom().includes(useremail)) {
            roomService.leaveRoom(socket,k,useremail);
          }
        })
        userService.getLoggedUsers().delete(useremail);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS})
    }
    return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}

router.post('/registerUser',createUser);
router.post('/loginUser',loginUser);
router.post('/logoutUser',logoutUser);

export=router;
