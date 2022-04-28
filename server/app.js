//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const socket = require('socket.io');
const ss = require('socket.io-stream')
const port = process.env.PORT || 3001;

var chunks = [];

// Global variables
let worker;
let webServer;
let socketServer;
let app;
let producer;
let consumer;
let producerTransport;
let consumerTransport;
let mediasoupRouter;

(async () => {
  try {
    await runExpressApp();
    //await runWebServer();
    //await runSocketServer();
    //await runMediasoupWorker();
  } catch (err) {
    console.error(err);
  }
})();

async function runExpressApp() {
  app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use(express.static(path.resolve(__dirname, './client/build')));

  //just a response if people access server directly
  app.get('/', function (request, response) {
    response.sendFile(__dirname + '/message.json');
  });

  //Some cors and socket io things to make requests accepted from outsources
  app.post('/chat', function (request, response) {
    //console.log(request.body);
    response.set('Access-Control-Allow-Origin', '*');
  });

  app.use((error, req, res, next) => {
    if (error) {
      console.warn('Express app error,', error.message);

      error.status = error.status || (error.name === 'TypeError' ? 400 : 500);

      res.statusMessage = error.message;
      res.status(error.status).send(String(error));
    } else {
      next();
    }
  });
}

async function runWebServer() {
  webServer = https.createServer(expressApp);
  webServer.on('error', (err) => {
    console.error('starting web server failed:', err.message);
  });

  await new Promise((resolve) => {
    const { listenIp, listenPort } = config;
    webServer.listen(listenPort, listenIp, () => {
      const listenIps = config.mediasoup.webRtcTransport.listenIps[0];
      const ip = listenIps.announcedIp || listenIps.ip;
      console.log('server is running');
      console.log(`open https://${ip}:${listenPort} in your web browser`);
      resolve();
    });
  });
}

// app.post('/sample_request', async (req, res) => {
//   console.log(req.body);
//   res.send({
//     important_information: '3better pizza3',
//     more_important_info: '3better ingredients3',
//     test: req.body.test + '356783',
//   });
// });

//Server
const server = http.createServer(app);
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
  let socketRoom; //Current room of the socket

  //console.log('connected Id:', socket.id);

  //socket.emit('me', socket.id);

  //Handle disconnect requests
  socket.on('disconnectRoom', () => {
    //console.log(`Disconnected: ${socket.id}`);
  });

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


});

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
