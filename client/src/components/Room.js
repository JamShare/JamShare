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
  
  const names = ['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5'];
  const records = ['record1', 'record2', 'record3', 'record4', 'record5', 'record6'];
  //breaks the rendering 
  // const location = useLocation();
  // const { state: { guest, sessionID } = {} } = useLocation();

  return ( 
    <div class="a0" >
          <Participants></Participants>
      <Viewer></Viewer>
      <Recorder></Recorder>
      <Chat></Chat>
    </div>
  );
}
export default Room;

