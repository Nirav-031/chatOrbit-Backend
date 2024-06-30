// import { Server } from "socket.io";
const Server = require("socket.io");
const express = require('express');
const http = require('http');

const app = express();

const server = http.createServer(app);





const io = Server(server, {
    cors: {
        origin: ["https://chatorbit31.netlify.app"],
        methods: ["POST", "GET"]
    }
});

const connecteUserMap = {};


io.on('connection', (socket) => {
    console.log("user Connected", socket.id);
    
    const connUserID = socket.handshake.query.userID;
    if (connUserID !== undefined)
    {
        connecteUserMap[connUserID] = socket.id;    
    }

    console.log(connUserID);
    socket.on('disconnect', () => {
        console.log("user Disconnect :: " + socket.id);
        delete connecteUserMap[connUserID];
    })
})

const getConnectedUserID = (receiverID) => {
    return connecteUserMap[receiverID];
}
module.exports= { app, server, io,getConnectedUserID };