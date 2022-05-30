//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const Socket = require('socket.io');
const port = process.env.PORT || 3001;
const Sessions = require('./Sessions.js');
const { userJoin, getCurrentUser } = require('./Users');
const { register_new_user, validate_creds } = require('./auth/auth.js');

//node instance
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

//auth
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

//Active sessions manager
var sessions = new Sessions();

// Listening for incoming connections
io.on('connection', (socket) => {
  console.log("client connected:",socket.id);
  //recieve the data from the user
  clientObject = undefined;
  socket.on('create-session', (data) => {
    sessions.createSession(data, socket);
  });

  //'join-session' emitted from client when user clicks 'join jam session' in /Join.js modal popup, or when user enters session ID in orange box and presses enter.
  socket.on('join-session', (data) => {
    try{
    sessions.joinSession(data, socket);
    } catch(error){
      console.log(error);
    }
  });

  socket.on('client-stream-out', (data) => {
    sessions.streamStarting(data, socket);
  });
  
  socket.on('chat-message', (data) => {
    try{sessions.emitChatMessage(data, socket);
    } catch(error){console.log(error);}
  });

  //update participants on server and broadcast to client when new user joins or host changes order
  socket.on('participants-order', (data) => {
    sessions.participantsOrder(data, socket);
  });

  socket.on('server-update-userlist', (data) => {
    console.log("app updating userlist",data);
    sessions.updateUserList(data.updatedList, data.sessionID, socket);
  });

  socket.on('get-userlist', (data) => {
    let userList = sessions.getUserList();
  });

  socket.on('disconnect', ()=>{
    try{
      console.log("socket ID disconnected from server:", socket.id );
      sessions.disconnectUser(socket);
    } catch(error){
      console.log(error);
    }
  });

  //broadcast incoming stream to all clients in session
  // socket.on('client-audio-stream', (data) => {
  //   sessions.streamToSession(data, socket);
  // });


  // socket.on('callUser', (data) => {
  //   io.to(data.userToCall).emit('callUser', {
  //     signal: data.signalData,
  //     from: data.from,
  //     name: data.name,
  //   });
  // });

  // socket.on('answerCall', (data) => {
  //   io.to(data.to).emit('callAccepted', data.signal);
  // });

  // socket.on('audio-stream', (data) => {
  //   //console.log("Audio streaming.");
  //   chunks.push(data);
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

server.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.static(path.resolve(__dirname, './client/build')));
module.exports = app;