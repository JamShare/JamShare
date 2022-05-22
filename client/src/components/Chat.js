import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from 'react-bootstrap/esm/FormLabel';
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";

import { io } from 'socket.io-client';
import {
  initiateSocket,
  switchRooms,
  disconnectSocket,
  joinChatRoom,
  sendMessage,
  loadInitialChat,
  setSocketName,
} from './Socket';


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

// export default Chat;


function Chat() {
 const rooms = ['Room 1', 'Room 2', 'Room 3'];
 const [room, setRoom] = useState(rooms[0]); // rooms[0] is default value which is "Room 1"
 const [message, setMessage] = useState('');
 const [username, setUsername] = useState('tempName'); //tempName is default value
 const [chat, setChat] = useState([]);
 const prevRoomRef = useRef();
 const messageBoxRef = useRef();

//  useEffect(() => {
//    prevRoomRef.current = room;
//  });
//  const prevRoom = prevRoomRef.current;

  // Hook on "room" state change
  // Clear chat then create room if it doesnt exist or move to new room if it does
  // Load chat history on room switches
//  useEffect(() => {
//    setChat([]);
//    if (prevRoom && room) {
//      switchRooms(prevRoom, room);
//    } else if (room) {
//      let newName = prompt('Enter Username, can be changed later');
//      if (username === 'tempName') {
//        setUsername(newName);
//      }
//      initiateSocket(username, room);

//      loadInitialChat((err, data) => {
//        if (err) {
//          console.error('Error on loadInitialChat', err);
//          return;
//        }
//        if (data) {
//          setChat(data);
//          handleReceieMessage();
//        }
//      });
//    }
//  }, [room]);

  // Load once, on load mostly
//  useEffect(() => {
//    joinChatRoom((err, data) => {
//      if (err) {
//        return;
//      }
//      setChat((oldChats) => [data, ...oldChats]);
//      handleReceieMessage();
//    });
//    return () => {
//      disconnectSocket();
//    };
//  }, []);

//  const handleReceieMessage = () => {
//    try {
//      if (messageBoxRef && messageBoxRef.current) {
//        messageBoxRef.current.scrollTop =
//          messageBoxRef.current.scrollHeight + 200;
//      }
//    } catch (error) {
//      console.error(error);
//    }
//  };

 return (
   <div className='ProjectSectionContent'>
    <h1 className='a1'>Room: {room}</h1>
    {/* {rooms.map((r, i) => (
       <div className='a3'>
        <button className='a2' onClick={() => setRoom(r)} key={i}>
           {r}
         </button>
       </div>
     ))} */}
     <h1 className='a1'>Online Chat:</h1>
     <div className='a3'>
      <input
        type='text'
        name='username'
        value={username}
      //  onChange={(e) => {
      //     setUsername(e.target.value);
      //   }}
      />
      {/* <button className='a2'
         onClick={() => {
          setUsername(username);
          setSocketName(username);
        }}>
        Set
      </button> */}
      <br></br>
       <input
         type='text'
        name='message'
        value={message}
       onChange={(e) => setMessage(e.target.value)}
      />
      <button className='a2'
        onClick={() => {
          let newMsg = `${username}: ${message}`;
          setChat((oldChats) => [newMsg, ...oldChats]);
          sendMessage(room, message, username);
        }}>
        Send
       </button>
     {chat && chat.map((m, i) => <p key={i}>{m}</p>)}
     </div>
   </div>
 );
}

export default Chat;
