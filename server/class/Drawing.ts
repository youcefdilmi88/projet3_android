import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { checkLine } from "../Interface/LineInterface";
import { BaseShape } from "./BaseShape";
import { Line } from "./Line";


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
       this.elements=[];
       this.roomName=drawing.roomName;
       this.members=drawing.members;

       this.elementById=new Map<String,BaseShape>();
       this.membersBySocketId=new Map<string,String>();

       drawing.elements.forEach((element:BaseShapeInterface)=>{
           if(checkLine(element)) {
               let line:Line=element as Line;
               this.elementById.set(line.getId(),line);
           }
       });

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
             let elementInterface={  
               id:element.getId(),
               strokeWidth:element.getStrokeWidth(),
               fill:element.getFill(),
               stroke:element.getStroke(),
               fillOpacity:element.getFillOpacity(),
               strokeOpacity:element.getStrokeOpacity(),
               pointsList:element.getPoints()
             }
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
    



}
