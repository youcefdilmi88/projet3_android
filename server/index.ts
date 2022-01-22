import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sampleRouter from './ping'
import userData from './userData';

const app = express();

app.set('PORT', 3000);

app.use('', sampleRouter)
app.use('',userData)

const server = http.createServer(app); // server for http
const io = new Server(server); // subclass server for socket

io.on("connection",(socket)=>{
    console.log("connected");

    socket.on("msg",(data)=>{    // listen for event named random with data
        console.log(data);        
        console.log("first socket received");
        io.emit("room1",data);  // send msg to all listener listening to room1 the right side json
    })
    
    socket.on("react",(data)=>{
        console.log("second socket received");
        io.emit("room2",data);
    })
})

server.listen(app.get('PORT'), () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

export default io;