import express, { NextFunction, Request, Response }  from "express";
import { Album } from "../class/Album";
import { Drawing } from "../class/Drawing";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { VISIBILITY } from "../Constants/visibility";
import albumService from "../Services/albumService";

let bcrypt=require("bcryptjs");

const router = express.Router();

const createAlbum=async (req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.body.albumName as String;
    let creator:String=req.body.creator as String;
    let drawings:Drawing[]=[];
    let visibility:String=req.body.visibility as String;

    let album={
        albumName:albumName,
        creator:creator,
        drawings:drawings,
        visibility:visibility
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


router.post('/createAlbum',createAlbum);
router.get('/getAlbums',getAlbums);

export=router;