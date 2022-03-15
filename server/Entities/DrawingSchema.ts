import mongoose from 'mongoose';
import { DrawingInterface } from '../Interface/DrawingInterface';


const drawingSchema = new mongoose.Schema({
    
    drawingName: {
        type:String,
        required: true,
        unique:true,
    },
    creator: {
        type:String,
        require: true,
    },
    elements: {
        type:[],
        required:true,
    },
    roomName:{
        type:String,
        required:true,
    },
    members:{
        type:[String],
        required:true,
    }
    
});

export=mongoose.model<DrawingInterface>('drawingSchema',drawingSchema);