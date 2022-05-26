import React, { useEffect, useState, useRef } from 'react';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import image2 from './assets/images/record.png';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './styles.css';
// let { state: {sessionID, guest}} = {}  = useLocation(); //gets the variable we passed from navigate

const io = require('socket.io-client');
const SERVER = 'http://localhost:3001';
const socket = io.connect(SERVER);

// class Participants extends React.Component {
function Participants(props) {

  // React state to track order of items
    // const [users, setUsers] = useState([]);

    const [sessionID, setSessionID] = useState(props.sessionID);
    console.log("participants sessionID", sessionID);
    console.log("participants userlist:", props.userlist);

  // Function to update list on drop
    const handleDrop = (droppedItem) => {
        // Ignore drop outside droppable container
        if (!droppedItem.destination) return;
        //var updatedList = [...itemList];
        var updatedList = [...props.userlist];
        // Remove dragged item
        const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
        // Add dropped item
        updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
        // Update State
        
        // setUsers(updatedList);

        //emit new list to server
        console.log('Sending updated order to server');
        console.log(updatedList);
        socket.emit('server-update-userlist', updatedList, sessionID);
  };
    //happens in room.js
//   socket.on('client-update-userlist', (usernames) => {
    // console.log('user order update');
    // setUsers(props.userlist); //this is where it actually gets updated
//   });



//   socket.on('participants', (usernames) => {
//     console.log('user order update');
//     this.setState({ participants: usernames }); //this is where it actually gets updated
//     if (this.socket.id == usernames[0].socketID) setHost({ host: true });
//     else setHost({ host: false });
//   });

  
  // const[index, setIndex] = useState(0);
  // this.state={
  //     users: [guest, "test0", "test1"],
  // }

  // console.log(users);
  // let temparray = users;
  // temp.splice(0,5,"zach");
  // console.log(temp);

  //for component extending react
  // setUsers({temp});
  // constructor(props) {
  //     super(props);

  //     this.state = {
  //         participants: ['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5'],
  //         host: true,
  //     };

  // this.participants = ['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5'];
  //     this.socket = io.connect(SERVER);


  // };

//   const up = (i) => {
    // console.log(i);
    // var temparray = users;

    // if (i > 0) var tempuser = temparray[i - 1];
    // else return;

    // console.log(tempuser);
    // console.log(temparray);

    // temparray.splice(i - 1, 1, temparray[i]);
    // console.log(temparray);

    // temparray.splice(i, 1, tempuser);
    // console.log(temparray);

    // setUsers({ temparray });

    // this.setState({users: temparray});

    // console.log(users);

    // this.socket.emit('participants-order', {temparray, sessionID});
//   };

//   function down(i) {
//     console.log(i);
    // var temp = this.state.participants[i+1];
    // this.state.participants.splice(i+1, 1, this.state.participants[i]);
    // this.state.participants.splice(i,1,temp);
//   }
 

  return (
    <div className='userblock'>
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId='RoomComponentList'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {props.userlist.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <div
                      className='RoomComponentList'
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}>
                      <img
                        className='round'
                        src={image2}
                        width='50'
                        height='50'
                        alt=' UserImage '></img>
                      {item}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  // }
}

export default Participants;
