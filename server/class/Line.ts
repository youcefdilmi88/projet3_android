import { LineInterface } from "../Interface/LineInterface";
import { Point } from "../Interface/Point";
import { BaseShape } from "./BaseShape";

export class Line extends BaseShape {

    pointsList:Point[];

    constructor(line:LineInterface) 
    {
       super(
           line.id,
           line.strokeWidth,
           line.fill,
           line.stroke,
           line.fillOpacity,
           line.strokeOpacity
       )
       this.pointsList=line.pointsList;
    }
    
    getPoints():Point[] {
        return this.pointsList;
    }

    addPoint(point:Point):void {
        this.pointsList.push(point);
    }
}
