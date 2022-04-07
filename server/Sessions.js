//Communicates with Room.js primarily. 
const socket = require('socket.io');

// server components:
const Clients = require('./Clients.js'); 
const Streams = require('./Stream.js');


class Sessions {

    constructor(){
    //sessions indexed by sessionID containing array of clients
    this.sessions = [ ]
    
    // this.sessions = {
    //   sessionID: '',
    //   clients: [],
    // };
    // this.clients = []
    }

    createSession(socketID){
      //Generate sessionId and ensure it is not a repeat 
      //should wrap in a try catch block?
      generatedSessionID = generateSessionID();
      if(this.sessions[generateSessionID].clients.length > 0) //recurse
        return createSession(socketID)

      //Create a new session accessed by sessionID.
      this.sessions.push(generatedSessionID);
      this.sessions[generatedSessionID] = new Array(socketID);//add the client to this session. this may need to be initialized differently.
      
      socket.emit('create-session-response', generateSessionID);

    }

    // joinSession(socketID, sessionID){
    joinSession(sessionID, socketID){//apparently does not need the socket.id
      this.sessions[sessionID].push(socketID);//add the client socket.id to this session's list of clients.
      socket.join(this.sessions[sessionID]);
      // try{
      //   //get client info
      //   clientObject = this.clients.clientInfo(socket.id);
      //   if (clientObject !== undefined) {
      //     //recieve the data from the client in a room
      //     this.sessions[sessionID]. 
      // } catch (error) {
      //   console.error(error);
      // }
    }

    generateSessionID(){
      var genSessionID = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) {
        genSessionID += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
        return genSessionID;
    }
}

// export default Sessions;