import mongoose from 'mongoose'
import { Message } from '../Interface/Message';


const messageSchema = new mongoose.Schema({
    time:{
        type:Number,
        requires:true,
        unique:true,
    },
    useremail: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

export=mongoose.model<Message>('messageSchema',messageSchema);