import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

const userData=(req: Request, res: Response, next: NextFunction)=>{
    console.log('userData received')
    return res.json({
        name:"user 1",
        size:5
    })
}

router.get('/userData',userData)

export=router;