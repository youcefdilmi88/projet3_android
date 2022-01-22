import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';

const app = express();

app.set('PORT',3000);

const server = http.createServer(app);   // server for http
const io = new Server(server); // server for socket


server.listen(app.get('PORT'), () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

export default io;