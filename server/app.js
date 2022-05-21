//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const https = require('https');
const socket = require('socket.io');
const ss = require('socket.io-stream')
const fs = require("fs");
const port = process.env.PORT || 3001;
var chunks = [];
let players = [];
require('./Sessions.js')();

var app = express();
//Active sessions

//const Sessions = require('./Sessions.js');

app.use(bodyParser.json());
app.use(cors());

//just a response if people access server directly
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/message.json');
});

//Some cors and socket io things to make requests accepted from outsources
app.post('/chat', function (request, response) {
  //console.log(request.body);
  response.set('Access-Control-Allow-Origin', '*');
});

const tls = {
  cert: fs.readFileSync("../fullchain.pem"),
  key: fs.readFileSync("../privkey.pem"),
};

//Server
const server = https.createServer(tls, app);
const io = socket(server, {
  cors: {
    methods: ['GET', 'POST'],
  },
});

//Room sockets and locations
//Chat history on server
const socketMap = {};
const socketHistory = {};

// Listening for incoming connections
io.on('connection', (socket) => {
  //recieve the data from the user 
  clientObject = undefined;
  socket.on("create-session", (data) => { createSession(socket.id, data) });

  //'join-session' emitted from client when user clicks 'join jam session' in /Join.js modal popup, or when user enters session ID in orange box and presses enter. 
  //apparently, does not require adding the client's socket.id to a list for each session.   
  socket.on('join-session', (data) => { Sessions.joinSession(data.SessionID, socket.id) });

  //broadcast incoming stream to all clients in session
  socket.on('client-audio-stream', (data) => { Sessions.streamToSession(data, socket.id) });

  let socketRoom; //Current room of the socket for chat prototype

  //Joining a room and sending them chat history
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);

    //sock
    socketRoom = room;
    socketMap[socket.id] = username;
    //Send chat history to client
    socket.emit('joinResponse', socketHistory[socketRoom]);
  });

  //Switch rooms
  socket.on('switchRoom', (data) => {
    const { prevRoom, nextRoom } = data;
    const userId = socketMap[socket.id];

    if (prevRoom) {
      socket.leave(prevRoom);
    }
    if (nextRoom) {
      socket.join(nextRoom);
      //socketMap[socket.id] = userId;

      //send Chat history on room swap
      socket.emit('joinResponse', socketHistory[nextRoom]);
    }

    socketRoom = nextRoom;
  });

  //Send a msg to the current chat
  socket.on('sendChatMessage', (data) => {
    const { message, room, name } = data;
    let newMsg = message;
    if (name) {
      newMsg = `${name}: ${message}`;
    }
    socket.broadcast.to(socketRoom).emit('sendChatMessage', newMsg, name);

    //this can be changed TODO

    //let newMsg = message;
    socketHistory[socketRoom] = socketHistory[socketRoom]
      ? [newMsg, ...socketHistory[socketRoom]]
      : [newMsg];
  });

  //Change username of the socket
  socket.on('setSocketName', (username) => {
    socketMap[socket.id] = username;
  });

  socket.on('disconnect', () => {
    //console.log(`Disconnected just msg: ${socket.id}`);
    //socket.broadcast.emit('callEnded');
  });

  socket.on('SEND_MESSAGE', function (data) {
    io.emit('RECEIVE_MESSAGE', data);
  });

  socket.on("player-connected", (id) => {

    socket.emit("player-connected-server", assignPlayer(id));
    console.log("Players", players);
  });

  socket.on('reset-player-count', () => {
    players = [];
    console.log("Resetting player order");
    console.log(players);
  });
});

function assignPlayer(id) {
  if (players.includes(id)) {
    return players.length;
  }
  else {
    players.push(id);
    return players.length;
  }
}

server.listen(port, "berryhousehold.ddns.net", () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;