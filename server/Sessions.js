//Communicates with Room.js primarily.
const Socket = require('socket.io');
// const { default: Participants } = require('../client/src/components/Participants.js');

// server components:
const Clients = require('./Clients.js');
const Streams = require('./Stream.js');

class Sessions {
  constructor() {
    //sessions indexed by sessionID containing clients
    this.sessions = new Map();
  }

  createSession(data, socket) {
    let genSessionID = this.generateSessionID();
    if (this.sessions.get(genSessionID) != undefined)
      //recurse
      return createSession(socket);
    var session = new Session(genSessionID);
    this.sessions.set(genSessionID, session);
    socket.emit('create-session-response', genSessionID); //emit to only that client so they can view the code
    this.findSessionIDFromSocketID(socket.id);
  }

  joinSession(data, socket) {
    // var sess = new Session();
    let sessionID = data.sessionID;
    console.log("user joining session", data.guest);
    if (sessionID) {
      var currentSession = this.sessions.get(sessionID);
      //console.log('currentSession');
      //console.log(currentSession);
      currentSession.joinSession(socket, data.guest);
    } else {
      socket.emit('join-session-fail', data.sessionID);
      console.log(
        'User %s attempted to join session %s which does not exist.',
        data.guest,
        data.sessionID
      );
    }
  }

  startGameSession(sessionID) {
    let session = this.findSessionByID(sessionID);
    session.startGameSession();
  }

  findSessionByID(sessionID) {
    console.log('find session by id fucntion');
    return this.sessions.get(sessionID);
  }

  findSessionIDFromSocketID(socketI) {
    var seshID = '';
    this.sessions.forEach(function (valuesess, keysess) {
      console.log(valuesess);
      console.log(keysess);
      valuesess.clients.clients.forEach(function (valueclient, keyclient) {
        console.log(keyclient);
      });
      if (valuesess.clients.clients.socketID == socketI) seshID = keysess;
    });
    console.log('findsesh:');
    console.log(seshID);
    return seshID;
  }

  generateSessionID() {
    // var crypto = require("crypto");
    // var id = crypto.randomBytes(20).toString('hex');

    let length = 20;
    let genSessionID = '';
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      genSessionID += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return genSessionID;
  }
  updateUserList(userList, sessionID) {
    console.log('userList');
    console.log(userList);
    var currentSession = this.sessions.get(sessionID);//gets session object with sessionID key
    currentSession.updateClientsSessionsUsernameList(userList);
    console.log('updateUserList');
    console.log(currentSession.clients.clients);
  }

  participantsOrder(data, socketID) {
    let session = this.findSessionIDFromSocketID(socketID);
    session.updateParticipants(data);
  }

  getUserList(sessionID) {
    console.log('Get Userlist');
    var currentSession = this.sessions.get(sessionID);
    let userList = currentSession.getClientsSessionsUsernameList();
    return userList;
  }
}




class Session {
  constructor(sessionID) {
    this.clients = new Clients();
    this.sessionID = sessionID;
    // game session in progress or not? disallow changes to player order during runtime
    this.gameSession = false;
  }

  // retSessionIDandClients(){
  //   return [this.sessionID, this.clients.retclients()];
  // }

  updateParticipants(data) {
    console.log('updating paricipants order');
    socket.brodcast.to(sessionID).emit('participants-order', data);
  }

  joinSession(socket, username) {
    try {
      console.log('Using joinSession no S');
      this.clients.addClient(socket.id, username);
      socket.join(this.sessionID);
      //send usernames to client from client object
      let usernames = this.clients.getUsernames();
      console.log(usernames);
      socket.emit('join-session-success', usernames);
      //socket.emit('participants', { usernames });
      socket.to(this.sessionID).emit('client-update-userlist', usernames);
      //socket.brodcast.to(sessionID).emit('stream-names', streams);
    } catch (error) {
      socket.emit('join-session-failed');
      console.error(error);
    }
  }
  getClientsSessionsUsernameList() {
    let usernames2 = this.clients.getUsernames();
    console.log("newuserlist", usernames2)
    socket.emit('client-update-userlist', usernames2);
    return usernames2;
  }

  updateClientsSessionsUsernameList(userList) {
    console.log('updateClientsSessionsUsernameList');
    console.log(userList);
    newuserlist = this.clients.updateUsernames(userList);
    socket.to(this.sessionID).emit('client-update-userlist', newuserlist);
  }

  startGameSession() {
    this.gameSession = true;
    // socket.brodcast.to(sessionID).emit('game-started');
  }

  startPlayerStream(socket) {
    nextSID = this.clients.getNextPlayer();
    // socket.to(nextSID).emit('start-stream');
  }

  sendStreams() {
    usernames = this.clients.getUsernames();
    // socket.brodcast.to(sessionID).emit('stream-names', streams);
  }

  sendLatency(start_time) {
    let end_time = Date.now();
    interval = end_time - start_time / 1000;
    socket.emit('pong', interval);
  }
}

module.exports = Sessions;
