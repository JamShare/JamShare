import React from 'react';
import image1 from './assets/images/playing.png';
// audioworklet workaround?
const audioWorkletURL = new URL("./RecorderProcessor.js", import.meta.url);

// recorder context records incoming audio; playback context plays it back to the user and combines local user audio 
// with the recording(s) in order to create a new stream
const recordContext = new AudioContext();
var recorderNode = null;

recordContext.audioWorklet.addModule(audioWorkletURL.href)
.then(() => {
    recorderNode = new AudioWorkletNode(recordContext, 'recorder-worklet');
})
const playbackContext = new AudioContext();

var sources = [];

class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isPlaying: false,
            icon: '',
            text: 'Jam!',
        };

        this.intervalReturn = null;
        this.streamOut = null;
        this.stream = null;
        this.recorderSource = null;
        this.audio = null;
        this.recordIcon = require('./assets/images/record.png')
        this.playingIcon = require('./assets/images/playing.png')

        // bind functions to instance
        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.createAudioBufferSource = this.createAudioBufferSource.bind(this);
        this.connectMediaStreams = this.connectMediaStreams.bind(this);
        this.connectAudioBuffer = this.connectAudioBuffer.bind(this);
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {
        this.stream = null;
        try {
            this.stream = await navigator.mediaDevices
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
            this.stream = null;
        }
        this.recorderSource = null;
        if (this.stream) {
            this.recorderSource = recordContext.createMediaStreamSource(this.stream);
            this.recorderSource.connect(recorderNode);
            recorderNode.connect(recordContext.destination);
            recorderNode.port.onmessage = (e) => {
                if (e.data.eventType === 'data') {
                    const audioData = e.data.audioBuffer;
                    this.createAudioBufferSource(audioData);
                }
                if (e.data.eventType === 'stop') {
                    // recording stopped
                }
            }
            recordContext.resume();

            console.log("Recording device acquired successfully.");
            }
        return;
    }

    startRecording() {
        if (!this.recorderSource) {
            return;
        }
        if (this.state.isRecording) {
            return;
        }
        // this.recorder.start(5000);
        recorderNode.parameters.get('isRecording').setValueAtTime(1, recordContext.currentTime);
        this.setState({ isRecording: true});
        console.log("Recording started successfully.");
        return;
    }

    stopRecording() {
        if (!this.recorderSource) {
            return;
        }
        if (!this.state.isRecording) {
            return;
        }
        recorderNode.parameters.get('isRecording').setValueAtTime(0, recordContext.currentTime);
        this.setState({ isRecording: false});
        return;
    }

    playRecording() {
        this.connectMediaStreams();
        // audioBuffer.connect(playbackContext.destination);
        this.connectAudioBuffer(); // connect an audio buffer to start
        this.intervalReturn = setInterval(this.connectAudioBuffer, 1000); // connect an audio buffer every 1000ms
        let audioTag = document.getElementById("audio");
        audioTag.srcObject = this.streamOut.stream;
        playbackContext.resume();
        console.log("playback started.");
    }

    // takes recorded audio data and creates an audio source from it
    createAudioBufferSource(audioData) {
        console.log("Creation Started");
        // createBuffer(channels, seconds, sampleRate)
        let buffer = playbackContext.createBuffer(1, playbackContext.sampleRate*1, playbackContext.sampleRate); 
        buffer.copyToChannel(audioData, 0);
        let bufferIn = playbackContext.createBufferSource();
        bufferIn.buffer = buffer;
        // bufferIn.onended = this.connectAudioBuffer();
        sources.push(bufferIn);
        console.log("Creation Completed");
    }

    connectAudioBuffer() { // add delay parameter to control when audiobuffer plays back? (in ms)
        console.log("loading audio buffer");
        let audioBuffer = sources.splice(0, 1)[0];
        if (audioBuffer) {
            audioBuffer.connect(playbackContext.destination);
            audioBuffer.connect(this.streamOut);
            audioBuffer.start();
            console.log("audio buffer connected");
        } else {
            console.error("No audio buffer sources found; cannot connect to playback context.");
        }
    }

    connectMediaStreams() {
        var streamIn = playbackContext.createMediaStreamSource(this.stream); // local stream
        this.streamOut = playbackContext.createMediaStreamDestination(); // output new combined stream
        streamIn.connect(this.streamOut); // connect to new combined stream
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
            <div class="jamblock">
                <h1>JAM</h1>
                <img class="rounded" src={image1} width="250" height="250"alt=" recording "></img>

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
                <audio id="audio" controls></audio>
            </div>
        );
    }
}

export default Recorder;