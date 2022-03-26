import { AlbumInterface } from "../Interface/AlbumInterface";
import albumService from "../Services/albumService";


export class Album {
    private albumName:String;
    private creator:String;
    private drawings:String[];
    private visibility:String;
    private dateCreation:Number;
    private nbContributeursActif:Number;
    private description:String;

    constructor(album:AlbumInterface) {
        this.albumName=album.albumName;
        this.creator=album.creator;
        this.drawings=album.drawings;
        this.visibility=album.visibility;
        this.dateCreation=album.dateCreation;
        this.nbContributeursActif=album.nbContributeursActif;
        this.description=album.description;
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

    getDateCreation():Number {
        return this.dateCreation;
    }

    getNbContributeursActif():Number {
       this.nbContributeursActif=albumService.getnbActifMembers(this.albumName) as Number;
       return this.nbContributeursActif;
    }

    getDescription():String {
        return this.description;
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

    setDateCreation(time:number):void {
        this.dateCreation=time;
    }

    setNbContributeursActif(nombre:number) {
        this.nbContributeursActif=nombre;
    }

    setDescription(text:String) {
        this.description=text;
    }

    

   
}