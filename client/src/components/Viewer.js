import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

   
class Viewer extends React.Component {
        constructor(props) {
            super(props);
    
            this.state = {
                isRecording: false, //if true, display new audio item in list
                isDownloading: false, //if true, animate or highlight incoming stream list item
            };
        
            this.files = [];
        //     this.stream = ss.createStream();
        // this.middleBuffer = [];
        // this.filestream = fs.createReadStream(filename);

        }

    //socket.io events
    // useEffect(incomingStream = ( )=>{
    //     io.on('server-audio-stream', (audio)=>{
    //         console.log('recieving audio from server');
    //         if(audio!== undefined)
    //             this.files[audio.name].push(audio.data);
    //     });
    // },[]);

    
    render() {
        return (
            <div id="container" >
                
            </div>
        );
    }
}

export default Viewer;