import React, { useEffect, useState, useRef } from 'react';
import {
    initiateSocket,
    switchRooms,
    disconnectSocket,
    joinChatRoom,
    sendMessage,
    loadInitialChat,
    setSocketName,
  } from './Socket';
   
class Participants extends React.Component {
        constructor(props) {
            super(props);
    
            this.state = {
                
            };
        
            this.participants = [];    
        }
    
    render() {
        return (
            <div id="container" >

            </div>
        );
    }
}

export default Participants;