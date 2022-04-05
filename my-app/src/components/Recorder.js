import React from 'react';
import { saveAs } from "file-saver";

class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isPlaying: false,
        };

        this.chunks = [];
        this.recorder = null;
        this.audio = null;

        // bind functions to instance
        this.onDataAvailable = this.onDataAvailable.bind(this);
        this.onStop = this.onStop.bind(this);
        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
    }

    // event handlers for recorder
    onDataAvailable(e) {
        this.chunks.push(e.data);
    }

    onStop(e) {
        let blob = new Blob(this.chunks, {'type': 'audio/mp3; codecs=opus'})
        let audioURL = URL.createObjectURL(blob);
        this.audio = audioURL;
        
        saveAs(this.audio, "test.mp3");
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {
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
        this.setState({ isRecording: true });
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
        this.setState({ isRecording: false });
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

    render() {
        return (
            <div id="container">
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