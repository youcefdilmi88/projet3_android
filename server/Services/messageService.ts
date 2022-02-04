import MessageSchema from "../Entities/MessageSchema";
import { Message } from "../Interface/Message";
import databaseService from "./databaseService";

class MessageService {
    constructor() {
      this.getAllRoomMessages();
    } 
    private messages:Array<Message>=[];

    getMessages() {
        return this.messages;
    }

    async getAllRoomMessages(){
      this.messages=[];
      await databaseService.getRoomMessages().then((messages)=>{
          messages.forEach((message)=>{
              this.messages.push(message);
          })
        
      });
    }
 
    async createMessage(currentTime:Number,text:String,useremail:String) {
       const message=new MessageSchema({time:currentTime,userEmail:useremail,message:text});
       await message.save();

       this.getAllRoomMessages();
    }
    
 
   
 
 
 
 }
 
 const messageService=new MessageService();
 export default messageService;