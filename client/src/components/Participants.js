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


import image2 from './assets/images/record.png'

const names = ['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5'];
class Participants extends React.Component {
    
        constructor(props) {
            super(props);
    
            this.state = {
                
            };
        
            this.participants = [];    
        }
    render() {
        return (
            <div class="userblock">
                {names.map((r, i) => (
                    <div class="ProjectSectionBlock">
                        <div class="RoomComponentList"  key={i}>
                            <img class="rounded" src={image2} width="50" height="50"alt=" UserImage "></img>
                            {r}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default Participants;