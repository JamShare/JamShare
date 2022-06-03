import React from 'react';
import { WebRTCAdaptor } from '../js/webrtc_adaptor.js';
import { getUrlParameter } from "../js/fetch.stream.js";
import { saveAs } from 'file-saver';

function Recorder(props) {
    // state variables
    let state = {
        isRecording: false,
        isPlaying: false,
        icon: '',
        text: 'Jam!',
        userlist: props.userlist,
        sessionID: props.sessionID,
        username: props.guest,

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
        isShow: false,
        delay: .25, // delay timer for delayNode (in seconds)
    };

    // audiocontext variables
    // const recordContext = new AudioContext(); // recorder context records incoming audio from remote stream
    // recordContext.resume(); // enable the record context immediately
    const playbackContext = new AudioContext(); // playback context plays back to user and combines local user audio with audiobuffer recordings to create new stream
    let playerOrder = 0;
    let delayNode = null; // audiobuffersource nodes connect to this, which are delayed when outputting to streamOut
    let stream = null; // this is the local stream
    var remoteSource = null; // source for recorderNode; uses remote stream as its source

    // recorder variables
    let chunks = []; // chunks of audio collected by mediaRecorder, must be reassembled before use
    let recorder = null; // mediaRecorder reading streamOut
    let audio = null; // creates an audiofile based off blob of combined mediaRecorder chunks
    let recordIcon = require('./assets/images/record.png')
    let playingIcon = require('./assets/images/playing.png')

    //antmedia variables
    let webRTCAdaptor = null;
    let streamName = getUrlParameter("streamName");
    let streamOut = null; // combined stream, outputs to next player in the chain

    //room info
    let currentRoom = '' + state.sessionID + '-';

    //Merge variables
    let intervalReturn = null; // use this to clearInterval on the connectAudioBuffers function

    function getPlayerOrder() {
        for (let i = 0; i < state.userlist.length; i++) {
            if (state.username === state.userlist[i]) {
                playerOrder = i + 1;
            }
        }
    }

    function startTheJam() {
        try {
        getPlayerOrder();
        } catch (error) {
            console.log('Error in playerOrder:', error);
        }

        try {
        getAudioDevice();
        } catch(error) {
            console.log('Error in getAudioDevice:', error);
        }
    }

    // this function is called when WebRTCAdaptor is finished intializing, to prevent "WebRTCAdaptor is null" errors
    function initAntMedia() {
        //join the antmedia room with audio only amcu
        webRTCAdaptor.joinRoom(currentRoom, state.streamName, "multitrack", "amcu");
        webRTCAdaptor.play(currentRoom, state.token, ""); 
    };
   

    // event handlers for mediaRecorder
    function onDataAvailable(e) {
        chunks.push(e.data);
    }

    function onStop(e) {
        console.log("Recording stopped successfully.");
        let blob = new Blob(chunks, { 'type': 'audio/wav; codecs=opus' })
        let audioURL = URL.createObjectURL(blob);
        audio = new Audio(audioURL);
        saveAs(blob, "audioTest.wav")
    }
    //

    // starts mediaRecorder recording process (NOT recorderNode)
    function startRecording() {
        if (!recorder) {
            return;
        }
        if (state.isRecording) {
            return;
        }
        recorder.start();
        state.isRecording = true;
        console.log("Recording started successfully.");
        return;
    }

    // stops mediaRecorder recording process (NOT recorderNode)
    function stopRecording() {
        if (!recorder) {
            return;
        }
        if (!state.isRecording) {
            return;
        }
        recorder.stop();
        state.isRecording = false;
        return;
    }

    // this plays assembled audio from mediaRecorder.onstop
    function playRecording() {
        if (!audio) {
            return;
        }
        audio.play();
        return;
    }

    //remotely play each audio stream
    function playAudio(obj) {
        let room = currentRoom;
        let trackOrder = obj.trackId.slice(-1);

        console.log("new stream available with id: "
            + obj.streamId + "on the room:" + room);

        var index;
        if (obj.track.kind === "audio") {
            index = obj.track.id.replace("ARDAMSa", "");
        }

        if (index === room) {
            return;
        }

        // create audio source from previous players' remote stream
        let settings = obj.track.getSettings();
        let latency = settings.latency();
        console.log("Latency: ", latency);
        remoteSource = playbackContext.createMediaStreamTrackSource(obj.track);
        remoteSource.connect(playbackContext.destination);
        remoteSource.connect(delayNode);
        console.log("Recorder.js: Connected remote stream to playbackContext.")
        playbackContext.resume();

        // record audio if you're the last player
        if (state.username === state.userlist.at(-1)) {
            recorder = new MediaRecorder(streamOut.stream);

            //initialize event handlers for recorder
            recorder.ondataavailable = onDataAvailable;
            recorder.onstop = onStop;
        }
    }

    async function getAudioDevice() {
        // grab local stream
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
            console.error(err);
            stream = null;
        }
        connectMediaStreams();
        return;
    }

    function connectMediaStreams() {
        var streamIn = playbackContext.createMediaStreamSource(stream); // local stream
        delayNode = playbackContext.createDelay(10); // create delayNode with maxDelay of 10s
        delayNode.delayTime.setValueAtTime(playbackContext.outputLatency, playbackContext.currentTime); // set delayTime of delayNode
        streamOut = playbackContext.createMediaStreamDestination(); // output combined stream of localStream and audioBufferSourceNodes, send to next player
        streamIn.connect(streamOut); // connect localStream to new combined stream
        delayNode.connect(streamOut); // connect delayNode to new combined stream
        webRTCAdaptor = initiateWebrtc(streamOut.stream); // initialize the webRTC adaptor
    }

    //publish the local stream
    function publish(token) {
        let publishStreamName = '' + currentRoom + '-' + playerOrder;
        webRTCAdaptor.publish(publishStreamName, token, "", "", streamName, currentRoom, "{someKey:somveValue}", playerOrder);
    }

    function initiateWebrtc(streamOut) {
        return new WebRTCAdaptor({
            stream_out: streamOut,
            websocket_url: state.websocketURL,
            mediaConstraints: state.mediaConstraints,
            peerconnection_config: state.pc_config,
            sdp_constraints: state.sdpConstraints,
            localVideoId: "local_audio",
            isPlayMode: true,
            debug: true,
            bandwidth: 900,
            callback: function (info, obj) {
                if (info === "initialized") {
                    console.log("initialized");
                    initAntMedia();
                } else if (info === "publish_started") {
                    //stream is being published
                    console.log("publish started");
                    alert("publish started");
                } else if (info === "publish_finished") {
                    //stream is being finished
                    console.log("publish finished");
                } else if (info === "trackList") {
                    console.log("trackList", obj.streamId);
                } else if (info === "joinedTheRoom") {
                    console.log("Object ID", obj.streamId);
                    publish(obj.streamId, state.token);
                } else if (info === "closed") {
                    if (typeof obj != "undefined") {
                        console.log("Connecton closed: " + JSON.stringify(obj));
                    }
                } else if (info === "streamInformation") {

                } else if (info === "newStreamAvailable") {
                    // get previous players stream
                    let tempOrder = obj.trackId.slice(-1);
                    if (parseInt(tempOrder, 10) === parseInt(playerOrder-1, 10)) {
                        // console.log("Playing", obj.trackId);
                        playAudio(obj);
                    }
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

    return (
        <div class="jamblock">
            <button onClick={startTheJam}>
                Start The Jam!
            </button>

            <button onClick={startRecording}>
                Start recording
            </button>

            <button onClick={stopRecording}>
                Stop recording
            </button>
            <button onClick={playRecording}>
                Play recording
            </button>
            <div>
                Local Audio
                <audio id="local_audio" autoPlay muted playsInline controls={true} />
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

export default Recorder;