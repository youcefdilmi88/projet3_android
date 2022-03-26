import express, { NextFunction, Request, Response }  from "express";
import { Album } from "../class/Album";
import { Drawing } from "../class/Drawing";
import { PrivateAlbum } from "../class/PrivateAlbum";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { SOCKETEVENT } from "../Constants/socketEvent";
import { VISIBILITY } from "../Constants/visibility";
import albumService from "../Services/albumService";
import socketService from "../Services/socketService";

let bcrypt=require("bcryptjs");

const router = express.Router();

const createAlbum=async (req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.body.albumName as String;
    let creator:String=req.body.creator as String;
    let drawings:Drawing[]=[];
    let visibility:String=req.body.visibility as String;
    let dateCreation:Number=Date.now();
    let nbContributeursActif:Number=0;
    let description:String=req.body.description;

    if(!description) {
        description="";
    }

    let album={
        albumName:albumName,
        creator:creator,
        drawings:drawings,
        visibility:visibility,
        dateCreation:dateCreation,
        nbContributeursActif:nbContributeursActif,
        description:description
    };

    if(visibility==VISIBILITY.PRIVATE && req.body.password!=undefined) {
        const salt=await bcrypt.genSalt();
        const hashedPassword=await bcrypt.hash(req.body.password,salt);
        album["password"]=hashedPassword;
    }

    if(albumService.albums.has(album.albumName)) {
        return res.status(404).json({message:HTTPMESSAGE.ALBUMEXIST});
    }

    if(album.albumName && album.creator && album.visibility) {
      albumService.createAlbum(album);
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const getAlbums=(req:Request,res:Response,next:NextFunction)=>{
    let albums:Album[]=[];
    albumService.albums.forEach((v,k)=>{
       albums.push(v);
    })
    return res.status(200).json(albums);
}

const deleteAlbum=(req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.body.albumName as String;
    
    if(albumService.albums.has(albumName)) {
      albumService.deleteAlbum(albumName);
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});
}

const joinAlbum=async(req:Request,res:Response,next:NextFunction)=>{
   
   let albumName:String=req.body.albumName as String;
   
   if(albumService.albums.has(albumName)) {
     if(albumService.albums.get(albumName)?.getVisibility()==VISIBILITY.PRIVATE) {
         let password:string=req.body.password;
         let album:PrivateAlbum=albumService.albums.get(albumName) as PrivateAlbum;
         if(await bcrypt.compare(password,album.getPassword() as string)) {
           return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
         }
         return res.status(404).json({message:HTTPMESSAGE.PASSNOTMATCH});
     }
     return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
   }
   return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const updateAlbum=async (req:Request,res:Response,next:NextFunction)=>{
    let album={
        albumName:req.body.album.albumName,
        drawings:req.body.album.drawings,
        visibility:req.body.album.visibility,
        description:req.body.album.description
    };
    if(albumService.albums.has(album.albumName)) {
      if(album.visibility==VISIBILITY.PRIVATE && req.body.password!=undefined) {
         const salt=await bcrypt.genSalt();
         const hashedPassword=await bcrypt.hash(req.body.password,salt);
         album["password"]=hashedPassword;
      }
      albumService.updateAlbum(album).then(()=>{
         socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(album));
      });
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

/*
const addDrawing=(req:Request,res:Response,next:NextFunction)=>{

}
*/


router.post('/createAlbum',createAlbum);
router.get('/getAlbums',getAlbums);
router.post('/deleteAlbum',deleteAlbum);
router.post('/joinAlbum',joinAlbum);
router.post('/updateAlbum',updateAlbum);

export=router;