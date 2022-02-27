

class UserService {
   constructor() {
   } 

   private roomUsers=new Map<String,String>();
   public connectedUsers=new Map<string,string>();

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