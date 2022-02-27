import  mongoose  from 'mongoose';
import AccountSchema from '../Entities/AccountSchema';
import MessageSchema from '../Entities/MessageSchema';
// import UserSchema from '../Entities/UserSchema';
import { Account } from '../Interface/Account';
import { Message } from '../Interface/Message';



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
           return data as Array<Account>;
        })
    }

    async getRoomMessages() {
        return await MessageSchema.find({}).then((data)=>{
            return data as Array<Message>;
        })
    }
}

const databaseService=new DatabaseService();
export default databaseService;