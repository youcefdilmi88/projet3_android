import { AlbumInterface } from "./AlbumInterface";

export interface PrivateAlbumInterface extends AlbumInterface {
    password:String;
}

export function checkPrivateAlbum(object:any):object is PrivateAlbumInterface {
    return 'password'!==undefined;
}
