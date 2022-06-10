/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState} from 'react';
import socket from '../index';
function Chat(props) {
  const initialValues = {
    // type all the fields you need
    username: '',
    justMsg: '',
    msg: '',
  };
  const [message, setMessage] = useState('');
  const [currID, setID] = useState(props.sessionID);
  const [chat, setChat] = useState([initialValues]);

  useEffect(() => {
    setID(props.sessionID);
  }, [props.sessionID]);

  useEffect(() => {
    //console.log('new-chat-history BEFORE CHAT:', chat);

    console.log(props);
    setChat([]);

    socket.on('new-chat-history', (msg) => {
      console.log('new-chat-history:', msg);

      if (!msg) {
        setChat([]);
      } else {
        setChat(msg);
      }
    });

    socket.on('new-chat-message', (data) => {
      console.log('new-chat-messaged:', data);

      setChat((oldChats) => [data, ...oldChats]);
    });
  }, []);

  const sendMessage = (event) => {
    if (event.keyCode === 13 || event.type === 'click') {
      if (message === '') {
        console.log('empty chat msg');
        return;
      }
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
        sessionID: currID,
      };
      socket.emit('chat-message', data);
      setMessage(''); //clear input box. (value={message})
    }
  };

  return (
    <div className='ProjectSectionContent'>
      <div className='chatinputblock'>
        <br></br>
        <div className='RoomComponentList RoomComponentListChatinput'>
          <input className='chatInput'
            type='text'
            name='message'
            id='messageinput'
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
            onKeyDown={sendMessage}
          />
          <button className='send' onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
      <div className='chatblock'>
        {chat &&
          chat.map((m, i) => {
            if (m.username === 'badeed') {
              return (
                <p key={i}>
                  <b style={{ color: 'red' }}>{m.username}</b>: {m.justMsg}
                </p>
              );
            } else {
              return (
                <p key={i}>
                  <b style={{ color: 'blue' }}>{m.username}</b>: {m.justMsg}
                </p>
              );
            }
          })}
      </div>
    </div>
  );
}

export default Chat;
