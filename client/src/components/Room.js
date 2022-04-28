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
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";

import './App.css'
import './room.css'
function Room() {
  
  
  //breaks the rendering 
  // const location = useLocation();
  // const { state: { guest, sessionID } = {} } = useLocation();

  return (
    <body>
      <div class="ProjectSectionContent" >
        <div class="banner">
          <div class="banner-text">JamShare</div>
        </div>
        
        <Participants></Participants>
        <Viewer></Viewer>
        <Recorder></Recorder>
        <Chat></Chat>
      </div>
    </body>
  );
}
export default Room;

