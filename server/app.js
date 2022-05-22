//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const Socket = require('socket.io');
const ss = require('socket.io-stream')
const port = process.env.PORT || 3001;
var chunks = [];
const Sessions = require('./Sessions.js');
const { userJoin, getCurrentUser } = require('./Users')

const {register_new_user, validate_creds} = require("./auth/auth.js")

var app = express();

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

//Auth
app.post('/auth/signup', async (req, res) => {
  const [username, password] = ["username", "password"].map(e=> req.body[e])
  res.send(await register_new_user(username, password));
})

app.post('/auth/signin', async (req, res) => {
  const [username, password] = ["username", "password"].map(e=> req.body[e])
  res.send(await validate_creds(username, password))
})


///// end auth

//Server
const server = http.createServer(app);
const io = Socket(server, {
  cors: {
    methods: ['GET', 'POST'],
  },
});

//Active sessions
var sessions = new Sessions();

//Room sockets and locations
//Chat history on server
const socketMap = {};
const socketHistory = {};

// Listening for incoming connections
io.on('connection', (socket) => {
  //recieve the data from the user 
  clientObject = undefined;
  socket.on("create-session", (data) => {sessions.createSession(data, socket)});

  //'join-session' emitted from client when user clicks 'join jam session' in /Join.js modal popup, or when user enters session ID in orange box and presses enter. 
  //apparently, does not require adding the client's socket.id to a list for each session.   
  socket.on('join-session', (data) => {sessions.joinSession(data, socket)});

  socket.on('participants-order', (data) => {sessions.participantsOrder(data, socket)});


  //broadcast incoming stream to all clients in session
  socket.on('client-audio-stream', (data)=> {sessions.streamToSession(data, socket)});
  
  socket.on('room-exists', (data) => {
    if(io.sockets.adapter.rooms.has(data.sessionID)){
      console.log(`room ${data.sessionID} exists`)
      socket.emit('join-session-success')
    }
    else{
      console.log(`session id ${data.sessionID} doesn't exist`)
      socket.emit('join-session-failed')
    }
  })

  //socket.emit('me', socket.id);
  
  // socket.on('chat')

  let socketRoom; //Current room of the socket for chat prototype

  //Joining a room and sending them chat history
  socket.on('joinRoom', (data)  => {
   // const user = userJoin(socket.id, username, room);
    socket.join(data.sessionID);
    //sock
    socketRoom = data.sessionID;
    socketMap[socket.id] = data.guest;
    //Send chat history to client
    socket.broadcast.to(data.sessionID).emit('message', console.log(`${data.guest} has joined the room ${data.sessionID}`))
    socket.emit('joinResponse', socketHistory[socketRoom]);
  });

  socket.on("send_message", (data) =>{ 
    socket.to(data.sessionID).emit("receive_message", data);

  })



  //Switch rooms
  // socket.on('switchRoom', (data) => {
  //   const { prevRoom, nextRoom } = data;
  //   const userId = socketMap[socket.id];

  //   if (prevRoom) {
  //     socket.leave(prevRoom);
  //   }
  //   if (nextRoom) {
  //     socket.join(nextRoom);
  //     //socketMap[socket.id] = userId;

  //     //send Chat history on room swap
  //     socket.emit('joinResponse', socketHistory[nextRoom]);
  //   }

  //   socketRoom = nextRoom;
  // });

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
  /*
  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
  */
  // socket.on('SEND_MESSAGE', function (data) {
  //   io.emit('RECEIVE_MESSAGE', data);
  // });

  
  socket.on("audio-stream", (data) => {
      //console.log("Audio streaming.");
      chunks.push(data);
  });

  socket.on("audio-stream-start", () => {
    console.log("Audio streaming started.");
  });
  
  socket.on("audio-stream-end", () => {
      console.log("Audio streaming ended.");
      // emits to all connected clients
      // TODO change this when we establish multiple rooms
      io.emit("audio-blob", chunks);
      chunks = [];
  });


  // socket.on('create-audio-file', function(data)  {
  //   let blob = new Blob(this.chunks, {'type': 'audio/ogg; codecs=opus'})
  //   let audioURL = URL.createObjectURL(blob);
  //   this.audio = new Audio(audioURL);
  // });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;