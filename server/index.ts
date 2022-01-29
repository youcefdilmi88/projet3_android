import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sampleRouter from './ping'
import userData from './userData';
import  mongoose  from 'mongoose';

const app = express();

app.set('PORT', process.env.PORT ||8080);

const MONGO_USERNAME = "projet3";
const MONGO_PASSWORD = "projet123";
const MONGO_HOST =`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.g3voj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(MONGO_HOST).then(()=>{
    console.log("connected");
}).catch((error)=>{
    console.log(error)
})

app.use((req, res, next) => {   // must be here to make http request work without access problems
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
  
app.use('', sampleRouter)
app.use('',userData)

const server = http.createServer(app); // server for http
const io = new Server(server); // subclass server for socket

io.on("connection",(socket)=>{
    console.log(socket.id+" is connected");

    socket.on("msg",(data)=>{    // listen for event named random with data
        console.log(data);        
        console.log("first socket received");
        io.emit("room1",data);  // send msg to all listener listening to room1 the right side json
    })
    
    socket.on("react",(data)=>{
        console.log("second socket received");
        io.emit("room2",data);
    })

    /*************test chat *******************/
    socket.on("join_room",({username,room})=>{
       //const user={socket.id}
    });
})

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

export default io;