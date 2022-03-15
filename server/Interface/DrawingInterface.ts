import { BaseShapeInterface } from "./BaseShapeInterface";

export interface DrawingInterface {
    name:String,
    creator:String,
    elements:BaseShapeInterface[],
    roomName:String,
    members:String[],
}

