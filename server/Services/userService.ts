
import { User } from '../Interface/User';
import UserSchema from '../Entities/UserSchema';
import databaseService from './databaseService';


class UserService {
   constructor() {
      this.getAllUsers();
   } 

   private users=new Map<String,User>(); // all users in database
   private roomUsers=new Map<String,String>();

   public connectedUsers=new Map<string,string>();

   async getAllUsers(){
    this.users.clear();
     await databaseService.getAllUsers().then((users)=>{
         users.forEach((user)=>{
             this.users.set(user.useremail,user);
         })
     }).catch((e:any)=>{
        console.log(e);
     });
   }

   async createUser(email:String,pass:String,nickName:String) {
      const user=new UserSchema({useremail:email,password:pass,nickname:nickName});
      console.log(user.password);
      await user.save().catch((e:any)=>{
        console.log(e);
      });
      this.getAllUsers();
   }

   getUsers():Map<String,User> {
       return this.users;
   }

   getUser(useremail:String) {
        if(this.users.has(useremail)) {
          console.log(this.users.get(useremail));
          return this.users.get(useremail);
        }
        return null;
   }

   getUsersInRoom():Map<String,String> {
       return this.roomUsers;
   }

   addUserToRoom(id:String,useremail:String) {
       this.roomUsers.set(id,useremail);
   }

   removeUserFromRoom(id:String) {
       this.roomUsers.delete(id);
   }

   /********** connected users **************/
   getConnectedUsers():Map<string,string> {
       return this.connectedUsers;
   }



}

const userService=new UserService();
export default userService;