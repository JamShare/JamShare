import io from 'socket.io-client';

let socket;

export const initiateSocket = (username, room) => {
  socket = io.connect('http://localhost:3000');
  //const socket = io.connect('http://localhost:3000');
  console.log(`Connecting socket...`);
  if (socket && room) {
    socket.emit('joinRoom', { username, room });
  }
};

export const switchRooms = (prevRoom, nextRoom) => {
  if (socket) {
    socket.emit('switchRoom', { prevRoom, nextRoom });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const joinChatRoom = (cb) => {
  if (!socket) {
    return true;
  }
  socket.on('chatRoom', (msg, name) => {
    let newMsg = `${name}: ${msg}`;
    return cb(null, newMsg);
  });
  socket.on('disconnectRoom', (reason) => {
    //console.log('disconnected');
    return cb('disconnected');
  });
};

export const sendMessage = (room, message, name) => {
  if (socket) {
    socket.emit('chatRoom', { message, room, name });
  }
};

export const loadInitialChat = (cb) => {
  if (!socket) {
    return true;
  }

  socket.on('joinResponse', (msg) => cb(null, msg));
};

export const setSocketName = (username) => {
  if (socket) {
    socket.on('setSocketName', { username });
  }
};
