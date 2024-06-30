const express = require('express');
const connection = require('./connection/connect');
// const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { app, server } = require("./socket/socket.js")
const path = require("path");
require('dotenv').config()
app.use(cors({
    origin: 'https://main--chatorbit31.netlify.app', // Update this with your frontend URL
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

// parse application/json
const route = require('./routes/route');
const chatRoute = require('./routes/chat');
const errorMiddleware = require('./middleware/errormiddleware');



app.use(bodyParser.json())
app.use('/', route);
app.use('/chat', chatRoute);



app.use(errorMiddleware);
connection().
    then(() => {
        console.log("connected")
        server.listen(3000,()=>console.log('listening'))
    })
    .catch((e) => console.log(e));