import { User } from "../class/User";
import databaseService from "./databaseService";


class UserService {
   constructor() {
       this.loadAllUsers();
   } 

   private users:User[]=[];

   private roomUsers=new Map<String,String>();
   public loggedUsers=new Map<String,User>(); // useremail and user
   private userBySocketId=new Map<string,User>();
   private socketIdByUser=new Map<User,string>();


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
       return this.users;
   }

   getUsersBySocketId():Map<string,User> {
       return this.userBySocketId;
   }

   getSocketIdByUser():Map<User,string> {
       return this.socketIdByUser;
   }

   getUserByUseremail(email:String) {
       return this.users.find((user)=>user.getUseremail()==email);
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

   /********** users logged in **************/
   getLoggedUsers():Map<String,User> {
       return this.loggedUsers;
   }





}

const userService=new UserService();
export default userService;