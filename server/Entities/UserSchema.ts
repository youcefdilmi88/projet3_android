import mongoose from 'mongoose';
import {User} from '../Interface/User';


const userSchema = new mongoose.Schema({
    useremail: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: true,
    },
    nickname: {
        type:String,
        require: true,
    }

});

export=mongoose.model<User>('userSchema',userSchema);