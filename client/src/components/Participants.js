import React, { useEffect, useState, useRef } from 'react';
// import {
//     initiateSocket,
//     switchRooms,
//     disconnectSocket,
//     joinChatRoom,
//     sendMessage,
//     loadInitialChat,
//     setSocketName,
//   } from './Socket';


import image2 from './assets/images/record.png'
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";

// let { state: {sessionID, guest}} = {}  = useLocation(); //gets the variable we passed from navigate

const io = require('socket.io-client');
const SERVER = "http://localhost:3001"; 
const socket = io.connect(SERVER);

// class Participants extends React.Component {
function Participants() {
    let { state: {sessionID, guest}} = {} = useLocation(); //gets the variable we passed from navigate
    const[users,setUsers] = useState(['jammer1', 'jammer2', 'jammer3', 'jammer4', 'jammer5']);
    const[host,setHost] = useState(true);


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
        
        
        socket.on("participants", (usernames) => {
            console.log("user order update");
            this.setState({participants:usernames});//this is where it actually gets updated
            if(this.socket.id == usernames[0].socketID)
                this.setState({host:true});
            else 
                this.setState({host:false});
        });
            
        // };

        const up=(i)=>{
            var temparray = users;
            var tempuser = temparray[i-1];
            console.log(temparray);
            temparray.splice(i-1, 1, temparray[i]);
            // temparray.splice(i,1,tempuser);
            // console.log(temparray);

            // setUsers((oldOrder) => [temparray, ...oldOrder]);

            // this.socket.emit('participants-order', {temparray, sessionID});
        }

        const down=(i)=>
        {
            console.log('');
            // var temp = this.state.participants[i+1];
            // this.state.participants.splice(i+1, 1, this.state.participants[i]);
            // this.state.participants.splice(i,1,temp);
        }    

    // render() {
        return (
            <div className="userblock">
                {users.map((r, i) => (
                    <div className="ProjectSectionBlock">
                        <div className="RoomComponentList"  key={i}>
                            <img className="rounded" src={image2} width="50" height="50"alt=" UserImage "></img>
                            {r}
                            {{host} ? 
                            <><button onClick={up(i)}>U</button><button onClick={down(i)}>D</button></>
                            :<></>}
                            
                        </div>
                    </div>
                ))}
            </div>
        );
    // }
}

export default Participants;