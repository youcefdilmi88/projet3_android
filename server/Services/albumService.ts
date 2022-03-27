import { Album } from '../class/Album';
import { SOCKETEVENT } from '../Constants/socketEvent';
import AlbumSchema from '../Entities/AlbumSchema';
import { AlbumInterface } from '../Interface/AlbumInterface';
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
            let albumObj=new Album(album);
            this.albums.set(albumObj.getName(),albumObj);
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
        description:albumToCreate.description,
        members:albumToCreate.members
      });

      let albumObj=new Album(album as AlbumInterface);

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

   async addRequest(newMember:String,albumName:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.addRequest(newMember);
     await this.updateRequests(album);
   }

   async updateRequests(album:Album) {
    try {
      const filter={albumName:album.getName()};
          const albumUpdate = {
            $set:{
              "requests":album.getRequests(),
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          }).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            this.albums[`${album.getName()}`]=album;
            const message={album:album};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
   }

   addMemberToAlbum(albumName:String,newMember:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.addMember(newMember);
     this.updateMember(album);
     const message={albumName:albumName,member:newMember};
     socketService.getIo().emit(SOCKETEVENT.NEWUINALBUM,JSON.stringify(message));
   }

   removeMemberFromAlbum(albumName:String,member:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.removeMember(member);
     this.updateMember(album)
     const message={albumName:albumName,member:member};
     socketService.getIo().emit(SOCKETEVENT.ULEFTALBUM,JSON.stringify(message));
   }

   async updateMember(album:Album) {
    try {
      const filter={albumName:album.getName()};
          const albumUpdate = {
            $set:{
              "members":album.getMembers(),
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          }).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            this.albums[`${album.getName()}`]=album;
            const message={album:album};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
   }

   async deleteAlbum(name:String) {
     try {
      await AlbumSchema.albumSchema.deleteOne({albumName:name}).then((data)=>{
        console.log(data);
        let album:Album=this.albums.get(name) as Album;
        this.albums.delete(name);
        drawingService.drawings.forEach((v,k)=>{
          if(album.getDrawings().includes(k)) {
            drawingService.deleteDrawing(k);  // delete all drawings in album
          }
        });
        const message={message:album.getName()};
        socketService.getIo().emit(SOCKETEVENT.ALBUMDELETED,JSON.stringify(message));
      });
     }
     catch(e) {
       console.log(e);
     }
   }

  async updateAlbum(newName:String,albumName:String,description:String) {
    let album:Album=this.albums.get(albumName) as Album;
    await this.deleteAlbum(albumName).then(()=>{
      album.setName(newName);
      album.setDescription(description);
    }).catch((e:Error)=>{
      console.log(e);
    });

    await this.createAlbum(album).then(()=>{
      this.albums.delete(albumName);
      this.albums.set(album.getName(),album);
    }).catch((e:Error)=>{
      console.log(e);
    })

  }

  async changeAlbumDescription(albumName:String,description:String) {
    try {
      const filter={albumName:albumName};
          const albumUpdate = {
            $set:{
              "description":description,
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            let album:Album=albumService.albums.get(albumName) as Album;
            album.setDescription(description);
            this.albums[`${albumName}`]=album;
            const message={album:album};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
  }

  async addDrawingToAlbum(drawingName:String,albumName:String) {
    let album:Album=this.albums.get(albumName) as Album;
    album.addDrawing(drawingName);
    await this.updateDrawingInAlbum(album);
  }

  async updateDrawingInAlbum(album:Album) {
    try {
      const filter={albumName:album.getName()};
          const albumUpdate = {
            $set:{
              "drawings":album.getDrawings(),
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            this.albums[`${album.getName()}`]=album;
            const message={album:album};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
  }

}

const albumService=new AlbumService();
export default albumService;

