import { BaseShapeInterface } from "./BaseShapeInterface";

export interface RectangleInterface extends BaseShapeInterface {
    x:Number;
    y:Number;
    width:Number;
    height:Number;
    type:String;
}

export function checkRectangle(object:any):object is RectangleInterface {
    return object.type!=undefined && object.type=='rectangle';
}
