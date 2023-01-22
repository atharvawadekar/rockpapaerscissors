require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const randomToken = require('random-token');

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on('create_room', () => {
        let roomId = randomToken(16);
        if(!io.sockets.adapter.rooms.get(roomId)){
            socket.join(roomId);
            io.to(socket.id).emit('get_room_id', roomId);
        }
    });

    socket.on('join_room', (roomId) => {
        if(io.sockets.adapter.rooms.get(roomId)){
            if(io.sockets.adapter.rooms.get(roomId).size < 2){
                socket.join(roomId);
                io.to(socket.id).emit('join_room_status', "Success");
                
                //
                socket.to(roomId).emit('opponent_joined');
            }
            else{
                io.to(socket.id).emit('join_room_status', "Room is full");
            }
        }
        else{
            io.to(socket.id).emit('join_room_status', "Room does not exist");
        }
    });

    socket.on('send_choice', ({choice, roomId}) => {
        socket.to(roomId).emit('receive_choice', choice);
    });

    //CHAT//

    socket.on('send_message',({currentMessage, roomId}) => {
        socket.to(roomId).emit('receive_message', currentMessage);
    });

    //CHAT ENDS//

    socket.on("disconnecting", () => {
        socket.rooms.forEach((value) => {
            if(value.length === 16){
                socket.to(value).emit('opponent_left');
            }
        })
    });

    socket.on('disconnect', () => {
        console.log("Disconnected");
    });
});




server.listen(process.env.PORT || 5000, () => {
    console.log(`Listening on port ${process.env.PORT || 5000}`);
});





