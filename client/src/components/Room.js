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

import io, { Socket } from 'socket.io-client';
import Chat from './Chat';
import Recorder from './Recorder';
import Viewer from './Viewer';
import Participants from './Participants';
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import './App.css'
import './room.css'
import JamShareLogo from './assets/images/JamShareLogo.jpg'
//import headlong from './assets/musics/headlong70.mp3'



const SERVER = "http://localhost:3001";
const socket = io.connect(SERVER);

function Room() {
  // const [message, setMessage] = useState("");
  // const [messageReceived, setMessageReceived] = useState("");
  let {
    state: { sessionID, guest, usernames },
  } = ({} = useLocation()); //gets the variable we passed from navigate
  
  console.log("room state: ". sessionID, guest, usernames);

  const [serverUserList, setServerUserList] = useState(usernames);

  socket.on('client-update-userlist', (usernames) => {
    console.log('user order update', usernames);
    setServerUserList(usernames);
  });
  
  //const navigate = useNavigate();
  //navigate('/Chat', {state:{sessionID, guest}});

  // const location = useLocation();
  // const { state: { guest, sessionID } = {} } = useLocation();
  // socket.on('message', (message) => {
  //   alert(message);
  // })

  // const sendMessage = () =>{
  //   console.log(message)
  //   socket.emit('send_message', {message, sessionID});
  // }
  // useEffect(() => {
  //   socket.emit('joinRoom', {guest, sessionID})
  //   socket.on("receive_message", (data)=>{
  //     if(data.message)
  //       alert(data.message);
  //     setMessageReceived(data.message);
  //   })
  // }, [socket])

  return (
    <div class="ProjectSectionContent" >
      {/* <audio src={headlong} autoPlay></audio> */}
      {/* <input placeholder='message' onChange={(e) =>{setMessage(e.target.value)}} /> 
       <button onClick={sendMessage}>send message</button> 
      <h1>Welcome {guest}</h1>
      <h2>Session ID: {sessionID}</h2>
       {messageReceived} */}
      <div class="jybanner">
        <img class='jam-logo' src={JamShareLogo} alt='logo'/>
      </div>
      {/* <Chat></Chat> */}

      <Participants userlist={serverUserList} sessionID={sessionID} guest={guest}></Participants>
      <Viewer userlist={usernames} sessionID={sessionID} guest={guest}></Viewer>
      <Recorder userlist={usernames} sessionID={sessionID} guest={guest}></Recorder>
      <div class="jybannerb">
        Portland State University - JamShare - 2022
      </div>
    </div>
  );
}
export default Room;
