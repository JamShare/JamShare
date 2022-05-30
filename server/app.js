//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const https = require('https');
const Socket = require('socket.io');
const port = process.env.PORT || 3001;
const Sessions = require('./Sessions.js');
const { userJoin, getCurrentUser } = require('./Users');
const fs = require("fs");

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
  const [username, password] = ['username', 'password'].map((e) => req.body[e]);
  res.send(await register_new_user(username, password));
});

app.post('/auth/signin', async (req, res) => {
  const [username, password] = ['username', 'password'].map((e) => req.body[e]);
  res.send(await validate_creds(username, password));
});

///// end auth

//Server
const tls = {
  cert: fs.readFileSync("../fullchain.pem"),
  key: fs.readFileSync("../privkey.pem"),
};

//Server
const server = https.createServer(tls, app);
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

  // socket.on('audio-stream-start', () => {
  //   console.log('Audio streaming started.');
  // });

  // socket.on('audio-stream-end', () => {
  //   console.log('Audio streaming ended.');
  //   // emits to all connected clients
  //   // TODO change this when we establish multiple rooms
  //   io.emit('audio-blob', chunks);
  //   chunks = [];
  // });

  // socket.on('create-audio-file', function(data)  {
  //   let blob = new Blob(this.chunks, {'type': 'audio/ogg; codecs=opus'})
  //   let audioURL = URL.createObjectURL(blob);
  //   this.audio = new Audio(audioURL);
  // });
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
