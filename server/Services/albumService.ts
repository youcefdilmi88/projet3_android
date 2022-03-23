import { Album } from '../class/Album';
import { PrivateAlbum } from '../class/PrivateAlbum';
import { SOCKETEVENT } from '../Constants/socketEvent';
import { VISIBILITY } from '../Constants/visibility';
import AlbumSchema from '../Entities/AlbumSchema';
import { AlbumInterface } from '../Interface/AlbumInterface';
import { PrivateAlbumInterface } from '../Interface/PrivateAlbumInterface';
import databaseService from './databaseService';
import socketService from './socketService';


class AlbumService {

   public albums:Map<String,Album>;

   constructor() {
     this.albums=new Map<String,Album>();  // albumName and Album
     this.loadAllAlbum();
    }

   async loadAllAlbum() {
    this.albums.clear(); 
    await databaseService.getAllAlbums().then((albums)=>{
         albums.forEach((album)=>{
             if(album.visibility==VISIBILITY.PUBLIC) {
               let albumObj=new Album(album);
               this.albums.set(albumObj.getName(),albumObj);
             }
             if(album.visibility==VISIBILITY.PRIVATE) {
               let albumObj=new PrivateAlbum(album as PrivateAlbumInterface);
               this.albums.set(albumObj.getName(),albumObj);
             } 
         });
    }).catch((e:Error)=>{
        console.log(e);
    });
   }

   async createAlbum(albumToCreate:any) {
      let album=new AlbumSchema.albumSchema({
        albumName:albumToCreate.albumName,
        creator:albumToCreate.creator,
        drawings:albumToCreate.drawings,
        visibility:albumToCreate.visibility
      });

      let albumObj=new Album(album as AlbumInterface);

      if(albumToCreate.visibility==VISIBILITY.PRIVATE && albumToCreate.password!=undefined) {
        album=new AlbumSchema.privateAlbumSchema({
          albumName:albumToCreate.albumName,
          creator:albumToCreate.creator,
          drawings:albumToCreate.drawings,
          visibility:albumToCreate.visibility,
          password:albumToCreate.password
        });

        albumObj=new PrivateAlbum(album as PrivateAlbumInterface);
      }
      try {
       await album.save().then(()=>{
         this.albums.set(albumObj.getName(),albumObj);
         const message={
           albumName:albumObj.getName()
         }
         socketService.getIo().emit(SOCKETEVENT.ALBUMCREATED,JSON.stringify(message));
         console.log('created');
         console.log(this.albums);
       }).catch((e:Error)=>{
         console.log(e);
       });
      }
      catch(e) {
        console.log(e);
      }
      
   }

   async deleteAlbum(name:String) {
     try {
      await AlbumSchema.albumSchema.deleteOne({albumName:name}).then((data)=>{
        console.log(data);
        this.albums.delete(name);
        const message={message:"album deleted"};
        socketService.getIo().emit(SOCKETEVENT.ALBUMDELETED,JSON.stringify(message));
      });
     }
     catch(e) {
       console.log(e);
     }
   }

}

const albumService=new AlbumService();
export default albumService;

