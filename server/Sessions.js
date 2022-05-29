//Communicates with Room.js primarily.
const socket = require('socket.io');
// const { default: Participants } = require('../client/src/components/Participants.js');

// server components:
const Clients = require('./Clients.js');
const Streams = require('./Stream.js');

class Sessions {
  constructor() {
    //sessions indexed by sessionID containing clients
    this.sessions = new Map();
  }

  // disconnectUser=(socket, sessionID, guest)=>{
  disconnectUser(socket){
    // try{
      const currentSID = this.findSessionIDFromSocketID(socket.id)
      console.log("currentSID", currentSID);

      const currentSession = this.sessions.get(currentSID);
      console.log("client", socket.id, "disconnecting from session:", currentSession);

      let dcUser = null;
      dcUser = currentSession.disconnectClient(socket);
      console.log("DCuser being removed from:",currentSession.sessionID, dcUser);
      
      if(dcUser!= null){
        currentSession.sendClientsSessionsUsernameList(socket);//update remaining clients
        socket.disconnect();
        console.log("user", dcUser.username, "disconnected. users remaining in:", currentSession.sessionID , currentSession.clients.getUsernames());
      } else console.log("error disconnecting user", dcUser.username, dcUser.socketID, currentSession.sessionID);
    // } catch (error){
    //   console.log("failed to disconnect user...\n",dcUser.username, dcUser.socketID, currentSession.sessionID, error);
    // } 
  }

  streamStarting(data, socket){
    var currentSession = this.sessions.get(data.sessionID);
    currentSession.notifyStreamStart(data.index, socket);
  }

  createSession(data, socket) {
    let genSessionID = this.generateSessionID();
    if (this.sessions.get(genSessionID) != undefined)//recurse
      return createSession(socket);

    //create new session and add it to the sessions map
    console.log("creating new session for user",socket.id);
    var session = new Session(genSessionID);
    this.sessions.set(genSessionID, session); //maps session object with key=genSessionID
    console.log("new session created", this.sessions.get(genSessionID));
    socket.emit('create-session-response', genSessionID); //emit to only that client 
    // this.findSessionIDFromSocketID(socket.id);
  }

  joinSession(data, socket) {
    // var sess = new Session();
    let sessionID = data.sessionID;
    console.log("user joining session:", data.username);
    if (sessionID) {
      var currentSession = this.sessions.get(sessionID);
      //console.log('currentSession',currentSession);
      currentSession.joinSession(socket, data.username);
    } else {
      socket.emit('join-session-fail', data.sessionID);
      console.log(
        'User %s attempted to join session %s which does not exist.',
        data.username,
        data.sessionID
      );
    }
  }

  startGameSession(sessionID) {
    let session = this.findSessionByID(sessionID);
    session.startGameSession();
  }

  findSessionByID(sessionID) {
    console.log('find session by id function');
    return this.sessions.get(sessionID);
  }

  findSessionIDFromSocketID=(socketID)=>{
    var seshID = '';
    this.sessions.forEach(function (valuesess, keysess) {
      console.log("findsesh",keysess,valuesess);
      valuesess.clients.clients.forEach(function (valueclient, keyclient) {
        console.log("clientfindsesh",keyclient,valueclient);
        if (valueclient.socketID == socketID) {
          seshID = keysess;
          console.log("findsesh final:", seshID)
        }
      });
    });
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

  updateUserList(userList, sessionID, socket) {
    console.log('sessions updating userlist', userList, sessionID);
    var currentSession = this.sessions.get(sessionID);//gets session object with sessionID key
    currentSession.updateClientsSessionsUsernameList(userList, socket);
    // console.log('updatedUserList is now: ', ret=>currentSession.getClientsSessionsUsernameList());
  }


  emitChatMessage(data, socket){
    var currentSession=this.sessions.get(data.sessionID);
    currentSession.sessionEmitChatmessage(data, socket);
  }


  // participantsOrder(data, socketID) {
  //   let session = this.findSessionIDFromSocketID(socketID);
  //   session.updateParticipants(data);
  // }

  getUserList(sessionID) {
    console.log('Get Userlist', sessionID);
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

  sessionEmitChatmessage(data, socket){
    console.log("sesssion emit message:", this.sessionID, data.msg);
    let newdata = {newMsg:data.msg};
    socket.to(this.sessionID).emit("new-chat-message", newdata);
  }

  disconnectClient(socket){
    console.log("session disconnectclient", socket.id);
    try{
      var removedclient = this.clients.removeClient(socket.id);
      console.log("client removed:", removedclient);
      return removedclient;
    }
    catch(error) {
      // socket.emit('disconnect-session-failed');
      console.error("failed to disconnected user", socket.id, error);
      return null;
    }
  }

  // updateParticipants(data) {
  //   console.log('updating paricipants order');
  //   socket.brodcast.to(sessionID).emit('participants-order', data);
  // }

  notifyStreamStart(index, socket){

  }

  joinSession(socket, username) {
    try {
      // console.log('Using joinSession no S);
      this.clients.addClient(socket.id, username);
      socket.join(this.sessionID);
      //send usernames to client from client object
      let usernames = this.clients.getUsernames();
      console.log("usernames now in session:",usernames);
      socket.emit('join-session-success', usernames);
      console.log("user joined. updating user list of:",this.sessionID);
      socket.to(this.sessionID).emit('client-update-userlist', usernames);
    } catch (error) {
      socket.emit('join-session-failed');
      console.error(error);
    }
  }

  sendClientsSessionsUsernameList(socket) {
    let usernames2 = this.clients.getUsernames();
    console.log("sending updating userlist", usernames2)
    socket.to(this.sessionID).emit('client-update-userlist', usernames2);
    return usernames2;
  }

  updateClientsSessionsUsernameList(userList, socket){
    console.log('updateClientsSessionsUsernameList',userList, this.sessionID);
    var newuserlist = this.clients.updateUsernames(userList);
    console.log("newuserlist update being sent to client:", newuserlist);
    socket.to(this.sessionID).emit('client-update-userlist', newuserlist);//sends to everyone else in the session
    socket.emit('client-update-userlist', newuserlist);//required to send back to client that sent the update
  }

  getClientsSessionsUsernameList(){
    return this.clients.getUsernames();
  }

  startGameSession(socket) {
    this.gameSession = true;
    // socket.brodcast.to(sessionID).emit('game-started');
  }

  startPlayerStream(socket) {
    nextSID = this.clients.getNextPlayer();
    // socket.to(nextSID).emit('start-stream');
  }

  sendStreams(socket) {
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
