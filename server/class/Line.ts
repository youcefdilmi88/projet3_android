import { LineInterface } from "../Interface/LineInterface";
import { Point } from "../Interface/Point";
import { BaseShape } from "./BaseShape";

export class Line extends BaseShape {

    points:Point[];

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
       this.points=line.pointsList;
    }
    
    getPoints():Point[] {
        return this.points;
    }

    addPoint(point:Point):void {
        this.points.push(point);
    }
}
