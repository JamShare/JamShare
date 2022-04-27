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

import image1 from './assets/images/playing.png'
import image2 from './assets/images/record.png'

const names = ['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5'];
const records = ['record1', 'record2', 'record3', 'record4', 'record5', 'record6'];
class Participants extends React.Component {
    
        constructor(props) {
            super(props);
    
            this.state = {
                
            };
        
            this.participants = [];    
        }
    render() {
        return (
            <div class="ProjectSectionContent" >
                <div class="banner">
                    <div class="banner_text">
                        JamShare
                    </div>
                </div>
                <div class="ProjectSectionContainer">
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
    
                    <div class="recordblock">
                        {records.map((r, i) => (
                        <div class="ProjectSectionBlock">
                            <div class="RoomComponentList"  key={i}>
                                <img class="rounded" src={image1} width="50" height="50"alt=" UserImage "></img>
                                {r}
                            </div>
                        </div>
                        ))}
                    </div>
               
                    <div class="jamblock">
                        <h1>JAM</h1>
                        <img class="rounded" src={image1} width="250" height="250"alt=" recording "></img>
                    </div>
                </div>
            </div>
        );
    }
}

export default Participants;