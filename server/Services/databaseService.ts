import  mongoose  from 'mongoose';
import AccountSchema from '../Entities/AccountSchema';
import MessageSchema from '../Entities/MessageSchema';
import UserSchema from '../Entities/UserSchema';
import { AccountInterface } from '../Interface/Account';
import { MessageInterface } from '../Interface/Message';
import { UserInterface } from '../Interface/User';



require('dotenv').config();

let host:string=process.env.MONGO_HOST as string;

class DatabaseService {
    constructor() {
      this.connectToDatabase();
    }

    connectToDatabase() {
        mongoose.connect(host).then(()=>{
            console.log("database connected");
        }).catch((error:Error)=>{
            console.log(error)
        })
    }

    async getAllAccounts() {
        return await AccountSchema.find({}).then((data)=>{
           return data as Array<AccountInterface>;
        })
    }

    async getRoomMessages() {
        return await MessageSchema.find({}).then((data)=>{
            return data as Array<MessageInterface>;
        })
    }

    async getAllUsers() {
        return await UserSchema.find({}).then((data)=>{
            return data as Array<UserInterface>;
        })
    }
}

const databaseService=new DatabaseService();
export default databaseService;