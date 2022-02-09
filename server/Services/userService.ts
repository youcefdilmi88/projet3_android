
import { User } from '../Interface/User';
import UserSchema from '../Entities/UserSchema';
import databaseService from './databaseService';


class UserService {
   constructor() {
      this.getAllUsers();
   } 

   private users=new Map<String,User>();
   private roomUsers=new Map<String,String>();

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
      await user.save();
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


}

const userService=new UserService();
export default userService;