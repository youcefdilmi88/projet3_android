import { Line } from "../class/Line";
import { BaseShapeInterface } from "./BaseShapeInterface";
import { Point } from "./Point";

export interface LineInterface extends BaseShapeInterface {
    pointsList: Point[];
}

export function checkLine(object:any):object is Line {
    return 'pointsList' in object;
}
