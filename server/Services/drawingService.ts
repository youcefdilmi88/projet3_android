import { Server, Socket } from "socket.io";
import { Drawing } from "../class/Drawing";
import DrawingSchema from "../Entities/DrawingSchema";
import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import databaseService from "./databaseService";


class DrawingService {

  private io:Server;
  public drawings:Map<String,Drawing>;  // drawingName and Drawing
  public socketInDrawing:Map<string,Drawing>;
  
  constructor() { 
    this.drawings=new Map<String,Drawing>();
    this.socketInDrawing=new Map<string,Drawing>();
    this.loadAllDrawings();
  }


  initDrawing(server:Server) {
    this.io=server;
    this.connect();
  }

  connect() {
    this.io.on("connection",(socket:Socket)=>{
        console.log("user start drawing "+socket.id);
    })
  }

  async loadAllDrawings() {
    this.drawings.clear();
    await databaseService.getAllDrawings().then((drawings)=>{
      drawings.forEach((drawing)=>{
        let drawingObj:Drawing=new Drawing(drawing);
        this.drawings.set(drawingObj.getName(),drawingObj);
      })
    }).catch((e:Error)=>{
        console.log(e);
    });
  }

  async createDrawing(drawingName:String,creator:String,elements:BaseShapeInterface[],roomName:String,members:String[]) {
    try {
      const drawing=new DrawingSchema({drawingName:drawingName,creator:creator,elements:elements,roomName:roomName,members:members});
      await drawing.save();
      console.log("drawing saved");
      const drawingInterface:DrawingInterface={
        name:drawingName,
        creator:creator,
        elements:elements,
        roomName:roomName,
        members:members,
      }
      const drawingObj=new Drawing(drawingInterface);
      this.drawings.set(drawingObj.getName(),drawingObj);
    }
    catch(error) {
      console.log(error);
    }
  }

}

const drawingService=new DrawingService();
export default drawingService;
