import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import Recorder from './Recorder';
import Participants from './Participants';
import { useLocation } from 'react-router-dom';
import './App.css';
import './room.css';
import JamShareLogo from './assets/images/JamShareLogo.jpg';
import socket from '../index';

function Room() {
  let {
    state: { sessionID, guest, usernames },
  } = (useLocation()); //gets the variable we passed from navigate

  const [serverUserList, setServerUserList] = useState(usernames);

  console.log('room state: ', sessionID, guest, serverUserList);

  useEffect(() => {
    window.addEventListener('beforeunload', keepOnPage); //this is fired upon component mounting
    socket.on('client-update-userlist', (newusernames) => {
      console.log('room got user order update', newusernames);
      setServerUserList(newusernames);
    });
    return () => {
      //things in return of useEffect are ran upon unmounting
      console.log('component unmounting');
      window.removeEventListener('beforeunload', keepOnPage);
    };
  }, []);

  const keepOnPage = (e) => {
    var message =
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it.";
    e.returnValue = message;
    return message;
  };

  return (
    <div className='ProjectSectionContent'>
      <div className='jybanner'>
        <img className='jam-logo' src={JamShareLogo} alt='logo' />
      </div>

      <Participants
        userlist={serverUserList}
        sessionID={sessionID}
        guest={guest}></Participants>
      <Chat
        userlist={serverUserList}
        sessionID={sessionID}
        guest={guest}></Chat>
      <Recorder
        userlist={serverUserList}
        sessionID={sessionID}
        guest={guest}></Recorder>
      <div className='jybannerb'>
        Session ID: {sessionID} - Portland State University - JamShare - 2022
      </div>
    </div>
  );
}
export default Room;