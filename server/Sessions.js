//Communicates with Room.js primarily. 
const socket = require('socket.io');

// server components:
const Client = require('./Clients.js'); 
const Streams = require('./Stream.js');


class Sessions {

    constructor(){
    //sessions indexed by sessionID containing array of clients
      this.sessions = [
        { sessionID: 'session0', clients: []},//example format of session object list 
      ]
    }

    createSession(socketID, username){
      //Generate sessionID and ensure it is not a repeat in the list of sessions 
      //should wrap in a try catch block?
      generatedSessionID = generateSessionID();
      if(this.sessions[generateSessionID].clients.length > 0) //recurse
        return createSession(socketID, username)

      //Create a new session accessed by sessionID.
      this.sessions[generatedSessionID] = ({sessionID: generatedSessionID, clients: [new Client(socketID, username)]});
      socket.to(socketID).emit('create-session-response', generatedSessionID);//emit to only that client so they can view the code 
    }

    // joinSession(socketID, sessionID){
    joinSession(sessionID, socketID, username){//apparently does not need the socket.id
      // this.sessions[sessionID].push(socketID);//add the client socket.id to this session's list of clients.
      try{
        if(this.sessions[sessionID]!==undefined){
          this.sessions[sessionID].clients.push(new Client(socketID, username));
          socket.join(this.sessions[sessionID].sessionID);
          //send usernames to client from client object
          var usernames = []
          for(var i=0; i<this.sessions[sessionID].clients; i++){
            usernames.push(this.sessions[sessionID].clients[i].username);
          }
          socket.to(socketID).emit('join-session-success', usernames);//
        }
        else{
          socket.to(socketID).emit('join-session-fail', sessionID);
        }
      } catch{error}{
        console.error(error);
      }
    }

    findSessionIDFromSocketID( socketID ) {
      var sessionID = sessions.find((sessionID) => 
        sessions[sessionID].clients.find((client) => 
          client.id === socketID));
      return sessionID;
    }

    streamToSession(streamData, socketID){
      var sessionID = this.findSessionIDFromSocketID(socketID);
      socket.brodcast.to(sessionID).emit('server-audio-stream', streamData);
    }

    // chat(){
      // const { message, room, name } = data;
      // let newMsg = message;
      // if (name) {
      //   newMsg = `${name}: ${message}`;
      // }
      // socket.broadcast.to(socketRoom).emit('sendChatMessage', newMsg, name);
  
      // //this can be changed TODO
  
      // //let newMsg = message;
      // socketHistory[socketRoom] = socketHistory[socketRoom]
      //   ? [newMsg, ...socketHistory[socketRoom]]
      //   : [newMsg];
    // }

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

// export default Sessions;