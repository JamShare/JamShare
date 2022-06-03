// server components:
const Clients = require('./Clients.js');
const Streams = require('./Stream.js');


//Sessions manages instances of Session  
class Sessions {
  constructor() {
    //sessions is indexed by sessionID
    this.sessions = new Map();
  }

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

  initjam(data, socket){
    try{
    console.log("index starting jam", data.index );
    const currentSID = this.findSessionIDFromSocketID(socket.id)
    console.log("currentSID", currentSID);

    const currentSession = this.sessions.get(currentSID);
  
    currentSession.initjam(data.index, socket);//emits to room which index is ready
    } catch (error){
      console.log("failed to signal start jam...\n", error);
      let data = {console:"failed to signal start jam...\n", error:error};
      socket.emit('message', data);//emits to just this client
    }
  }
}



//Session: instance contains information about an active session.
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

  // notifyStreamStart(index, socket){

  // }

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

  initjam(index, socket){
    //only called from client if userList[0] clicks and readyUsers is all 1's.
    //init clients in proper order. clients will only listen to index before them in client side but still need to be 
    //initialized in proper order.

    //clients begin writing to their incoming remote stream buffer when the audio stream being published is not empty...
    //only  
    //because we cannot socket.on for each client in the server from this function seperatedly, we must signal multiple times until conditions are met.
    
    //client 0 will emit startjam with index 1 in socket event when initialized and ready to publish.

    //this function gets called with index 1. send index 1 to room session. client index 1 will act accordingly by initalizing..
    //client 1 will emit startjam with index 2 in socket event when initialized and ready to publish. 
    ///....
    // this function gets called with last index . sends last index value to room session. clients will all begin listening to index 3's
    // publish for the mixed audio if it's the last in their userlist 
    try{
      if(index !== this.clients.clients.length - 1){//we are not at the last player yet
        let data = {message: ("signal player index to init", index)};
        console.log(data.message);
        socket.to(this.sessionID).emit("servermessage", data);
        socket.to(this.sessionID).emit("initialize", index);
      } 
    }catch(error){
      let data = {message: ("signal player index to init failed", index)};
      console.log(data.message);
      socket.to(this.sessionID).emit("servererror", data);
    }
  }
}

module.exports = Sessions;