import mongoose from 'mongoose';
import {Account} from '../Interface/Account';


const accountSchema = new mongoose.Schema({
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

export=mongoose.model<Account>('accountSchema',accountSchema);