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

// import io, { Socket } from 'socket.io-client';
import Chat from './Chat';
import Recorder from './Recorder';
import Viewer from './Viewer';
import Participants from './Participants';
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import './App.css'
import './room.css'
import JamShareLogo from './assets/images/JamShareLogo.jpg'
import headlong from './assets/musics/headlong.mp3'

// const SERVER = "http://localhost:3001";
// const socket = io.connect(SERVER);
import socket from "../index";

function Room() {
  let { state: { sessionID, guest, usernames }, } = ({} = useLocation()); //gets the variable we passed from navigate
  const [serverUserList, setServerUserList] = useState(usernames);

  console.log("room state: ", sessionID, guest, serverUserList);
  // const socket = props.socket;

  socket.on('client-update-userlist', (usernames) => {
    console.log('user order update', usernames);
    setServerUserList(usernames);
  });


  useEffect(()=>{
    window.addEventListener('beforeunload', keepOnPage);//this is fired upon component mounting
    return()=>{//things in return of useEffect are ran upon unmounting
        // socket.emit('disconnect', {sessionID, guest});  
        // socket.disconnect();//client wont try to reconnect.
        console.log("component unmounting"); 
        window.removeEventListener('beforeunload', keepOnPage);
      }
  },[]);
  
  const keepOnPage=(e)=> {
    var message = 'Warning!\n\nNavigating away from this page will delete your text if you haven\'t already saved it.';
    e.returnValue = message;
    return message;
  }
  
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
      
      {/* <input placeholder='message' onChange={(e) =>{setMessage(e.target.value)}} /> */}
      {/* <button onClick={sendMessage}>send message</button> */}
      {/*<h1>Welcome {guest}</h1>
      <h2>Session ID: {sessionID}</h2>
      {/* {messageReceived} */}
      <div class="jybanner">
        <img class='jam-logo' src={JamShareLogo} alt='logo'/>
        <h2>{sessionID}</h2>
      </div>
      {/* <Chat></Chat> */}
      

      <Participants userlist={serverUserList} sessionID={sessionID} guest={guest}></Participants>
      <Viewer userlist={usernames} sessionID={sessionID} guest={guest}></Viewer>
      <Recorder userlist={usernames} sessionID={sessionID} guest={guest}></Recorder>
    </div>
  );
}
export default Room;
