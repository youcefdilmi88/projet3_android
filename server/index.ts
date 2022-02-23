import express from 'express';
import http from 'http';
import sampleRouter from './ping'
import userData from './userData';
import userController from './Controllers/userController';
import chatMessageController from './Controllers/chatMessageController';
import socketService from './Services/socket.service';

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


socketService.init(server);

/*io.on("connection",(socket)=>{

    let user: any = socket.handshake.query.user;
    connectedUsers.set(socket.id,user);
    
    socket.on("react",(data)=>{
        io.emit("room2",data);
    })

    socket.on("CREATE_ROOM",({roomName})=>{
        console.log(`${roomName}`);
        rooms.set(socket.id, roomName);
        socket.join(roomName);
        io.to(roomName).emit("ROOM_CREATED", `welcome to room ` + `${roomName}`);
    });
})
*/

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

