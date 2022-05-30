import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from 'react-bootstrap/esm/FormLabel';
import socket from '../index';
var num = 0;
function Chat(props) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  // export const joinChatRoom = (cb) => {
  //   if (!socket) {
  //     return true;
  //   }
  //   socket.on('sendChatMessage', (msg, name) => {
  //     return cb(null, msg);
  //   });
  useEffect(() => {
    console.log('use effect ');
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

// class Chat extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       username: '',
//       message: '',
//       messages: [],
//     };
//     this.socket = io();
//     this.socket.on('RECEIVE_MESSAGE', function (data) {
//       addMessage(data);
//     });

//     const addMessage = (data) => {
//       console.log(data);
//       this.setState({ messages: [...this.state.messages, data] });
//       console.log(this.state.messages);
//     };

//     this.sendMessage = (ev) => {
//       ev.preventDefault();
//       this.socket.emit('SEND_MESSAGE', {
//         author: this.state.username,
//         message: this.state.message,
//       });
//       this.setState({ message: '' });
//     };
//   render() {
//     return (
//       <div class="chatblock"></div>
//     );
//   }
// }

//   render() {
//     return (
//       <div className='chat'>
//         <div className='chat-container'>
//           <div className='chat-body'>
//             <div className='chat-title'>Live Chat</div>
//             <hr />
//             <div className='messages'>
//               {this.state.messages.map((message) => {
//                 return (
//                   <div>
//                     {message.author}: {message.message}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//           <div className='chat-elements'>
//             <input
//               type='text'
//               placeholder='Username'
//               value={this.state.username}
//               onChange={(ev) => this.setState({ username: ev.target.value })}
//               className='form-control'
//             />
//             <br />
//             <input
//               type='text'
//               placeholder='Message'
//               className='form-control'
//               value={this.state.message}
//               onChange={(ev) => this.setState({ message: ev.target.value })}
//             />
//             <br />
//             <button
//               onClick={this.sendMessage}
//               className='btn btn-primary form-control'>
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
