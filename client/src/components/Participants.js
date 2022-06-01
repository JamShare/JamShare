import React, { useEffect, useState, useRef } from 'react';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import image2 from './assets/images/user.jpg';
import image4 from './assets/images/dragup.jpg';
import image3 from './assets/images/add.jpg';
import image5 from './assets/images/dragdn.jpg';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import socket from "../index";
// class Participants extends React.Component {
function Participants(props) {
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

  function toggleReady(){
    try{
      console.log("toggleinfo", props.clientIndex, props.readyUsers);
    }catch(error){
      console.log(error)
    }

    if(props.readyUsers[props.clientIndex] === 0){
      let data = {index: props.clientIndex};
      console.log('Sending updated ready index to server', props.clientIndex);
      socket.emit('player-ready', data );
    } else if (props.readyUsers[props.clientIndex] === 1){
      let data = {index: props.clientIndex};
      console.log('Sending updated not ready index to server', props.clientIndex);
      socket.emit('player-not-ready', data );
    } else {
      console.log("error toggling ready status");
    }
  }

  return (
    <div className='userblock'>
      <div>
      <button onClick={toggleReady}>
                Toggle Ready
            </button>
      </div>

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
                      {props.readyUsers[index] !== 0 ? <> READY</> : <></>}
                      
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
}

export default Participants;