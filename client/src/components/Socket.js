import io from 'socket.io-client';
// import ss from 'socket.io-stream';
// import path from 'path';//pathDownloadingFile = path.basename(data.name) //from data in stream
let socket;

// Streaming logic
export const streamToServer = () => {
  // print("hello");
  // ss.on('client-stream'), function(stream, data){
    // pathDownloadingFile = path.basename(data.name);
    // stream.pipe((pathDownloadingFile));
  // };
};



//Joining rooms logic 
//send joinRoom to server
export const initiateSocket = (username, room) => {
  socket = io.connect('http://localhost:3001');
  //const socket = io.connect('http://localhost:3000');
  //console.log(`Connecting socket...`);
  if (socket && room) {
    socket.emit('joinRoom', { username, room });
  }
};

//send switchRoom to server
export const switchRooms = (prevRoom, nextRoom) => {
  if (socket) {
    socket.emit('switchRoom', { prevRoom, nextRoom });
  }
};

//disconnect from room
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

//Load The chat be on listen for new msgs
export const joinChatRoom = (cb) => {
  if (!socket) {
    return true;
  }
  socket.on('sendChatMessage', (msg, name) => {
    return cb(null, msg);
  });

  socket.on('disconnectRoom', (reason) => {
    return cb('disconnected');
  });
};

//sendMessage to server
export const sendMessage = (room, message, name) => {
  if (socket) {
    socket.emit('sendChatMessage', { message, room, name });
  }
};

//load chat history
export const loadInitialChat = (cb) => {
  if (!socket) {
    return true;
  }

  socket.on('joinResponse', (msg) => cb(null, msg));
};

//change name on server
export const setSocketName = (username) => {
  if (socket) {
    socket.on('setSocketName', { username });
  }
};


// socket.on("disconnect", () => {
//   console.log(socket.connected); // false
// });