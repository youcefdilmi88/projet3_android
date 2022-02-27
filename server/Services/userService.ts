import { User } from "../class/User";
import databaseService from "./databaseService";


class UserService {
   constructor() {
       this.loadAllUsers();
   } 

   private users:User[]=[];
   private roomUsers=new Map<String,String>();
   public connectedUsers=new Map<string,string>();


   /********** All users *************/
   async loadAllUsers() {
       this.users=[];
       await databaseService.getAllUsers().then((users)=>{
           users.forEach((user)=>{
               let userObj=new User(user.useremail,user.nickname);
               this.users.push(userObj);
           })
       })
    }

   getUsers():User[] {
       console.log("ALL USERS")
       this.users.forEach((user)=>{
           console.log(user.getUseremail);
           console.log(user.getUserNickname());
       })
       return this.users;
   }

   /********* rooms ******************/

   getUsersInRoom():Map<String,String> {
       return this.roomUsers;
   }

   addUserToRoom(id:String,useremail:String) {
       this.roomUsers.set(id,useremail);
   }

   removeUserFromRoom(id:String) {
       this.roomUsers.delete(id);
   }

   /********** users connected to main chat **************/
   getConnectedUsers():Map<string,string> {
       return this.connectedUsers;
   }



}

const userService=new UserService();
export default userService;