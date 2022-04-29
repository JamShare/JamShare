//Express Reqs
var express = require('express');
const mediasoup = require('mediasoup');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const http = require('http');
const socket = require('socket.io');
const port = process.env.PORT || 3001;
const config = require('./serverConfig');

var chunks = [];

// Global variables
let worker;
let server;
let io;
let app;
let producer;
let consumer;
let producerTransport;
let consumerTransport;
let mediasoupRouter;

(async () => {
  try {
    await runExpressApp();
    await runWebServer();
    await runSocketServer();
    await runMediasoupWorker();
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
  server = http.createServer(app);
  server.on('error', (err) => {
    console.error('starting web server failed:', err.message);
  });

  await new Promise((resolve) => {
    const { listenIp, listenPort } = config;
    server.listen(listenPort, listenIp, () => {
      const listenIps = config.mediasoup.webRtcTransport.listenIps[0];
      const ip = listenIps.announcedIp || listenIps.ip;
      console.log('server is running');
      console.log(`open http://${ip}:${listenPort} in your web browser`);
      resolve();
    });
  });
}

async function runSocketServer() {
  //Room sockets and locations
  //Chat history on server
  const socketMap = {};
  const socketHistory = {};
  let socketRoom; //Current room of the socket

  io = socket(server, {
    cors: {
      methods: ['GET', 'POST']
    },
  });


  io.on('connection', (socket) => {
    //console.log('client connected');

    // inform the client about existence of producer
    if (producer) {
      socket.emit('newProducer');
    }

    socket.on('disconnect', () => {
      //console.log('client disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
    });

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      callback(mediasoupRouter.rtpCapabilities);
    });

    socket.on('createProducerTransport', async (data, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport();
        producerTransport = transport;
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('createConsumerTransport', async (data, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport();
        consumerTransport = transport;
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('connectProducerTransport', async (data, callback) => {
      await producerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });

    socket.on('connectConsumerTransport', async (data, callback) => {
      await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });

    socket.on('produce', async (data, callback) => {
      const { kind, rtpParameters } = data;
      producer = await producerTransport.produce({ kind, rtpParameters });
      callback({ id: producer.id });

      // inform clients about new producer
      socket.broadcast.emit('newProducer');
    });

    socket.on('consume', async (data, callback) => {
      callback(await createConsumer(producer, data.rtpCapabilities));
    });

    socket.on('resume', async (data, callback) => {
      await consumer.resume();
      callback();
    });





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
}

async function runMediasoupWorker() {
  worker = await mediasoup.createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });

  const mediaCodecs = config.mediasoup.router.mediaCodecs;
  mediasoupRouter = await worker.createRouter({ mediaCodecs });
}

async function createWebRtcTransport() {
  const {
    maxIncomingBitrate,
    initialAvailableOutgoingBitrate
  } = config.mediasoup.webRtcTransport;



  const transport = await mediasoupRouter.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate,
  });
  if (maxIncomingBitrate) {
    try {
      await transport.setMaxIncomingBitrate(maxIncomingBitrate);
    } catch (error) {
    }
  }
  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    },
  };
}

async function createConsumer(producer, rtpCapabilities) {
  if (!mediasoupRouter.canConsume(
    {
      producerId: producer.id,
      rtpCapabilities,
    })
  ) {
    console.error('can not consume');
    return;
  }
  try {
    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === 'video',
    });
  } catch (error) {
    console.error('consume failed', error);
    return;
  }

  if (consumer.type === 'simulcast') {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }

  return {
    producerId: producer.id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused
  };
}

//server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
