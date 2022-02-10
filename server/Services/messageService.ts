
import MessageSchema from "../Entities/MessageSchema";
import { Message } from "../Interface/Message";
import databaseService from "./databaseService";

class MessageService {
    constructor() {
      this.getAllRoomMessages();
    } 
    private messages:Array<Message>=[];

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