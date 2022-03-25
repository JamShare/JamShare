//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const socket = require('socket.io');

const port = process.env.PORT || 3001;

var app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/message.json');
});

app.post('/chat', function (request, response) {
  console.log(request.body);
  response.set('Access-Control-Allow-Origin', '*');
});

app.post('/sample_request', async (req, res) => {
  console.log(req.body);
  res.send({
    important_information: '3better pizza3',
    more_important_info: '3better ingredients3',
    test: req.body.test + '356783',
  });
});

//Server
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    methods: ['GET', 'POST'],
  },
});

// Listening for incoming connections
const socketMap = {};
const socketHistory = {};
io.on('connection', (socket) => {
  let socketRoom;
  console.log('connected Id:', socket.id);

  //socket.emit('me', socket.id);

  socket.on('disconnectRoom', () => {
    console.log(`Disconnected: ${socket.id}`);
  });

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socketRoom = room;
    socketMap[socket.id] = username;

    socket.emit('joinResponse', socketHistory[socketRoom]);
  });

  socket.on('switchRoom', (data) => {
    const { prevRoom, nextRoom } = data;
    const userId = socketMap[socket.id];

    if (prevRoom) {
      socket.leave(prevRoom);
    }
    if (nextRoom) {
      socket.join(nextRoom);
      //socketMap[socket.id] = userId;

      socket.emit('joinResponse', socketHistory[nextRoom]);
    }

    socketRoom = nextRoom;
  });

  socket.on('chatRoom', (data) => {
    const { message, room, name } = data;

    socket.broadcast.to(socketRoom).emit('chatRoom', message, name);
    let newMsg = `${name}: ${message}`;
    socketHistory[socketRoom] = socketHistory[socketRoom]
      ? [newMsg, ...socketHistory[socketRoom]]
      : [newMsg];
  });

  socket.on('setSocketName', (username) => {
    socketMap[socket.id] = username;
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected just msg: ${socket.id}`);
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
  socket.on('SEND_MESSAGE', function (data) {
    io.emit('RECEIVE_MESSAGE', data);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;
