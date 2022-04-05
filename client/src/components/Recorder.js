import React from 'react';
// import socket
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

        this.chunks = [];
        this.recorder = null;
        this.audio = null;
        this.recordIcon = require('./assets/images/record.png')
        this.playingIcon = require('./assets/images/playing.png')
        // this.icon = this.playingIcon
        // bind functions to instance
        this.onDataAvailable = this.onDataAvailable.bind(this);
        this.onStop = this.onStop.bind(this);
        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);

        this.socket = io.connect(SERVER);
    }

    // event handlers for recorder
    onDataAvailable(e) {
        this.chunks.push(e.data);

        //socket.emit('audio-stream', e.data);
    }

    onStop(e) {
        let blob = new Blob(this.chunks, {'type': 'audio/ogg; codecs=opus'})
        let audioURL = URL.createObjectURL(blob);
        this.audio = new Audio(audioURL);
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {
        this.socket.emit("audio-stream-end");

        var stream = null;
        try {
            stream = await navigator.mediaDevices
                .getUserMedia({
                    audio: {
                        echoCancellation: false,
                        autoGainControl: false,
                        noiseSuppression: false,
                        latency: 0
                    }
                });
        } catch (err) {
            console.error(err)
            stream = null;
        }
        
        this.recorder = null;
        if (stream) {
            this.recorder = new MediaRecorder(stream)
        
            // initialize event handlers for recorder
            this.recorder.ondataavailable = this.onDataAvailable;
            this.recorder.onstop = this.onStop;

            console.log("Recording device acquired successfully.");
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
        this.recorder.start();
        this.setState({ isRecording: true});
        console.log("Recording started successfully.");
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
        console.log("Recording stopped successfully.");

        

        return;
    }

    playRecording() {
        if (!this.recorder) {
            return;
        }

        if (this.state.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }

        this.setState({ isPlaying: !this.state.isPlaying });
        console.log("Recording played/stopped successfully.");
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