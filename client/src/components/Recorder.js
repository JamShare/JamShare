import React from 'react';
import image1 from './assets/images/playing.png'
import { WebRTCAdaptor } from '../js/webrtc_adaptor';
import { getUrlParameter } from "../js/fetch.stream.js"
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
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                    latency: 0
                }
            },
            streamName: getUrlParameter("streamName"),
            token: getUrlParameter("token"),
            pc_config: {
                'iceServers': [{
                    'urls': 'stun:stun.l.google.com:19302'
                }],
                sdpSemantics: 'unified-plan'
            },
            sdpConstraints: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            },
            websocketURL: "wss://berryhousehold.ddns.net:5443/WebRTCAppEE/websocket",
            isShow: false
        };

        //this.webRTCAdaptor = this.initiateWebrtc();

        //this.chunks = [];
        this.recorder = null;
        this.audio = null;
        this.recordIcon = require('./assets/images/record.png')
        this.playingIcon = require('./assets/images/playing.png')

        // bind functions to instance
        this.onDataAvailable = this.onDataAvailable.bind(this);
        this.onStop = this.onStop.bind(this);
        this.getAudioDevice = this.getAudioDevice.bind(this);
        this.getAudioDevicePlayer = this.getAudioDevicePlayer.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.createRemoteAudio = this.createRemoteAudio.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.publish = this.publish.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.addTrackList = this.addTrackList.bind(this);
        this.addVideoTrack = this.addVideoTrack.bind(this);
        this.enableTrack = this.enableTrack.bind(this);
        this.startPlaying = this.startPlaying.bind(this);

        this.streamName = getUrlParameter("streamName");
        this.streamId = null;
        this.tracks = [];

        this.socket = io.connect(SERVER);

        this.socket.on("player-connected-server", (order) => {

            this.playerOrder = order;
            console.log("Player order", this.playerOrder);
        });

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

    componentDidMount() {
        //this.webRTCAdaptor = this.initiateWebrtc(false);
        this.setState({
            isShow: true
        });
    }

    // asks for permission to use audio device from user
    // if declined or error, returns a null stream
    async getAudioDevice() {

        

        let audiox = document.querySelector("#local_audio");

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
            audiox.srcObject = stream;

            this.recorder = new MediaRecorder(stream)

            // initialize event handlers for recorder
            this.recorder.ondataavailable = this.onDataAvailable;
            this.recorder.onstop = this.onStop;


            //this.webRTCAdaptor = this.initiateWebrtc();
            /*
            this.setState({
                isShow: true
            });
            */

            console.log("Recording device acquired successfully.");
        }
        return;
    }

    playAudio(obj) {
        var room = "room1"
        console.log("new stream available with id: "
            + obj.streamId + "on the room:" + room);

        var index;
        if (obj.track.kind == "video") {
            index = obj.track.id.replace("ARDAMSv", "");
        }
        else if (obj.track.kind == "audio") {
            index = obj.track.id.replace("ARDAMSa", "");
        }

        if (index == room) {
            return;
        }

        var video = document.getElementById("remoteVideo" + index);

        if (video == null) {
            this.createRemoteAudio(index);
            video = document.getElementById("remoteVideo" + index);
            video.srcObject = new MediaStream();
        }
        //video.srcObject.addTrack(obj.track)
        //console.log(obj.track);
        
        var audioCtx = new AudioContext();
        const delay = new DelayNode(audioCtx, {
            delayTime: 0.5,
        });

        var source = audioCtx.createMediaStreamTrackSource(obj.track);
        source.connect(delay);
        var dest = audioCtx.createMediaStreamDestination();
        delay.connect(dest);
        video.srcObject.addTrack(dest.stream.getAudioTracks()[0]);
        


        /*
        obj.track.onended = event => {
            video.srcObject.removeTrack(event.currentTarget);
            if (video.srcObject.getTracks().length == 0) {
                removeRemoteVideo(index);
            }
        };
        */
    }

    getTracks() {
        this.streamId = "room1";
        this.webRTCAdaptor.getTracks("room1", this.token);
        
    }

    addTrackList(streamId, trackList) {
        var addVideoTrack = this.addVideoTrack;
        addVideoTrack(streamId);
        trackList.forEach(function (trackId) {
            addVideoTrack(trackId);
        });
    }

    startPlaying() {
        var enabledTracks = [];
        this.tracks.forEach(function (trackId) {
            var checkBox = document.getElementById("cbx" + trackId);
            enabledTracks.push((checkBox.checked ? "" : "!") + trackId);
        });

        this.streamId = "room1";
        this.webRTCAdaptor.play("room1", this.token, "", enabledTracks);
    }

    addVideoTrack(trackId) {
        var enableTrack = this.enableTrack;
        this.tracks.push(trackId);

        var trackUl = document.getElementById("trackList");
        var li = document.createElement("li");
        var checkbox = document.createElement("input");
        var label = document.createElement("label");
        var description = document.createTextNode(trackId);
        checkbox.type = "checkbox";
        checkbox.name = trackId;
        checkbox.id = "cbx" + trackId;
        checkbox.checked = false;
        checkbox.onclick = function () { enableTrack(trackId); };
        label.appendChild(checkbox);
        label.appendChild(description);
        li.appendChild(label);
        trackUl.appendChild(li);
    }

    enableTrack(trackId) {
        var checkBox = document.getElementById("cbx" + trackId);
        this.webRTCAdaptor.enableTrack("room1", trackId, checkBox.checked);
    }

    createRemoteAudio(streamId) {
        var player = document.createElement("div");
        player.className = "col-sm-3";
        player.id = "player" + streamId;
        player.innerHTML = '<video id="remoteVideo' + streamId + '"controls autoplay playsinline></video>' + streamId;
        document.getElementById("players").appendChild(player);
    }

    getAudioDevicePlayer() {
        this.socket.emit("player-connected", this.socket.id);
        console.log("id", this.socket.id);
        this.webRTCAdaptor = this.initiateWebrtc();
    }

    streamChangeHandler = ({ target: { value } }) => {
        console.log("Current value:", value);
        this.setState({ streamName: value });
    }

    joinRoom() {
        this.webRTCAdaptor.joinRoom("room1", this.state.streamName, "multitrack");
    }

    publish(publishStreamId, token) {
        console.log("Publishing");
        this.webRTCAdaptor.publish(publishStreamId, token, "", "", this.streamName, "room1", "{someKey:somveValue}");
    }

    onStartPublishing(name) {
        var source = this.webRTCAdaptor.audioContext.createMediaStreamSource();

        var delay = this.webRTCAdaptor.audioContext.createDelay(1000);
        this.delay.delayTime = 1;

        source.connect(delay);

        console.log("playMode", this.webRTCAdaptor.isPlayMode);
        this.webRTCAdaptor.joinRoom("room1", this.state.streamName, "multitrack");
        this.webRTCAdaptor.publish(this.state.streamName, this.state.token, "", "", "multitrack", "room1");
        console.log("Current streamname:", this.state.streamName);
    }

    onStartPlaying(name) {
        //this.webRTCAdaptor = this.initiateWebrtc(true);
        //this.webRTCAdaptor.isPlayMode = true;
        //console.log("playMode", this.webRTCAdaptor.isPlayMode);
        //this.webRTCAdaptor.play(this.state.streamName, this.state.token);
        this.startPlaying();
    }

    initiateWebrtc() {
        var publish = this.publish;
        var addTrackList = this.addTrackList;
        var playAudio = this.playAudio;

        return new WebRTCAdaptor({
            websocket_url: this.state.websocketURL,
            mediaConstraints: this.state.mediaConstraints,
            peerconnection_config: this.state.pc_config,
            sdp_constraints: this.state.sdpConstraints,
            localVideoId: "local_audio",
            isPlayMode: true,
            debug: true,
            bandwidth: 900,
            callback: function (info, obj) {
                if (info === "initialized") {
                    console.log("initialized");

                } else if (info === "publish_started") {
                    //stream is being published
                    console.log("publish started");
                    alert("publish started");
                    /*
                    thiz.setState({
                        isShow: false
                    });
                    */

                } else if (info === "publish_finished") {
                    //stream is being finished
                    console.log("publish finished");
                    /*
                    thiz.setState({
                        isShow: true
                    });
                    */

                } else if (info == "trackList") {
                    console.log("trackList", obj.streamId);
                    addTrackList(obj.streamId, obj.trackList);
                } else if (info === "joinedTheRoom") {
                    var room = obj.ATTR_ROOM_NAME;
                    //roomOfStream[obj.streamId] = room;
                    //console.log("joined the room: "
                    //    + roomOfStream[obj.streamId]);
                    console.log("Object", obj)

                    //publishStreamId = obj.streamId;

                    //streamsList = obj.streams;
                    //console.log(streamsList);

                    /*
                    if (playOnly) {
                        join_publish_button.disabled = true;
                        stop_publish_button.disabled = false;
                        isCameraOff = true;
                        handleCameraButtons();
                        webRTCAdaptor.play(roomNameBox.value, token, roomNameBox.value, streamsList);
                    }
                    
                    else {
                        publish(obj.streamId, token);
                    }
                    */
                    publish(obj.streamId, this.token);
                    /*
                    roomTimerId = setInterval(() => {
                        webRTCAdaptor.getRoomInfo(roomNameBox.value, publishStreamId);
                    }, 5000);
                    */
                } else if (info === "closed") {
                    //console.log("Connection closed");
                    if (typeof obj != "undefined") {
                        console.log("Connecton closed: "
                            + JSON.stringify(obj));
                    }
                } else if (info === "streamInformation") {


                } else if (info === "newStreamAvailable") {
                    playAudio(obj);
                } else if (info === "ice_connection_state_changed") {
                    console.log("iceConnectionState Changed: ", JSON.stringify(obj));
                } else if (info === "updated_stats") {
                    //obj is the PeerStats which has fields
                    //averageIncomingBitrate - kbits/sec
                    //currentIncomingBitrate - kbits/sec
                    //packetsLost - total number of packet lost
                    //fractionLost - fraction of packet lost
                    console.log("Average incoming kbits/sec: " + obj.averageIncomingBitrate
                        + " Current incoming kbits/sec: " + obj.currentIncomingBitrate
                        + " packetLost: " + obj.packetsLost
                        + " fractionLost: " + obj.fractionLost
                        + " audio level: " + obj.audioLevel);

                } else if (info === "data_received") {
                    console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
                } else if (info === "bitrateMeasurement") {
                    console.log(info + " notification received");

                    console.log(obj);
                } else {
                    console.log(info + " notification received");
                }
            },
            callbackError: function (error) {
                //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError

                console.log("error callback: " + JSON.stringify(error));
                alert(JSON.stringify(error));
            }
        });
    }

    startRecording() {
        this.getTracks();
        /*
        if (!this.recorder) {
            return;
        }
        if (this.state.isRecording) {
            return;
        }
        this.recorder.start();
        this.setState({ isRecording: true });
        console.log("Recording started successfully.");
        this.socket.emit("audio-stream-start");
        return;
        */
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
            this.setState({ icon: this.playingIcon });
            this.setState({ text: 'Recording' });
        }

        if (!this.state.isRecording) {
            this.startRecording();
            this.setState({ icon: this.recordIcon });
            this.setState({ text: 'stopped' });
        }
    }

    render() {
        const { streamName, isShow } = this.state;

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

                <button onClick={this.getAudioDevicePlayer}>
                    Choose audio device
                </button>

                <button onClick={this.joinRoom}>
                    Join Room
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
                    <input type="text" onChange={this.streamChangeHandler} />
                    {

                        isShow ? (
                            <button
                                onClick={this.onStartPublishing.bind(this, streamName)}
                                className="btn btn-primary"
                                id="start_play_button"> Start
                                Publish
                            </button>
                        ) : null

                    }
                    Remote Audio
                    <audio id="remote_audio" autoPlay playsInline controls={true} />
                    <input type="text" onChange={this.streamChangeHandler} />
                    {
                        isShow ? (
                            <button
                                onClick={this.onStartPlaying.bind(this, streamName)}
                                className="btn btn-primary"
                                id="start_play_button"> Start
                                Playing
                            </button>
                        ) : null
                    }


                </div>
                <div class="container">
                    <ul id="trackList" name="trackList">
                    </ul>
                </div>
                <div id="players">
                </div>


            </div>
        );
    }
}

export default Recorder;