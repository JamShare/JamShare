//Communicates with Room.js primarily. 
const socket = require('socket.io');

// server components:
const Clients = require('./Clients.js'); 
const Streams = require('./Stream.js');

class Sessions {
  constructor(){
    //sessions indexed by sessionID containing clients
    this.sessions = new Map();
  }

  createSession(socketID) {
    genSessionID = generateSessionID();
      if(this.sessions[generateSessionID].clients.length > 0) //recurse
      return createSession(socketID, username) 
    session = new Session(genSessionID);  
    this.sessions.set(genSessionID, session);
    socket.to(socketID).emit('create-session-response', genSessionID); //emit to only that client so they can view the code 
  }

  joinSession(sessionID, socketID, username) { //apparently does not need the socket.id
    session = findSessionByID(sessionID);
    if (session) 
      session.joinSession(sessionID, socketID, username);
    else {
      socket.to(socketID).emit('join-session-fail', sessionID);
      console.log('User %s attempted to join session %s and failed.', username, sessionID);
    }
  }

  startGameSession() {
    session = this.findSessionByID(sessionID)
    session.startGameSession();
  }

  findSessionByID(sessionID) {
    return this.sessions.get(sessionID);
  }

  findSessionIDFromSocketID( socketID ) {
      var sessionID = sessions.find((sessionID) => 
        sessions[sessionID].clients.find((client) => 
          client.id === socketID));
      return sessionID;
  }

  generateSessionID(){
    // var crypto = require("crypto");
    // var id = crypto.randomBytes(20).toString('hex');

    length = 20;
    var genSessionID = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      genSessionID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
      return genSessionID;
  }
}

class Session {
  constructor(sessionID) {
    this.clients = new Clients();
    this.sessionID = sessionID;
    // game session in progress or not? disallow changes to player order during runtime
    this.gameSession = false;
  }
  
  joinSession(socketID, username){//apparently does not need the socket.id
    try{
        this.clients.addClient(socketID/*, username */);
        socket.join(this.sessionID);
        //send usernames to client from client object
        var usernames = this.clients.getUsernames();
        socket.to(socketID).emit('join-session-success', usernames);//
    }
    catch{error}{
      socket.to(socketID.emit('join-session-failed'));
      console.error(error);
    }
  }

  startGameSession() {
    socket.brodcast.to(sessionID).emit('game-started');
  }

  startPlayerStream(socketID) {
    nextSID = this.clients.getNextPlayer();
    socket.to(nextSID).emit('start-stream');
  }

  sendStreams() {
    usernames = this.clients.getUsernames()
    socket.brodcast.to(sessionID).emit('stream-names', streams);
  }

  sendLatency(start_time) {
    let end_time = Date.now();
    interval = end_time - start_time / 1000;
    socket.emit('pong', interval);
  }
}

module.exports = Sessions;