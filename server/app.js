//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const socket = require('socket.io');
//const ss = require('socket.io-stream');
const port = process.env.PORT || 3001;

const TYPE = Symbol('type');
const CLOSED = Symbol('closed');

class Blob {
  constructor() {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true
    });

    this[CLOSED] = false;
    this[TYPE] = '';

    const blobParts = arguments[0];
    const options = arguments[1];

    const buffers = [];

    if (blobParts) {
      const a = blobParts;
      const length = Number(a.length);
      for (let i = 0; i < length; i++) {
        const element = a[i];
        let buffer;
        if (element instanceof Buffer) {
          buffer = element;
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(element);
        } else if (element instanceof Blob) {
          buffer = element.buffer;
        } else {
          buffer = Buffer.from(typeof element === 'string' ? element : String(element));
        }
        buffers.push(buffer);
      }
    }

    this.buffer = Buffer.concat(buffers);

    let type = options && options.type !== undefined && String(options.type).toLowerCase();
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type;
    }
  }
  get size() {
    return this[CLOSED] ? 0 : this.buffer.length;
  }
  get type() {
    return this[TYPE];
  }
  get isClosed() {
    return this[CLOSED];
  }
  slice() {
    const size = this.size;

    const start = arguments[0];
    const end = arguments[1];
    let relativeStart, relativeEnd;
    if (start === undefined) {
      relativeStart = 0;
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0);
    } else {
      relativeStart = Math.min(start, size);
    }
    if (end === undefined) {
      relativeEnd = size;
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0);
    } else {
      relativeEnd = Math.min(end, size);
    }
    const span = Math.max(relativeEnd - relativeStart, 0);

    const buffer = this.buffer;
    const slicedBuffer = buffer.slice(
      relativeStart,
      relativeStart + span
    );
    const blob = new Blob([], { type: arguments[2] });
    blob.buffer = slicedBuffer;
    blob[CLOSED] = this[CLOSED];
    return blob;
  }
  close() {
    this[CLOSED] = true;
  }
};

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'BlobPrototype',
  writable: false,
  enumerable: false,
  configurable: true
});


var chunks = [];

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

      let blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' })
      let audioURL = URL.createObjectURL(blob);

      socket.broadcast.emit("audio-url", audioURL);

  });


});

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;
