import mongoose from 'mongoose'

interface Message {
  content:String,
  sender:String,
}

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    }

});

export=mongoose.model<Message>('messageSchema',messageSchema);