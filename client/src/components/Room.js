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

import io, { Socket } from "socket.io-client";
import Chat from './Chat';
import Recorder from './Recorder';
import Viewer from './Viewer';
import Participants from './Participants';
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import './App.css'
import './room.css'
const SERVER = "http://localhost:3001";
const socket = io.connect(SERVER);

function Room() {
  const [message, setMessage] = useState("");
const [messageReceived, setMessageReceived] = useState("");
  let { state: {sessionID, guest}} = {}  = useLocation(); //gets the variable we passed from navigate
  console.log(sessionID, guest)
  //const navigate = useNavigate();
  //navigate('/Chat', {state:{sessionID, guest}});
  
  //breaks the rendering 
  // const location = useLocation();
  // const { state: { guest, sessionID } = {} } = useLocation();
  socket.on('message', (message) => {
    alert(message);
  })

  const sendMessage = () =>{
    console.log(message)
    socket.emit('send_message', {message, sessionID});
  }
  useEffect(() => {
    socket.emit('joinRoom', {guest, sessionID})
    socket.on("receive_message", (data)=>{
      if(data.message)
        alert(data.message);
      setMessageReceived(data.message);
    })
  }, [socket])

  return (
    <div>
      <input placeholder='message' onChange={(e) =>{setMessage(e.target.value)}} />
      <button onClick={sendMessage}>send message</button>
      <h1>Welcome {guest}</h1>
      <h2>Session ID: {sessionID}</h2>
      {messageReceived}
      <Participants></Participants>
      <Viewer></Viewer>
      <Recorder></Recorder>
      <Chat></Chat>
    </div>
  );
}
export default Room;

