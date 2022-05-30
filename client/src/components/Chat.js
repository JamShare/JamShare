import React, { useEffect, useState, useRef } from 'react';
import socket from '../index';
function Chat(props) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    setChat([]);
    socket.on('new-chat-history', (msg) => {
      console.log('new-chat-history:', msg);
      if (!msg) {
        setChat([]);
      } else {
        setChat(msg);
      }
    });

    socket.on('new-chat-message', (msg) => {
      console.log('new-chat-messaged:', msg);
      if (msg) {
        setChat((oldChats) => [msg, ...oldChats]);
      } else {
        setChat(msg);
      }
    });
    console.log('SOCKET DONE');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message == '') return;

    let newMsg = `${props.guest}: ${message}`;
    setChat((oldChats) => [newMsg, ...oldChats]);
    var data = {
      username: props.guest,
      msg: newMsg,
      sessionID: props.sessionID,
    };
    socket.emit('chat-message', data);
    setMessage(''); //clear input box. (value={message})
  };

  const handleKeypress = (e) => {
    //
    if (e.keyCode === 13) {
      //key code 13 is 'enter' key
      sendMessage();
    }
  };

  return (
    <div className='ProjectSectionContent'>
      <div className='recordblock'>
        <br></br>
        <input
          type='text'
          name='message'
          id='messageinput'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => handleKeypress(e.target.value)}
        />
        <button className='a2' onClick={sendMessage}>
          Send
        </button>
        {chat && chat.map((m, i) => <p key={i}>{m}</p>)}
      </div>
    </div>
  );
}

export default Chat;
