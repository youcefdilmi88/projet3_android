import  mongoose  from 'mongoose';
import MessageSchema from '../Entities/MessageSchema';
import UserSchema from '../Entities/UserSchema';
import { Message } from '../Interface/Message';
import { User } from '../Interface/User';

const MONGO_USERNAME = "projet3";
const MONGO_PASSWORD = "projet123";
const MONGO_HOST =`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.g3voj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


class DatabaseService {
    constructor() {
      this.connectToDatabase();
    }

    connectToDatabase() {
        mongoose.connect(MONGO_HOST).then(()=>{
            console.log("connected");
        }).catch((error:Error)=>{
            console.log(error)
        })
    }

    async getAllUsers() {
        return await UserSchema.find({}).then((data)=>{
           return data as Array<User>;
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