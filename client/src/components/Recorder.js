import React from 'react';
import image1 from './assets/images/playing.png'
import WebRTCAdaptor from '../js/webrtc_adaptor';
const io = require('socket.io-client');


//const SERVER = "http://localhost:3001";
const SERVER = "https://berryhousehold.ddns.net:3001";


class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isPlaying: false,
            icon: '',
            text: 'Jam!',

            mediaConstraints: {
                video: false,
                audio: true
            },
            streamName: 'stream1',
            token: '',
            pc_config: {
                'iceServers': [{
                    'urls': 'stun:stun.l.google.com:19302'
                }]
            },
            sdpConstraints: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            },
            websocketURL: "wss://berryhousehold.ddns.net:5443/WebRTCAppEE/websocket",
            isShow: false
        };

        this.webRTCAdaptor = null;   

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
            
            <div class="jamblock">

                {
                /*
                <h1>JAM</h1>
                <img class="rounded" src={image1} width="250" height="250"alt=" recording "></img>

                <button onClick={this.featureRun}>
                    <image src={this.icon} alt=""></image>
                    {this.text}
                </button>
                */
                }

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

                <div>
                    Local Audio
                    <audio id="local_audio" autoPlay muted playsInline controls={true} />
                    Remote Audio
                    <audio id="remote_audio" autoPlay playsInline controls={true} />

                    <input type="text" onChange={this.streamChangeHandler} />
                    {
                        /*
                        isShow ? (
                            <button
                                onClick={this.onStartPublishing.bind(this, streamName)}
                                className="btn btn-primary"
                                id="start_play_button"> Start
                                Publish
                            </button>
                        ) : null
                        */
                    }
                </div>
                
            </div>
        );
    }
}

export default Recorder;