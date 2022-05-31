import React, { useEffect, useState, useRef } from 'react';
import socket from '../index';
function Chat(props) {
  const initialValues = {
    // type all the fields you need
    username: '',
    justMsg: '',
    msg: '',
  };
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([initialValues]);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    //console.log('new-chat-history BEFORE CHAT:', chat);
    setChat([]);
    //console.log('new-chat-history after CHAT:', chat);
    socket.on('new-chat-history', (msg) => {
      console.log('new-chat-history:', msg);
      //console.log('new-chat-history CHAT:', chat);
      if (!msg) {
        setChat([]);
        //console.log('new-chat-history CHAT EMPTY:', chat);
      } else {
        setChat(msg);
        //console.log('new-chat-history CHAT FOUN:', chat);
      }
    });

    socket.on('new-chat-message', (data) => {
      console.log('new-chat-messaged:', data);
      //console.log('current chat ', chat);
      setChat((oldChats) => [data, ...oldChats]);
      if (chat[0].justMsg === 'empty') {
        //chat.pop();
        //console.log('current EMPTY chat ', chat);
        //chat.push(data);
      } else {
        //chat.push(data);
        //console.log('current chatPUSH  ', chat);
      }
    });

    console.log('SOCKET DONE');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message == '') return;
    let newMsg = `${props.guest}: ${message}`;
    var msgValues = {
      // type all the fields you need
      username: props.guest,
      justMsg: message,
      msg: newMsg,
    };
    //chat.push(msgValues);
    setChat((oldChats) => [msgValues, ...oldChats]);
    var data = {
      username: props.guest,
      justMsg: message,
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
        {chat &&
          chat.map((m, i) => (
            <p key={i}>
              {m.username}:{m.justMsg}
            </p>
          ))}
      </div>
    </div>
  );
}

export default Chat;
