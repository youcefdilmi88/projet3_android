import mongoose from 'mongoose';
import { DrawingInterface } from '../Interface/DrawingInterface';


const drawingSchema = new mongoose.Schema({
    
    drawingName: {
        type:String,
        required: true,
        unique:true,
    },
    owner: {
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
    },
    visibility:{
        type:String,
        required:true
    },
    creationDate:{
        type:Number,
        required:true
    }
    
});

export=mongoose.model<DrawingInterface>('drawingSchema',drawingSchema);