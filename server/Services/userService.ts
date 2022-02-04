
import { User } from '../Interface/User';
import UserSchema from '../Entities/UserSchema';
import databaseService from './databaseService';

class UserService {
   constructor() {
      this.getAllUsers();
   } 

   private users=new Map<String,User>();

   async getAllUsers(){
    this.users.clear();
     await databaseService.getAllUsers().then((users)=>{
         users.forEach((user)=>{
             this.users.set(user.useremail,user);
         })
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



}

const userService=new UserService();
export default userService;