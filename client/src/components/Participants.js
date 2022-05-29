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

//const SERVER = "http://localhost:3001";
const SERVER = "https://berryhousehold.ddns.net:3001";
import socket from "../index";

// class Participants extends React.Component {
function Participants(props) {

  // React state to track order of items
    // const [users, setUsers] = useState([]);
  // const socket = props.socket;
  

    // const [sessionID, setSessionID] = useState(props.seshID);
    console.log("participants sessionID", props.sessionID);
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
    //emit new list to server and update it when we get the response in room.js, which is handed to this component in props.
    let data = {updatedList:updatedList, sessionID:props.sessionID};
    console.log('Sending updated order to server',data);
    socket.emit('server-update-userlist', data);
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
  // socket.on('client-update-userlist', (usernames) => {
  //   console.log('user order update');
  //   setUsers(usernames); //this is where it actually gets updated
  // });

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
                      <img className='dragUp' src={image4} width='20' height='5' alt=' dragImage '></img>                                           
                      <img className='dragDn' src={image5} width='20' height='5' alt=' dragImage '></img>                                        
                      <img className='round' src={image2} width='50' height='50' alt=' UserImage '></img>
                      {item+": "+(index+1)}
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
        <img src={image3} width='50' height='50' alt=' add icon '></img>
      </div>      
    </div>
  );

  // }
}

export default Participants;