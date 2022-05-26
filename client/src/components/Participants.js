import React, { useEffect, useState, useRef } from 'react';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import image2 from './assets/images/user.jpg';
import image4 from './assets/images/dragup.jpg';
import image3 from './assets/images/add.jpg';
import image5 from './assets/images/dragdn.jpg';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// let { state: {sessionID, guest}} = {}  = useLocation(); //gets the variable we passed from navigate

const io = require('socket.io-client');
const SERVER = 'http://localhost:3001';
const socket = io.connect(SERVER);

// class Participants extends React.Component {
function Participants() {
  let {
    state: { sessionID, guest, usernames },
  } = ({} = useLocation()); //gets the variable we passed from navigate
  if (!usernames) {
    usernames = ['badeed', 'Zach', 'JC', 'Morg', 'not badeed'];
  }
  const [users, setUsers] = useState(usernames);
  const [sessionID2, setSessionID2] = useState(sessionID);
  const [host, setHost] = useState(true);

  const defaultList = ['badeed', 'Zach', 'JC', 'Morg', 'not badeed'];
  // React state to track order of items
  const [itemList, setItemList] = useState(defaultList);

  // Function to update list on drop
  const handleDrop = (droppedItem) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;
    //var updatedList = [...itemList];
    var updatedList = [...users];
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    // Update State
    //setItemList(updatedList);
    setUsers(updatedList);

    //emit new list to server
    console.log('Sending updated order to server');
    console.log(updatedList);
    socket.emit('server-update-userlist', updatedList, sessionID2);
  };
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

  socket.on('participants', (usernames) => {
    console.log('user order update');
    this.setState({ participants: usernames }); //this is where it actually gets updated
    if (this.socket.id == usernames[0].socketID) setHost({ host: true });
    else setHost({ host: false });
  });

  socket.on('client-update-userlist', (usernames) => {
    console.log('user order update');
    setUsers(usernames); //this is where it actually gets updated
  });

  return (
    <div className='userblock'>
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId='RoomComponentList'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {users.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <div
                      className='RoomComponentList'
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}>
                      <img className='dragUp'
                        src={image4}
                        width='20'
                        height='5'
                        alt=' UserImage '>
                      </img>
                      <img className='dragDn'
                        src={image5}
                        width='20'
                        height='5'
                        alt=' UserImage '>
                      </img>
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
      <div className='RoomComponentList RoomComponentListAddImg'>
        <img
          src={image3}
          width='50'
          height='50'
          alt=' add icon '>
        </img>
      </div>      
    </div>
  );

  // }
}

export default Participants;
