import React from 'react';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';

class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            blob: null,
            recorder: null,
            audio: null,
            isRecording: false,
            isPlaying: false,
        };

        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.saveBlob = this.saveBlob.bind(this);
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {
        var stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
        } catch (err) {
            console.error(err)
            stream = null;
        }
        
        var recorder = null;
        if (stream) {
            recorder = RecordRTC(stream, { // settings
                type: 'audio',
            });
        }
        this.setState({recorder: recorder});   
        console.log("Recording device acquired successfully.");
        return;
    }

    startRecording() {
        if (this.recorder) {
            return;
        }
        if (this.state.isRecording) {
            return;
        }
        this.state.recorder.startRecording();
        this.setState({ isRecording: true});
        console.log("Recording started successfully.");
        return;
    }

    stopRecording() {
        if (!this.state.recorder) {
            return;
        }
        if (!this.state.isRecording) {
            return;
        }
        this.state.recorder.stopRecording(() => { 
            this.setState({blob : this.state.recorder.getBlob()})   
            this.setState({audio : new Audio(URL.createObjectURL(this.state.recorder.getBlob()))});
            console.log(this.state.audio)
        });
        this.setState({ isRecording: false});
        console.log("Recording stopped successfully.");
        return;
    }

    playRecording() {
        if (!this.state.recorder) {
            return;
        }

        if (!this.state.isPlaying) {
            this.state.audio.pause();
        } else {
            this.state.audio.play();
        }

        this.setState({ isPlaying: this.state.isPlaying });
        console.log("Recording played/stopped successfully.");
        return;
    }

    saveBlob() {
        invokeSaveAsDialog(this.state.blob, "blob.mp3");
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
            <button onClick={this.saveBlob}>
                Save Recording
            </button>
            </div>
        );
    }
}

export default Recorder;