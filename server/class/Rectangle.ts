import { RectangleInterface } from "../Interface/RectangleInterface";
import { BaseShape } from "./BaseShape";

export class Rectangle extends BaseShape {
    
    private x:Number;
    private y:Number;
    private width:Number;
    private height:Number;
    private finalX:Number;
    private finalY:Number;

    constructor(rectangle:RectangleInterface) {
       super(
         rectangle.id,
         rectangle.user,
         rectangle.strokeWidth,
         rectangle.fill,
         rectangle.stroke,
         rectangle.fillOpacity,
         rectangle.strokeOpacity
       )
       this.x=rectangle.x;
       this.y=rectangle.y;
       this.width=rectangle.width;
       this.height=rectangle.height;
       this.finalX=rectangle.finalX;
       this.finalY=rectangle.finalY;
    }

    getX():Number {
        return this.x;
    }

    getY():Number {
        return this.y;
    }

    getWidth():Number {
        return this.width;
    }

    getHeight():Number {
        return this.height;
    }

    getFinalX():Number {
        return this.finalX;
    }

    getFinalY():Number {
        return this.finalY;
    }
}