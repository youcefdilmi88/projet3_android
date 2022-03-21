import { AlbumInterface } from "../Interface/AlbumInterface";
import { PrivateAlbumInterface } from "../Interface/PrivateAlbumInterface";

import { Album } from "./Album";


export class PrivateAlbum extends Album {
    private password:String;

    constructor(album:PrivateAlbumInterface) {
        const base={
            albumName:album.albumName,
            creator:album.creator,
            drawings:album.drawings,
            visibility:album.visibility
        } as AlbumInterface

        super(
          base
        );

        this.password=album.password;
    }

    getPassword():String {
        return this.password;
    }

    setPassword(password:String):void {
        this.password=password;
    }
    
}