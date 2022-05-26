import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import image1 from './assets/images/record.jpg'
import image3 from './assets/images/add.jpg';

const records = ['record1', 'record2', 'record3', 'record4', 'record5', 'record6',
 'record7', 'record8', 'record9', 'record10'];
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
      <div className='recordblock'>
        {React.Children.toArray(
          records.map((r, i) => (
            <div className='ProjectSectionBlock'>
              <div className='RoomComponentList' key={i}>
                <img
                  className='rounded'
                  src={image1}
                  width='50'
                  height='50'
                  alt=' UserImage '></img>
                {r}
              </div>
            </div>
          )))}
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
  }
}

export default Viewer;
