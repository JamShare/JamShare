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

            //the following constraints allow the best for music
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
            //URL to antmedia server
            websocketURL: "wss://berryhousehold.ddns.net:5443/WebRTCAppEE/websocket",
            isShow: false
        };

        this.recorder = null;
        this.audio = null;
        this.recordIcon = require('./assets/images/record.png')
        this.playingIcon = require('./assets/images/playing.png')

        //bind functions to instance
        this.getAudioDevicePlayer = this.getAudioDevicePlayer.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.createRemoteAudio = this.createRemoteAudio.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.publish = this.publish.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.addTrackList = this.addTrackList.bind(this);
        this.addVideoTrack = this.addVideoTrack.bind(this);
        this.enableTrack = this.enableTrack.bind(this);
        this.startPlaying = this.startPlaying.bind(this);
        this.getTracks = this.getTracks.bind(this);

        //antmedia variables
        this.streamName = getUrlParameter("streamName");
        this.streamId = null;
        //audio tracks
        this.tracks = [];
        //tracks to disable
        this.disabledTracks = [];

        //socketio
        this.socket = io.connect(SERVER);
        this.socket.on("player-connected-server", (order) => {

            this.playerOrder = order;
            this.setState({
                streamName: '' + this.playerOrder,
            });
            console.log("Player order", this.playerOrder);
        });
    }

    //remotely play each audio stream
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

        //create the audio element
        var video = document.getElementById("remoteVideo" + index);

        if (video == null) {
            this.createRemoteAudio(index);
            video = document.getElementById("remoteVideo" + index);
            video.srcObject = new MediaStream();
        }

        //audio context delay code
        var audioCtx = new AudioContext();
        const delay = new DelayNode(audioCtx, {
            delayTime: 1,
        });

        var source = audioCtx.createMediaStreamTrackSource(obj.track);
        source.connect(delay);
        var dest = audioCtx.createMediaStreamDestination();
        delay.connect(dest);
        video.srcObject.addTrack(dest.stream.getAudioTracks()[0]);
    }

    //get the tracks in the antmedia room
    getTracks() {
        this.streamId = "room1";
        this.webRTCAdaptor.getTracks("room1", this.token);
    }

    //add tracks to the antmedia room
    addTrackList(streamId, trackList) {
        var addVideoTrack = this.addVideoTrack;
        addVideoTrack(streamId);
        trackList.forEach(function (trackId) {
            addVideoTrack(trackId);
        });
    }

    //play the enabled antmedia room tracks
    startPlaying() {
        var enabledTracks = [];

        //tracks to play if we are player 2
        if (this.playerOrder === 2) {
            console.log("Player Order: ", this.playerOrder);
            this.tracks.forEach(function (trackId) {
                if (trackId === "1") {
                    enabledTracks.push("1");
                }
                else {
                    enabledTracks.push(("!") + trackId);
                }
            });
        }
        //tracks to play if we are player 3 
        else if (this.playerOrder === 3) {
            console.log("Player Order: ", this.playerOrder);
            this.tracks.forEach(function (trackId) {
                if (trackId === "1") {
                    enabledTracks.push("1");
                }
                else if (trackId === "2") {
                    enabledTracks.push("2");
                }
                else {
                    enabledTracks.push(("!") + trackId);
                }
            });
        }
        //if not player 2 or 3 mute all tracks
        else {
            this.tracks.forEach(function (trackId) {
                enabledTracks.push(("!") + trackId);
            });
        }

        //play the room tracks
        this.streamId = "room1";
        this.webRTCAdaptor.play("room1", this.token, "", enabledTracks);
    }

    //add antmedia stream to track list
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

    //enable checked track
    enableTrack(trackId) {
        var checkBox = document.getElementById("cbx" + trackId);
        this.webRTCAdaptor.enableTrack("room1", trackId, checkBox.checked);
    }

    //create antmedia remote audio player
    createRemoteAudio(streamId) {
        var player = document.createElement("div");
        player.className = "col-sm-3";
        player.id = "player" + streamId;
        player.innerHTML = '<video id="remoteVideo' + streamId + '"controls autoplay playsinline></video>' + streamId;
        document.getElementById("players").appendChild(player);
    }

    //connect webrtc adaptor
    getAudioDevicePlayer() {
        //get player order from node server
        this.socket.emit("player-connected", this.socket.id);
        console.log("id", this.socket.id);
        //initiate adaptor
        this.webRTCAdaptor = this.initiateWebrtc();
    }

    //join the antmedia room with audio only amcu
    joinRoom() {
        this.webRTCAdaptor.joinRoom("room1", this.state.streamName, "multitrack", "amcu");
    }

    //publish the local stream
    publish(publishStreamId, token) {
        console.log("Publishing");
        this.webRTCAdaptor.publish(publishStreamId, token, "", "", this.streamName, "room1", "{someKey:somveValue}");
    }

    onStartPlaying() {
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
                } else if (info === "publish_finished") {
                    //stream is being finished
                    console.log("publish finished");
                } else if (info == "trackList") {
                    console.log("trackList", obj.streamId);
                    addTrackList(obj.streamId, obj.trackList);
                } else if (info === "joinedTheRoom") {
                    var room = obj.ATTR_ROOM_NAME;
                    console.log("Object", obj)
                    publish(obj.streamId, this.token);
                } else if (info === "closed") {
                    if (typeof obj != "undefined") {
                        console.log("Connecton closed: "
                            + JSON.stringify(obj));
                    }
                } else if (info === "streamInformation") {

                } else if (info === "newStreamAvailable") {
                    playAudio(obj);
                    this.tracks.forEach(function (trackId) {
                        if (parseInt(trackId, 10) > parseInt(this.playerOrder, 10)) {
                            this.enableTrack(trackId, false);
                        }
                    });
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
                    1. Connect websocket
                </button>

                <button onClick={this.joinRoom}>
                    2. Join Room
                </button>

                <button onClick={this.getTracks}>
                    3. Get Tracks
                </button>

                <button onClick={this.startPlaying}>
                    4. Start Playing
                </button>

                <div>
                    Local Audio
                    <audio id="local_audio" autoPlay muted playsInline controls={true} />

                    Remote Audio
                    <audio id="remote_audio" autoPlay playsInline controls={true} />
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