const express = require('express'); //http://expressjs.com/en/5x/api.html
const app = express();
const path = require('path');
const { createServer } = require('http');
const httpServer = createServer(app);
const { Server } = require('socket.io');
const PORT = 3000;
// var mongoose = require('mongoose');

//for server side audio manipulations
// const AudioContext = window.AudioContext || window.webkitAudioContext; //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
// const audioContext = new AudioContext(); //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

// import server functions
const {} = require('./audio.js');

//sessions
const {
	// joinSession,
} = require('./session.js');

// database
// const{

// } = require("./database.js");

const io = new Server(httpServer, {
	/* options */
}); // using socket with express middleware: https://socket.io/docs/v4/server-initialization/

// session ID generation https://socket.io/docs/v4/server-instance/
// const uuid = require("uuid");
// io.engine.generateId = (req) => {  return uuid.v4(); }// must be unique across all Socket.IO servers

//customizing initial headers on request ("initial_headers", "headers", and "connection_error" are specially emitted by socket.io)
// io.engine.on("initial_headers", (headers, req) => {
//     headers["JamShare"] = "JamShare";
//     headers["set-cookie"] = "mycookie=JamShare";
// });
//environments

// allowing express to load external resources
// app.use('/cors', require('cors')());

// socket events
io.on('connection', (socket) => {
	let clientID = socket.id;
	console.log('Client Connected', clientID);

	// add server actions here
	//sessions
	socket.on('join-session', (sessionID) => joinSession(clientID, sessionID));

	//database

	//serverside audio
});

io.engine.on('connection_error', (err) => {
	console.log(err.req); // the request object
	console.log(err.code); // the error code, for example 1
	console.log(err.message); // the error message, for example "Session ID unknown"
	console.log(err.context); // some additional error context
});

//set listen port, and log it.
httpServer.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
// app.use(path);//path, callback

// app.use((req, res, next) => {
//     // For example, a GET request to `/test` will print "GET /test"
//     console.log(`${req.method} ${req.url}`);
//     res.send(`${req.method} ${req.url}`);
//     next();//allows code below to execute
// });

// app.get('/test', (req, res, next) => {
//     res.send('ok');
//     next();
// });

app.get('/client/public', (req, res, next) => {
	// res.send('../client/public');
	res.sendFile('../client/public/index.html', {
		root: path.join(__dirname, '../client/public'),
	});

	next();
});

app.use(express.static(path.resolve(__dirname, '../client/public')));
