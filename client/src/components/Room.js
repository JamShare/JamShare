import React, { useEffect, useState, useRef } from 'react';
import Chat from './Chat';
import Recorder from './Recorder';
import Viewer from './Viewer';
import Participants from './Participants';
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import './App.css'
import './room.css'
import JamShareLogo from './assets/images/JamShareLogo.jpg'
import socket from "../index";
//import headlong from './assets/musics/headlong70.mp3'


function Room() {
  let { state: { sessionID, guest, usernames }, } = ({} = useLocation()); //gets the variable we passed from navigate
  const [serverUserList, setServerUserList] = useState(usernames);//important for saving the state passed to this parent component from the server. child components access this via "props" and do not use their own setstate for this value
  const [indicesReady, setIndicesReady] = useState([0,0,0,0]);
  const [clientIndex, setClientIndex] = useState(-1);
  
  console.log("room state:", sessionID, guest, serverUserList, indicesReady, clientIndex);

  //server messages to client console
  socket.on('servermessage', (message) => {
    console.log("servermessage:", message);
  });
  socket.on('error', (error) => {
    console.error("servererror:", error);
  });

  //user list updates
  socket.on('client-update-userlist', (newusernames) => {
    console.log('room got user order update', newusernames);
    setServerUserList(newusernames);

    for (var i = 0; i < newusernames.length; i++) {
      console.log("room index order", newusernames[i], i);
      if(newusernames[i] === guest){
        console.log("this client is index", newusernames[i], i);
        setClientIndex(i);
        break;//break or index gets set to -1 in next iteration
      }
      else {
        console.log("this client is not index. seeking next index", i);
        setClientIndex(-1)
      }
      if(clientIndex === -1){
        console.log("failed to find matching user index")
      }
    }
  });

  //ready states
  socket.on('player-index-ready', (index) => {
    console.log('room: index player ready:', index);
    var newlist = [indicesReady];
    console.log('newlist:', newlist);
    const [updatedIndices] = newlist.splice(index, 1, 1);//in index, put 1 value of 1. 
    console.log("updated ready indices:", updatedIndices);
    setIndicesReady(updatedIndices);
  });
  socket.on('player-index-not-ready', (index) => {
    console.log('room: index player not ready:', index);
    var newlist = [indicesReady];
    console.log('newlist:', newlist);
    const [updatedIndices] = newlist.splice(index, 1, 0);//in index, put 1 value of 0. 
    console.log("updated indicies", updatedIndices);
    setIndicesReady(updatedIndices);
  });

  //closing room window
  useEffect(()=>{
    window.addEventListener('beforeunload', keepOnPage);//this is fired upon component mounting
    return()=>{//things in return of useEffect are ran upon unmounting
        // var data = {sessionID:sessionID, guest:guest}
        // socket.emit('disconnect');//do not send data: server only recieved undefined.
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
  
  return (
    <div class="ProjectSectionContent" >
      {/* <audio src={headlong} autoPlay></audio> */}
      <div class="jybanner">
        <img class='jam-logo' src={JamShareLogo} alt='logo'/>
        
      </div>
      <Participants clientIndex={clientIndex} readyUsers={indicesReady} userlist={serverUserList} sessionID={sessionID} guest={guest}></Participants>
      <Viewer userlist={serverUserList} sessionID={sessionID} guest={guest}></Viewer>
      {/* <Chat userlist={serverUserList} sessionID={sessionID} guest={guest}></Chat> */}
      <Recorder clientIndex={clientIndex} readyUsers={indicesReady} userlist={serverUserList} sessionID={sessionID} guest={guest}></Recorder>
      <div class="jybannerb">
      Session ID: {sessionID} - Portland State University - JamShare - 2022
      </div>
    </div>
  );
}
export default Room;