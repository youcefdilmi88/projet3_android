
import { User } from '../Interface/User';
import UserSchema from '../Entities/UserSchema';
import databaseService from './databaseService';

class UserService {
   constructor() {
      this.getAllUsers();
   } 

   private users=new Map<String,User>();

   async getAllUsers(){
     await databaseService.getAllUsers().then((users)=>{
         users.forEach((user)=>{
             this.users.set(user.useremail,user);
         })
     });
   }

   async createUser(email:String,pass:String,nickName:String) {
      const user=new UserSchema({useremail:email,password:pass,nickname:nickName});
      await user.save().then().catch((error)=>{
          console.log(error);
      });
   }

   getUsers():Map<String,User> {
       return this.users;
   }

   getUser(useremail:String):User | undefined {
         return this.users.get(useremail);
   }



}

const userService=new UserService();
export default userService;