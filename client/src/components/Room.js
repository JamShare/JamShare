import React, { useEffect, useState, useRef } from 'react';
import {
  initiateSocket,
  switchRooms,
  disconnectSocket,
  joinChatRoom,
  sendMessage,
  loadInitialChat,
  setSocketName,
} from './Socket';

import io from "socket.io-client";
import Chat from './Chat';
import Recorder from './Recorder';
import Viewer from './Viewer';
import Participants from './Participants';

function Room() {
  const rooms = ['Room 1', 'Room 2', 'Room 3'];
  const [room, setRoom] = useState(rooms[0]); // rooms[0] is default value which is "Room 1"
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('tempName'); //tempName is default value
  const [chat, setChat] = useState([]);
  const prevRoomRef = useRef();
  const messageBoxRef = useRef();

  useEffect(() => {
    prevRoomRef.current = room;
  });
  const prevRoom = prevRoomRef.current;

  //Hook on "room" state change
  //Clear chat then create room if it doesnt exist or move to new room if it does
  //Load chat history on room switches
  useEffect(() => {
    setChat([]);
    if (prevRoom && room) {
      switchRooms(prevRoom, room);
    } else if (room) {
      let newName = prompt('Enter Username, can be changed later');
      if (username === 'tempName') {
        setUsername(newName);
      }
      initiateSocket(username, room);

      loadInitialChat((err, data) => {
        if (err) {
          console.error('Error on loadInitialChat', err);
          return;
        }
        if (data) {
          setChat(data);
          handleReceieMessage();
        }
      });
    }
  }, [room]);

  //Load once, on load mostly
  useEffect(() => {
    joinChatRoom((err, data) => {
      if (err) {
        return;
      }
      setChat((oldChats) => [data, ...oldChats]);
      handleReceieMessage();
    });
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleReceieMessage = () => {
    try {
      if (messageBoxRef && messageBoxRef.current) {
        messageBoxRef.current.scrollTop =
          messageBoxRef.current.scrollHeight + 200;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Room: {room}</h1>
      {rooms.map((r, i) => (
        <button onClick={() => setRoom(r)} key={i}>
          {r}
        </button>
      ))}
      <h1>Online Chat:</h1>
      <input
        type='text'
        name='username'
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <button
        onClick={() => {
          setUsername(username);
          setSocketName(username);
        }}>
        Set
      </button>
      <br></br>
      <input
        type='text'
        name='message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={() => {
          let newMsg = `${username}: ${message}`;
          setChat((oldChats) => [newMsg, ...oldChats]);
          sendMessage(room, message, username);
        }}>
        Send
      </button>
      {chat && chat.map((m, i) => <p key={i}>{m}</p>)}
      
      <Participants></Participants>
      <Viewer></Viewer>
      <Recorder></Recorder>
      <Chat></Chat>
    </div>
  );
}
export default Room;
