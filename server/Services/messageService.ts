
import { Socket,Server } from "socket.io";
import { Message } from "../class/Message";
import MessageSchema from "../Entities/MessageSchema";
import databaseService from "./databaseService";
import userService from "./userService";

class MessageService {

    constructor() {
      this.loadAllRoomMessages();
    }

    private messages:Array<Message>=[];
    private io:Server;
    private roomName:string;

    /***************** socket section ****************/
    initChat(server:Server) {
      this.io=server;
      this.connect();
    }

    connect():void {
      this.io.on("connection",(socket:Socket)=>{
        /***************** add user to connected users *****************/
        let useremail:String=socket.handshake.query.useremail as String;
        console.log("query email:"+useremail);
        userService.getConnectedUsers().set(useremail,socket.id);

        userService.getUsers().forEach((user)=>{
           if(user.getUseremail()==useremail) {
             this.roomName=user.getCurrentRoom() as string;
           }
        });
        socket.join(this.roomName);
        console.log("user "+useremail+" with socket id:"+socket.id+" is connected to the chat");
        
        this.sendMessage(socket);
        this.disconnect(socket);
      });
      
    }

    sendMessage(socket:Socket) {
      socket.on("MSG",async (data)=> {    // listen for event named random with data
        data = this.parseObject(data);
        console.log(data);
        await this.createMessage(data.time,data.nickname,data.message);  
        socket.broadcast.to(this.roomName).emit("MSG",data);  // send msg to all listener listening to room1 the right side json
      })
    }

    disconnect(socket:Socket) {
      socket.on("DISCONNECT",(data)=>{
        data=this.parseObject(data);
        let email:string=data.useremail as string;    
        socket.emit("DISCONNECT",{message:"success"});
        console.log('user '+email+" just disconnected from chat !");
        socket.disconnect();
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

    async loadAllRoomMessages(){
      this.messages=[];
      await databaseService.getRoomMessages().then((messages)=>{
          messages.forEach((message)=>{
              let messageObj=new Message(message.time,message.nickname,message.message);
              this.messages.push(messageObj);
          })
      }).catch((e:any)=>{
        console.log(e);
     });
    }
 
    async createMessage(currentTime:Number,name:String,text:String) {
       try {
         const message=new MessageSchema({time:currentTime,nickname:name,message:text});
         await message.save();
         this.loadAllRoomMessages();
       }
       catch(error) {
         console.log(error);
       }
    }
    
 
   
 
 
 
 }
 
 const messageService=new MessageService();
 export default messageService;