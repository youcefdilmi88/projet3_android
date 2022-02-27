
import { Socket,Server } from "socket.io";
import MessageSchema from "../Entities/MessageSchema";
import { Message } from "../Interface/Message";
import databaseService from "./databaseService";
import userService from "./userService";

class MessageService {

    constructor() {
      this.getAllRoomMessages();
    }

    private messages:Array<Message>=[];
    private io:Server;

    /***************** socket section ****************/
    initChat(server:Server) {
      this.io=server;
      this.connect();
    }

    connect():void {
      this.io.on("connection",(socket:Socket)=>{
        /***************** add user to connected users *****************/
        let useremail:string=socket.handshake.query.useremail as string;
        console.log("query email:"+useremail);
        userService.getConnectedUsers().set(useremail,socket.id);

        console.log("user "+useremail+" with socket id:"+socket.id+" is connected to the chat");

        this.sendMessage(socket);
        this.disconnect(socket);
      });
      
    }

    sendMessage(socket:Socket) {
      socket.on("MSG",async (data)=> {    // listen for event named random with data
        data = this.parseObject(data);
        console.log(data);
        await this.createMessage(data.time,data.useremail,data.message);  
        socket.broadcast.emit("MSG",data);  // send msg to all listener listening to room1 the right side json
      })
    }

    disconnect(socket:Socket) {
      socket.on("DISCONNECT",(data)=>{
        data=this.parseObject(data);
        let email:string=data.useremail as string;

        console.log("before");
        userService.getConnectedUsers().forEach((v,k)=>{
          console.log("key:"+k+""+" value:"+v);
        })
        console.log("");

        userService.getConnectedUsers().delete(email);
        socket.emit("DISCONNECT",{message:"logout"});

        console.log("after");
        userService.getConnectedUsers().forEach((v,k)=>{
          console.log("key:"+k+""+" value:"+v);
        })
      });
    }

    parseObject(arg: any): Object {
      if ((!!arg) && arg.constructor === Object) {
          return arg
      } else {
          try {
              return JSON.parse(arg);
          } catch(E){
              return {};
          }
      }
    }


    /************************** HTTP section *************************/

    getMessages():Array<Message> {
        return this.messages;
    }

    async getAllRoomMessages(){
      this.messages=[];
      await databaseService.getRoomMessages().then((messages)=>{
          messages.forEach((message)=>{
              this.messages.push(message as Message);
          })
      }).catch((e:any)=>{
        console.log(e);
     });
    }
 
    async createMessage(currentTime:Number,useremail:String,text:String) {
       try {
         const message=new MessageSchema({time:currentTime,useremail:useremail,message:text});
         await message.save();
         this.getAllRoomMessages();
       }
       catch(error) {
         console.log(error);
       }
    }
    
 
   
 
 
 
 }
 
 const messageService=new MessageService();
 export default messageService;