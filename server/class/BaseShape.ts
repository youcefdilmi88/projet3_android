export abstract class BaseShape {
    private id:string;
    private strokeWidth:number;
    private fill:string;
    private stroke:string;
    private fillOpacity:string;
    private strokeOpacity:string;

    constructor(
        id:string,
        strokeWidth:number,
        fill:string,
        stroke:string,
        fillOpacity:string,
        strokeOpacity:string,
    ) {
        this.id=id;
        this.strokeWidth=strokeWidth;
        this.fill=fill;
        this.stroke=stroke;
        this.fillOpacity=fillOpacity;
        this.strokeOpacity=strokeOpacity;
    }
    
    getId():string {
        return this.id;
    }

    getStrokeWidth():number {
        return this.strokeWidth;
    }

    getFill():string {
        return this.fill;
    }

    getStroke():string {
        return this.stroke;
    }

    getFillOpacity():string {
        return this.fillOpacity;
    }

    getStrokeOpacity():string {
        return this.strokeOpacity;
    }

    setId(id:string):void {
        this.id=id;
    }

    setStrokeWidth(width:number):void {
        this.strokeWidth=width;
    }

    setFill(fill:string):void {
        this.fill=fill;
    }

    setStroke(stroke:string):void {
        this.stroke=stroke;
    }

    setFillOpacity(fillOpacity:string):void {
        this.fillOpacity=fillOpacity;
    }

    setStrokeOpacity(strokeOpacity:string):void {
        this.strokeOpacity=strokeOpacity;
    }






}
