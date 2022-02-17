var express = require('express');
const app = express();
// var routes = require('./routes');
// // var user = require('./routes/user');
var http = require('http');
var path = require ('path');

const PORT = process.env.PORT || 3000;
// var mongoose = require('mongoose');

//for server side audio manipulations
// const AudioContext = window.AudioContext || window.webkitAudioContext; //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
// const audioContext = new AudioContext(); //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

const io = require("socket.io");
//environments

// app.use('/cors', require('cors')());

// socket events
io.on("connection", (socket) => {
    console.log("Client Connected");
    
    // add server actions here
    socket.on("join-session", (sessionID) => joinSession(sessionID));

    // recieve data from a user
    try{
        
    } catch (error) {
        console.error(error);
    }

    // server action functions
    

});

//set listen port, and log it.
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
  
app.use(path);//path, callback
  
app.use((req, res, next) => {
    // For example, a GET request to `/test` will print "GET /test"
    console.log(`${req.method} ${req.url}`);
  
    next();
});

app.get('/test', (req, res, next) => {
    res.send('ok');
});