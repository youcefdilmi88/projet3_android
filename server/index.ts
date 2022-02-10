import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sampleRouter from './ping'
import userData from './userData';
import userController from './Controllers/userController';
import messageService from './Services/messageService';
import chatMessageController from './Controllers/chatMessageController';
import userService from './Services/userService';

const app = express();

app.set('PORT', process.env.PORT ||8080);

app.use(express.json());

app.use((req, res, next) => {   // must be here to make http request work without access problems
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
  
app.use('',sampleRouter)
app.use('',userData)

/*********User ***********/
app.use('/user',userController);
app.use('/message',chatMessageController);


const server = http.createServer(app); // server for http
const io = new Server(server); // subclass server for socket

let rooms = new Map<string, {name: string}>();

io.on("connection",(socket)=>{
    /*
    let user: any = socket.handshake.query.user;
    connectedUsers.set(socket.id,user);
    */

    socket.on("connection",(data)=>{
        data=JSON.parse(data);
        let mail=data.useremail;
        if(userService.getConnectedUsers().has(mail)) {
          console.log("USER FAILED")
          io.to(socket.id).emit("connected",`USER FAILED`);
        }
        else {
          userService.getConnectedUsers().set(mail,socket.id);
          io.to(socket.id).emit("connected", `welcome user ` + mail);
        } 
    })

    /*
    function parseObject(arg: any): Object {
        if ((!!arg) && arg.constructor === Object) {
            return arg
        } else {
            try {
                return JSON.parse(arg);
            } catch(E){
                return {};
            }
        }
    }
    */
     
    socket.on("msg",async (data)=> {    // listen for event named random with data
        data = JSON.parse(data);
        console.log(data);
        await messageService.createMessage(data.time,data.useremail,data.message);  
        io.emit("room1",data);  // send msg to all listener listening to room1 the right side json
    })
    
    socket.on("react",(data)=>{
        io.emit("room2",data);
    })

    socket.on("disconnect",()=>{
        userService.getConnectedUsers().delete(socket.id);
    })

    /*************test chat *******************/
    socket.on("CREATE_ROOM",({roomName})=>{
        console.log(`${roomName}`);
        rooms.set(socket.id, roomName);
        socket.join(roomName);
        io.to(roomName).emit("ROOM_CREATED", `welcome to room ` + `${roomName}`);
    });
})

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

export default io;