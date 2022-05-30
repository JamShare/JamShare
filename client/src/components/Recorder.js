import React, { useState } from 'react';
// import image1 from './assets/images/playing.png';
// const io = require('socket.io-client');
// const SERVER = 'http://localhost:3001';
import socket from '../index';

var audiocontext = new AudioContext();
// var audioworkletnode = new AudioWorkletNode(audiocontext, "workletnode");
var sources = [];

class Recorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRecording: false,
      isPlaying: false,
      icon: require('./assets/images/record.png'),
      text: 'Jam!',
      //data from Room.js (parent component)
      userlist: props.userlist,
      sessionID: props.sessionID,
      username: props.guest,
    };
    console.log('recorder userlist: ', this.state.userlist);
    // const [image, setImage] = useState();
    // this.incomingStream = "";
    // this.outgoingStream = this.session + guestname;
    this.countdown = 3;
    this.startCountdown = false;

    this.streamOut = null;
    this.stream = null;
    this.recorder = null;
    this.audio = null;
    this.recordIcon = require('./assets/images/stop.jpg');
    this.playingIcon = require('./assets/images/play.jpg');
    this.pauseIcon = require('./assets/images/paus.jpg');

    //bind functions to instance
    this.onDataAvailable = this.onDataAvailable.bind(this);
    this.onStop = this.onStop.bind(this);
    this.getAudioDevice = this.getAudioDevice.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.playRecording = this.playRecording.bind(this);
    this.createAudioSource = this.createAudioSource.bind(this);
    this.connectMediaStream = this.connectMediaStream.bind(this);
    this.connectAudioBuffer = this.connectAudioBuffer.bind(this);
    this.countdownTimer = this.countdownTimer(this);

    // this.socket = io.connect(SERVER);
    // this.socket = props.socket;

    socket.on('audio-blob', (chunks) => {
      console.log('Audio blob recieved.');
      let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
      let audioURL = URL.createObjectURL(blob);
      this.audio = new Audio(audioURL);
    });
    socket.on('stream-to-download', (streamName) => {
      console.log('Listening to stream name: ', streamName);
      this.incomingStream = streamName;
    });
  }

  // useEffect(unknownParameter = () => {
  //     const interval = setInterval(() => {

  //         console.log('This will run every second!');

  //         // ss(socket).emit('client-stream', stream, {name: filename});
  //         // ss(socket).on('stream', function(this.stream) {};
  //         // this.filestream.pipe(this.chunks);

  //         ss(socket).emit('client-stream', this.stream);
  //         this.stream.pipe(fs.createWriteStream(this.filename));

  //     }, 1000);
  //     return () => clearInterval(interval);
  // },[]);

  // event handlers for recorder
  onDataAvailable(e) {
    console.log(e.data);

    e.data.arrayBuffer().then((arraybuffer) => {
      console.log(arraybuffer);
      this.createAudioSource(arraybuffer);
    });
    // this.socket.emit("audio-stream", e.data);
  }

  onStop(e) {
    console.log('Recording stopped successfully.');
    // this.socket.emit("audio-stream-end");
  }

  // asks for permission to use audio device from user
  // if declined or error, returns a null stream
  async getAudioDevice() {
    this.stream = null;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0,
        },
      });
    } catch (err) {
      console.error(err);
      this.stream = null;
    }

    this.recorder = null;
    if (this.stream) {
      this.recorder = new MediaRecorder(this.stream);

      // initialize event handlers for recorder
      this.recorder.ondataavailable = this.onDataAvailable;
      this.recorder.onstop = this.onStop;

      console.log('Recording device acquired successfully.');
    }
    return;
  }

  startRecording() {
    if (!this.recorder) {
      return;
    }
    if (this.state.isRecording) {
      return;
    }
    this.recorder.start(5000);
    this.setState({ icon: this.playingIcon });
    this.setState({ isRecording: true });
    console.log('Recording started successfully.');

    // this.socket.emit('audio-stream-start', this.outgoingStream);
    return;
  }

  stopRecording() {
    if (!this.recorder) {
      return;
    }
    if (!this.state.isRecording) {
      return;
    }
    this.setState({ icon: this.recordIcon });
    this.recorder.stop();
    this.setState({ isRecording: false });
    return;
  }

  playRecording() {
    if (this.state.isRecording) {
      this.setState({ icon: this.pauseIcon });
    }
    if (!this.state.isRecording) {
      this.setState({ icon: this.playingIcon });
    }
    // audiocontext.resume();
    // this.connectMediaStream();
    // setInterval(this.connectAudioBuffer, 5000);
    /*
        if (!this.audio) {
            return;
        }
        this.audio.play();
        return;
        */
  }

  // settimeout to start the function
  // setinterval to repeat

  // takes recorded audio data and creates an audio source from it
  createAudioSource(audioData) {
    console.log('Creation Started');
    audiocontext
      .decodeAudioData(audioData)
      .then((buffer) => {
        let bufferIn = audiocontext.createBufferSource(); //creates audio input into audio graph that utilizes audio buffers.
        bufferIn.buffer = buffer;
        bufferIn.onended = (bufferIn) => {
          bufferIn.disconnect();
        };
        sources.push(bufferIn);
        console.log('Creation Completed');
      })
      .catch((err) => {
        console.log('Error: Failed to create audio buffer.');
        console.error(err);
      });
  }

  connectAudioBuffer() {
    let audioBuffer = sources.splice(0, 1);
    // audioBuffer.connect(audiocontext.destination);
    // audioBuffer.connect(this.streamOut);
    audioBuffer.start(1000);
  }

  connectMediaStream() {
    var streamIn = audiocontext.createMediaStreamSource(this.stream); // local stream
    this.streamOut = audiocontext.createMediaStreamDestination(); // output new combined stream

    // bufferIn.connect(streamOut); // connect to new combined stream
    streamIn.connect(this.streamOut); // connect to new combined stream
    // bufferIn.connect(audiocontext.destination); // connect to hardware
    // streamIn.connect(audiocontext.destination);
    // bufferIn.start(); // start buffer input
    // audiocontext.resume(); // start audio context
  }

  featureRun() {
    if (!this.recorder) {
      this.getAudioDevice();
    }

    if (this.state.isRecording) {
      this.stopRecording();
      this.setState({ icon: this.playingIcon });
      this.setState({ text: 'Recording' });
    }

    if (!this.state.isRecording) {
      this.startRecording();
      this.setState({ icon: this.recordIcon });
      this.setState({ text: 'stopped' });
    }
  }

  // buttonclicked(){
  //     // console.log("buttonclicked");
  //     setImage(this.recordIcon);
  // }

  runGame() {
    //runs when we click start streaming button.
    //name the stream for this user and send to antmedia server.
    this.streamOut = this.state.username + this.state.sessionID;
    console.log('stream from this user:', this.streamOut);

    //stream to listen to:
    var index = 0;
    for (var i = 0; i < this.state.userlist; i++) {
      if (this.state.username === this.state.userlist[i])
        if (i === 0) {
          //this is the position we are in. listen to the person prior's stream.
          this.streamIn = this.state.userlist[this.state.userlist.length - 1];
          index = i;
          break;
        } else {
          this.streamIn = this.state.userlist[i - 1];
          index = i;
          break;
        }
    }
    console.log('listening to stream name:', this.streamIn);

    //signal to next players that you are playing so they can begin listening.
    let data = { index: index, sessionID: this.state.sessionID };
    socket.emit('client-stream-out', data);

    //display countdown for player to start playing
    this.countdownTimer();
    //or do this:
    //if(this.countdownTimer()){
    //begin streaming
    // }
  }

  countdownTimer() {
    this.startCountdown = true;
    var myInterval = setInterval(function () {
      if (this.countdown <= 0) {
        clearInterval(myInterval); //clear counter at 0
        //BEGIN RECORDING/STREAMING:
        //return true;
      } else {
        this.countdown -= 1; //decrement counter
      }
      return false;
    }, 1000);
  }

  render() {
    return (
      <div className='jamblock'>
        <h1>JAM</h1>
        {/* <button onClick={buttonclicked()}> */}
        <img
          className='round'
          src={this.state.icon}
          width='200'
          height='200'
          alt=' recording '></img>
        {this.startCountdown ? <h1> {this.countdown} </h1> : <>{}</>}

        {/* </button> */}
        <button onClick={this.featureRun}>
          <img src={this.icon} alt=''></img>
          {this.text}
        </button>

        <button className='rec' onClick={this.getAudioDevice}>
          Choose audio device
        </button>

        <button className='rec' onClick={this.startRecording}>
          Start recording
        </button>

        <button className='rec' onClick={this.stopRecording}>
          Stop recording
        </button>

        <button className='rec' onClick={this.playRecording}>
          Play/pause recording
        </button>
      </div>
    );
  }
}

export default Recorder;
