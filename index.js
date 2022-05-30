// const express = require('express'); //http://expressjs.com/en/5x/api.html
// const app = express();
// const path = require('path');
// const { createServer } = require('http');
// const httpServer = createServer(app);
// const { Server } = require('socket.io');
// const PORT = 3000;

// // import server functions
// // const {} = require('./audio.js');

// //sessions
// const {
// 	// joinSession,
// } = require('./session.js');

// // database
// // const{} = require("./database.js");

// const io = new Server(httpServer, {
// 	/* options */
// }); // using socket with express middleware: https://socket.io/docs/v4/server-initialization/

// // session ID generation https://socket.io/docs/v4/server-instance/
// // const uuid = require("uuid");
// // io.engine.generateId = (req) => {  return uuid.v4(); }// must be unique across all Socket.IO servers

// //customizing initial headers on request ("initial_headers", "headers", and "connection_error" are specially emitted by socket.io)
// //environments

// // app.use('/cors', require('cors')());

// // socket events
// io.on("connection", (socket) => {
//     let clientID = socket.id;
//     console.log("Client Connected", clientID);
    
//     // add server actions here
//     //sessions
//     socket.on("join-session", (sessionID) => joinSession(clientID, sessionID));
  
//     //streaming 
//     // socket.on("music-stream", (musicData, sessionID) => 

//     //database

//     //serverside audio

// });

// io.engine.on("connection_error", (err) => {
//       console.log(err.req);      // the request object  
//       console.log(err.code);     // the error code, for example 1  
//       console.log(err.message);  // the error message, for example "Session ID unknown"  
//       console.log(err.context);  // some additional error context
// });


//   //set listen port, and log it.
// httpServer.listen(PORT, () => {
//     console.log(`Server listening on ${PORT}`);
// });

// app.get('/client/public', (req, res, next) => {
// 	res.sendFile('../client/public/index.html', {
// 		root: path.join(__dirname, '../client/public'),
// 	});
// 	next();
// });

// app.use(express.static(path.resolve(__dirname, '../client/public')));
