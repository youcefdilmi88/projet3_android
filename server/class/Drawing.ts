import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { checkEllipse, EllipseInterface } from "../Interface/EllipseInterface";
import { checkLine, LineInterface } from "../Interface/LineInterface";
import { checkRectangle, RectangleInterface } from "../Interface/RectangleInterface";
import drawingService from "../Services/drawingService";
import { BaseShape } from "./BaseShape";
import { Ellipse } from "./Ellipse";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";


export class Drawing {
    private drawingName:String;
    private creator:String;
    private elements:BaseShape[];  // shapeId and Shape
    public roomName:String;
    public members:String[];

    elementById:Map<String,BaseShape>;
    membersBySocketId:Map<string,String>;  // socketId and useremail

    constructor(drawing:DrawingInterface) {
       this.drawingName=drawing.drawingName;
       this.creator=drawing.creator;
       this.roomName=drawing.roomName;
       this.members=drawing.members;
       this.elements=[];
       this.elementById=new Map<String,BaseShape>();
       this.membersBySocketId=new Map<string,String>();

       drawing.elements.forEach((element:BaseShapeInterface)=>{
           if(checkLine(element)) {
               console.log("line");
               let line:Line=new Line(element);
               this.elementById.set(line.getId(),line);
           }
           if(checkEllipse(element)) {
               console.log("ellipse");
               let ellipse:Ellipse=new Ellipse(element);
               this.elementById.set(ellipse.getId(),ellipse);
           }
           if(checkRectangle(element)) {
               console.log("rectangle");
               let rectangle:Rectangle=new Rectangle(element);
               this.elementById.set(rectangle.getId(),rectangle);
            }
       });
       this.autoSave();
    }

    getName():String {
        return this.drawingName;
    }

    getCreator():String {
        return this.creator;
    }

    getElements():BaseShape[] {
        this.elements=[];
        this.elementById.forEach((v,k)=>{
            this.elements.push(v);
        })
        return this.elements;
    }

    getElementsInterface():BaseShapeInterface[] {
       let interfaceInstances:BaseShapeInterface[]=[];
       this.getElements().forEach((element)=>{
           if(element instanceof Line) {
             let elementInterface:LineInterface={  
               id:element.getId(),
               strokeWidth:element.getStrokeWidth(),
               fill:element.getFill(),
               stroke:element.getStroke(),
               fillOpacity:element.getFillOpacity(),
               strokeOpacity:element.getStrokeOpacity(),
               pointsList:element.getPoints()
             } as LineInterface;
             interfaceInstances.push(elementInterface);
           }
           if(element instanceof Ellipse) {
              let elementInterface:EllipseInterface={
                id:element.getId(),
                strokeWidth:element.getStrokeWidth(),
                fill:element.getFill(),
                stroke:element.getStroke(),
                fillOpacity:element.getFillOpacity(),
                strokeOpacity:element.getStrokeOpacity(),
                x:element.getX(),
                y:element.getY(),
                width:element.getWidth(),
                height:element.getHeight(),
                type:"ellipse"
              } as EllipseInterface;
              interfaceInstances.push(elementInterface);
           }
           if(element instanceof Rectangle) {
            let elementInterface:RectangleInterface={
              id:element.getId(),
              strokeWidth:element.getStrokeWidth(),
              fill:element.getFill(),
              stroke:element.getStroke(),
              fillOpacity:element.getFillOpacity(),
              strokeOpacity:element.getStrokeOpacity(),
              x:element.getX(),
              y:element.getY(),
              width:element.getWidth(),
              height:element.getHeight(),
              type:"rectangle"
            } as RectangleInterface;
            interfaceInstances.push(elementInterface);
         }
       });
       
       return interfaceInstances;
    }

    getMembers():String[] {
        this.members=[];
        this.membersBySocketId.forEach((v,k)=>{
            this.members.push(v);
        })
        return this.members;
    }

    setName(name:String):void {
        this.drawingName=name;
    }

    setCreator(creator:String) {
        this.creator=creator;
    }

    setElements(elements:BaseShape[]) {
        this.elements=elements;
    }

    setMembers(members:String[]) {
        this.members=members;
    }

    removeMember(socketId:string):void {
        this.membersBySocketId.delete(socketId);
    }

    addMember(socketId:string,email:String) {
        this.membersBySocketId.set(socketId,email);
    }
    
    autoSave() {
        drawingService.autoSaveDrawing(this.drawingName);
        setTimeout(() => {
            this.autoSave();
       }, 10000)
    }


}
