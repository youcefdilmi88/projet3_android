import { AlbumInterface } from "../Interface/AlbumInterface";

export class Album {
    private albumName:String;
    private creator:String;
    private drawings:String[];
    private visibility:String;

    constructor(album:AlbumInterface) {
        this.albumName=album.albumName;
        this.creator=album.creator;
        this.drawings=album.drawings;
        this.visibility=album.visibility;
    }

    getName():String {
        return this.albumName;
    }

    getCreator():String {
        return this.creator;
    }

    getDrawings():String[] {
        return this.drawings;
    }

    getVisibility():String {
        return this.visibility;
    }

    addDrawing(drawingName:String):void {
        this.drawings.push(drawingName);
    }

    removeDrawing(drawingName:String):void {
        const index = this.drawings.indexOf(drawingName);
        
        if (index > -1) {
            this.drawings.splice(index, 1); 
        }
    }

    setName(name:String):void {
        this.albumName=name;
    }

    

   
}