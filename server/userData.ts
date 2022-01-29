import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

const userData=(req: Request, res: Response, next: NextFunction)=>{
  
    console.log('userData received')
    return res.json({
        name:"user 1",
        size:5
    })
}

const print=(req:Request,res:Response,next:NextFunction)=>{
    console.log("request received")
    return res.json(
    {data:"MSG GET RECEIVED"}
    )
}

router.get('/userData',userData)
router.get('/userData/msg',print)

export=router;