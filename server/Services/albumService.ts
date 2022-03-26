import { Album } from '../class/Album';
import { Drawing } from '../class/Drawing';
import { PrivateAlbum } from '../class/PrivateAlbum';
import { SOCKETEVENT } from '../Constants/socketEvent';
import { VISIBILITY } from '../Constants/visibility';
import AlbumSchema from '../Entities/AlbumSchema';
import { AlbumInterface } from '../Interface/AlbumInterface';
import { PrivateAlbumInterface } from '../Interface/PrivateAlbumInterface';
import databaseService from './databaseService';
import drawingService from './drawingService';
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
        visibility:albumToCreate.visibility,
        dateCreation:albumToCreate.dateCreation,
        nbContributeursActif:albumToCreate.nbContributeursActif,
        description:albumToCreate.description
      });

      let albumObj=new Album(album as AlbumInterface);

      if(albumToCreate.visibility==VISIBILITY.PRIVATE && albumToCreate.password!=undefined) {
        album=new AlbumSchema.privateAlbumSchema({
          albumName:albumToCreate.albumName,
          creator:albumToCreate.creator,
          drawings:albumToCreate.drawings,
          visibility:albumToCreate.visibility,
          dateCreation:albumToCreate.dateCreation,
          nbContributeursActif:albumToCreate.nbContributeursActif,
          password:albumToCreate.password,
          description:albumToCreate.description
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

  async updateAlbum(albumChanged:any) {
    let album=new AlbumSchema.albumSchema({
      albumName:albumChanged.albumName,
      creator:albumChanged.creator,
      drawings:albumChanged.drawings,
      visibility:albumChanged.visibility,
      dateCreation:albumChanged.dateCreation,
      nbContributeursActif:albumChanged.nbContributeursActif,
      description:albumChanged.description
    });

    let albumObj=new Album(album as AlbumInterface);

    if(albumChanged.visibility==VISIBILITY.PRIVATE && albumChanged.password!=undefined) {
      album=new AlbumSchema.privateAlbumSchema({
        albumName:albumChanged.albumName,
        creator:albumChanged.creator,
        drawings:albumChanged.drawings,
        visibility:albumChanged.visibility,
        dateCreation:albumChanged.dateCreation,
        nbContributeursActif:albumChanged.nbContributeursActif,
        description:albumChanged.description,
        password:albumChanged.password
      });
      albumObj=new PrivateAlbum(album as PrivateAlbumInterface);
      let privObj=albumObj as PrivateAlbum;
 
      try {
        const filter={albumName:privObj.getName()};
            const albumUpdate = {
              $set:{
                "albumName":privObj.getName(),
                "creator":privObj.getCreator(),
                "drawings":privObj.getDrawings(),
                "dateCreation":privObj.getDateCreation(),
                "nbContributeursActif":privObj.getNbContributeursActif(),
                "description":privObj.getDescription(),
                "password":privObj.getPassword()
              }
            };
            let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
            await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
              console.log(e);
            });
            await albumDoc?.save().catch((e:Error)=>{
              console.log(e);
            });
      }
      catch(e:any) {
        console.log(e);
      }
    }
    try {
      const filter={albumName:albumObj.getName()};
          const albumUpdate = {
            $set:{
              "albumName":albumObj.getName(),
              "creator":albumObj.getCreator(),
              "drawings":albumObj.getDrawings(),
              "dateCreation":albumObj.getDateCreation(),
              "nbContributeursActif":albumObj.getNbContributeursActif(),
              "description":albumObj.getDescription(),
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
  }

   getnbActifMembers(name:String) {
     let count:number=0;
     if(this.albums.has(name)) {
       this.albums.get(name)?.getDrawings().forEach((drawingName)=>{
         let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;
         drawing.getMembers().forEach(()=>{
           count++;
         });
       });
       return count as Number;
     }
     return count;
   }

}

const albumService=new AlbumService();
export default albumService;

