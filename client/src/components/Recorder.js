import React from 'react';
const io = require('socket.io-client');

const SERVER = "http://localhost:3001";

class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isPlaying: false,
            icon: '',
            text: 'Jam!',
        };

        //this.chunks = [];
        this.recorder = null;
        this.audio = null;
        this.recordIcon = require('./assets/images/record.png')
        this.playingIcon = require('./assets/images/playing.png')

        // bind functions to instance
        this.onDataAvailable = this.onDataAvailable.bind(this);
        this.onStop = this.onStop.bind(this);
        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);

        this.socket = io.connect(SERVER);

        this.socket.on("audio-blob", (chunks) => {
            console.log("Audio blob recieved.");
            let blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' })
            let audioURL = URL.createObjectURL(blob);
            this.audio = new Audio(audioURL);
        });
    }

    // event handlers for recorder
    onDataAvailable(e) {
        //this.chunks.push(e.data);
        this.socket.emit("audio-stream", e.data);
    }

    onStop(e) {
        console.log("Recording stopped successfully.");
        this.socket.emit("audio-stream-end");
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {

        async function playAudio() {
            try {
                const constraints = {
                    audio: {
                        echoCancellation: false,
                        autoGainControl: false,
                        noiseSuppression: false,
                        latency: 0
                    } 
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const audioElement = document.querySelector('audio#localAudio');
                audioElement.srcObject = stream;
            } catch (error) {
                console.error('Error opening audio .', error);
            }
        }
        playAudio();
        return;
    }

    startRecording() {
        if (!this.recorder) {
            return;
        }
        if (this.state.isRecording) {
            return;
        }
        this.recorder.start();
        this.setState({ isRecording: true});
        console.log("Recording started successfully.");
        this.socket.emit("audio-stream-start");
        return;
    }

    stopRecording() {
        if (!this.recorder) {
            return;
        }
        if (!this.state.isRecording) {
            return;
        }
        this.recorder.stop();
        this.setState({ isRecording: false});
        return;
    }

    playRecording() {
        if (!this.audio) {
            return;
        }
        this.audio.play();
        return;
    }

    featureRun() {
        if (!this.recorder) {
            this.getAudioDevice();
        }

        if (this.state.isRecording) {
            this.stopRecording();
            this.setState({icon: this.playingIcon});
            this.setState({text: 'Recording'});
        }   

        if (!this.state.isRecording) {
            this.startRecording();
            this.setState({icon: this.recordIcon});
            this.setState({text: 'stopped'});
        }

    }

    render() {
        return (
            <div id="container" >
            <body>
                <audio id="localAudio" autoplay playsinline controls="false" />
            </body>
            <button onClick={this.featureRun}>
                <image src={this.icon} alt=""></image>
                {this.text}
            </button>
            <button onClick={this.getAudioDevice}>
                Choose audio device
            </button>
            <button onClick={this.startRecording}>
                Start recording
            </button>
            <button onClick={this.stopRecording}>
                Stop recording
            </button>
            <button onClick={this.playRecording}>
                Play/pause recording
            </button>
            </div>
        );
    }
}

export default Recorder;