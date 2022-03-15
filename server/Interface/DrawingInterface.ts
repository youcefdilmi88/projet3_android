import { BaseShapeInterface } from "./BaseShapeInterface";

export interface DrawingInterface {
    drawingName:String,
    creator:String,
    elements:BaseShapeInterface[],
    roomName:String,
    members:String[],
}

