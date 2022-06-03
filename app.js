//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const https = require('https');
const http = require('http');
const Socket = require('socket.io');
const port = process.env.PORT || 3001;
const Sessions = require('./Sessions.js');
const { userJoin, getCurrentUser } = require('./Users');
const fs = require('fs');

const { register_new_user, validate_creds } = require('./auth/auth.js');

var app = express();

app.use(bodyParser.json());
app.use(cors());

//just a response if people access server directly
/*
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/message.json');
});
*/

//Some cors and socket io things to make requests accepted from outsources
app.post('/chat', function (request, response) {
  response.set('Access-Control-Allow-Origin', '*');
});

//Auth
app.post('/auth/signup', async (req, res) => {
  const [username, password] = ['username', 'password'].map((e) => req.body[e]);
  res.send(await register_new_user(username, password));
});

app.post('/auth/signin', async (req, res) => {
  const [username, password] = ['username', 'password'].map((e) => req.body[e]);
  res.send(await validate_creds(username, password));
});

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

// Listening for incoming connections
io.on('connection', (socket) => {
  console.log('client connected:', socket.id);
  socket.on('create-session', (data) => {
    try {
      sessions.createSession(data, socket);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  //'join-session' emitted from client when user clicks 'join jam session' in /Join.js modal popup, or when user enters session ID in orange box and presses enter.
  socket.on('join-session', (data) => {
    try {
      sessions.joinSession(data, socket);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  //Jam control signals. index given determines behavior
  socket.on('initjam', (data) => {//data is index of player that clicked ready
    try{      
      console.log("got init jam signal", data.index); 
      sessions.initjam(data, socket);
    }catch(error){
      console.log(error); 
      socket.emit('error', error);
    }
  });

  socket.on('client-stream-out', (data) => {
    try {
      sessions.streamStarting(data, socket);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  socket.on('chat-message', (data) => {
    try {
      console.log('chat-message :', data);
      sessions.emitChatMessage(data, socket);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('chat-message-history', (data) => {
    try {
      console.log('chat-message-history :', data);
      sessions.emitChatHisttory(data, socket);
    } catch (error) {
      console.log(error);
    }
  });

  //update participants on server and broadcast to client when new user joins or host changes order
  socket.on('participants-order', (data) => {
    try {
      sessions.participantsOrder(data, socket);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  socket.on('server-update-userlist', (data) => {
    try {
      console.log('app updating userlist', data);
      sessions.updateUserList(data.updatedList, data.sessionID, socket);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  socket.on('get-userlist', (data) => {
    try {
      let userList = sessions.getUserList();
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  });

  socket.on('disconnect', () => {
    try {
      console.log('socket ID disconnected from server:', socket.id);
      sessions.disconnectUser(socket);
    } catch (error) {
      console.log(error);
    }
  });

});

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;
