import React from 'react';
import { WebRTCAdaptor } from '../js/webrtc_adaptor.js';
import { getUrlParameter } from "../js/fetch.stream.js";
import { saveAs } from 'file-saver';
import Metronome from './metronome.js';

function Recorder(props) {
    //audio context sourcesuserlistsessionId
    // recorder context records incoming audio; playback context plays it back to the user and combines local user audio 
    // with the recording(s) in order to create a new stream
    const recordContext = new AudioContext();
    const playbackContext = new AudioContext();
    let playerOrder = 0;

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
        delay: .25,
    };
    let sources = [];
    let chunks = [];
    let recorderNode = null;
    recordContext.audioWorklet.addModule("RecorderProcessor.js")
    .then(() => {
        recorderNode = new AudioWorkletNode(recordContext, 'recorder-worklet');
        recorderNode.connect(recordContext.destination);
        recorderNode.port.onmessage = (e) => {
            if (e.data.eventType === 'data') {
                const audioData = e.data.audioBuffer;
                createAudioBufferSource(audioData);
            }
            if (e.data.eventType === 'stop') {
                // recording stopped
            }
        }
    });
    let delayNode = null;
    let metronome = null;
    let recorder = null;
    let audio = null;
    let recordIcon = require('./assets/images/record.png')
    let playingIcon = require('./assets/images/playing.png')

    //antmedia variables
    let webRTCAdaptor = null;
    let streamName = getUrlParameter("streamName");
    let streamOut = null;

    //audio tracks
    let tracks = [];

    //room info
    let currentRoom = '' + state.sessionID + '-';

    //Merge variables
    let stream = null;
    let recorderSource = null;
    let intervalReturn = null;

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

        let webRTCPromise = new Promise(initiateWebRTC);

        webRTCPromise
        .then((text) => {
            console.log(text);
            joinRoom();
            getTracks();
            startPlaying();
        })
    }

    function initiateWebRTC(resolve, reject) {
        try {
            webRTCAdaptor = initiateWebrtc(streamOut);
            resolve('WebRTCAdaptor acquisition successful.');
            return;
        } catch (error) {
            reject('WebRTCAdaptor acquisition failed.');
        }
        return;
    }

    // event handlers for recorder
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

    function playRecording() {
        if (!audio) {
            return;
        }
        audio.play();
        return;
    }


    //remotely play each audio stream
    function playAudio(obj, trackPlayerId) {
        tracks.push(obj.trackId);
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

        //create the audio element
        var audioElement = document.getElementById("remoteVideo" + index);

        if (audioElement == null) {
            createRemoteAudio(index, trackOrder);
            audioElement = document.getElementById("remoteVideo" + index);
            audioElement.srcObject = new MediaStream();
        }

        // let timeToDelay = 0;

        // console.log("Track Order: ", trackOrder);
        // if (playerOrder === 2 && trackOrder === '1') {
        //     timeToDelay = 0.5;
        // } else if (playerOrder === 3 && trackOrder === '1') {
        //     timeToDelay = 1;
        // }
        // else if (playerOrder === 3 && trackOrder === '2') {
        //     timeToDelay = 0.5;
        // }
        // else if (playerOrder === 4 && trackOrder === '1') {
        //     timeToDelay = 1.5;
        // }
        // else if (playerOrder === 4 && trackOrder === '2') {
        //     timeToDelay = 1;
        // }
        // else if (playerOrder === 4 && trackOrder === '3') {
        //     timeToDelay = 0.5;
        // }

        //audio context delay code
        // let audioCtx = new AudioContext();
        // const delay = new DelayNode(audioCtx, {
        //     delayTime: timeToDelay,
        // });

        // var source = audioCtx.createMediaStreamTrackSource(obj.track);
        // source.connect(delay);
        // var dest = audioCtx.createMediaStreamDestination();
        // delay.connect(dest);
        // audioElement.srcObject.addTrack(dest.stream.getAudioTracks()[0]);

        //Nick merge code-----------------------------------------------------------------
        //recorderSource = recordContext.createMediaStreamTrackSource(obj.track);
        let test = new MediaStream();
        test.addTrack(obj.track);
        
        recorderSource = recordContext.createMediaStreamSource(test);
        recorderSource.connect(recorderNode);
        recordContext.resume();

        //For now nick merge test
        // setTimeout(function(){
        recorderNode.parameters.get('isRecording').setValueAtTime(1, recordContext.currentTime);
        // metronome.startStop();
        // }, 2000);
        intervalReturn = setInterval(connectAudioBuffer, 1000); // connect an audio buffer every 1000ms
        playbackContext.resume();

        //Nick merge code-----------------------------------------------------------------

        //if we are the last player, record the audio streams
        // console.log("New stream player order: ", playerOrder);
        // console.log("User List: ", state.userlist.at(-1));
        if (state.username === state.userlist.at(-1)) {
            recorder = new MediaRecorder(streamOut.stream);

            //initialize event handlers for recorder
            recorder.ondataavailable = onDataAvailable;
            recorder.onstop = onStop;


            //Push ac sources
            //     const source = recordContext.createMediaStreamTrackSource(dest.stream.getAudioTracks()[0]);
            //     acSources.push(source);
            //     console.log("Acsource length", acSources.length);
            //     //if we have three streams.
            //     if (acSources.length === playerOrder - 1) {

            //         //connect all of the sources
            //         for (let i = 0; i < acSources.length; i++) {
            //             console.log("i acDest: ", acSources[i]);
            //             acSources[i].connect(acDest);
            //         }

            //         //create the media recorder for the last player
            //         console.log("acDest: ", acDest);
            //         recorder = new MediaRecorder(acDest.stream)

            //         // initialize event handlers for recorder
            //         recorder.ondataavailable = onDataAvailable;
            //         recorder.onstop = onStop;

            //     }
            // }
        }
    }

    //get the tracks in the antmedia room
    function getTracks() {
        //streamId = "room1";
        webRTCAdaptor.getTracks(currentRoom, state.token);
    }

    //add tracks to the antmedia room
    function addTrackList(streamId, trackList) {
        //addVideoTrack(streamId);
        // console.log("Track list", trackList);
        trackList.forEach(function (trackId) {
            addVideoTrack(trackId);
        });
    }

    //play the enabled antmedia room tracks
    function startPlaying() {
        var enabledTracks = [];
        //tracks to play if we are player 2
        if (playerOrder === 2) {
            // console.log("Player Order: ", playerOrder);
            // console.log("Tracks Order: ", tracks);

            tracks.forEach(function (trackId) {
                if (trackId === "1") {
                    enabledTracks.push("1");
                }
                else {
                    enabledTracks.push(("!") + trackId);
                }
            });
        }
        //tracks to play if we are player 3 
        else if (playerOrder === 3) {
            // console.log("Player Order: ", playerOrder);
            tracks.forEach(function (trackId) {
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
            tracks.forEach(function (trackId) {
                enabledTracks.push(("!") + trackId);
            });
        }
        //play the room tracks
        //streamId = "room1";
        webRTCAdaptor.play(currentRoom, state.token, "");
    }

    //add antmedia stream to track list
    function addVideoTrack(trackId) {
        tracks.push(trackId);
    }

    //enable checked track
    // function enableTrack(trackId, isEnabled) {
    //     webRTCAdaptor.enableTrack(currentRoom, trackId, isEnabled);
    // }

    //create antmedia remote audio player
    function createRemoteAudio(streamId, playerName) {
        var player = document.createElement("div");
        player.className = "col-sm-3";
        player.id = '' + playerName;
        player.innerHTML = '<video id="remoteVideo' + streamId + '"controls autoplay playsinline></video>' + playerName;
        document.getElementById("players").appendChild(player);
    }

    //connect webrtc adaptor
    async function getAudioDevice() {
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

    // takes recorded audio data and creates an audio source from it
    function createAudioBufferSource(audioData) {
        // createBuffer(channels, seconds, sampleRate)
        let buffer = playbackContext.createBuffer(1, playbackContext.sampleRate * 1, playbackContext.sampleRate);
        buffer.copyToChannel(audioData, 0);
        let bufferIn = playbackContext.createBufferSource();
        bufferIn.buffer = buffer;
        // bufferIn.onended = connectAudioBuffer();
        sources.push(bufferIn);
    }

    function connectAudioBuffer() { // add delay parameter to control when audiobuffer plays back? (in ms)
        console.log("loading audio buffer");
        let audioBuffer = sources.splice(0, 1)[0];
        if (audioBuffer) {
            audioBuffer.connect(playbackContext.destination);
            audioBuffer.connect(delayNode);
            audioBuffer.start();
            console.log("audio buffer connected");
        } else {
            console.error("No audio buffer sources found; cannot connect to playback context.");
        }
    }

    function connectMediaStreams() {
        console.log(state.delay);
        var streamIn = playbackContext.createMediaStreamSource(stream); // local stream
        delayNode = playbackContext.createDelay(10);
        delayNode.delayTime.setValueAtTime(state.delay, playbackContext.currentTime);
        streamOut = playbackContext.createMediaStreamDestination(); // output new combined stream
        streamIn.connect(streamOut); // connect to new combined stream
        delayNode.connect(streamOut);
        metronome = new Metronome(120, playbackContext, playbackContext.destination);
    }

    //join the antmedia room with audio only amcu
    function joinRoom() {
        webRTCAdaptor.joinRoom(currentRoom, state.streamName, "multitrack", "amcu");
    }

    //publish the local stream
    function publish(token) {
        let publishStreamName = '' + currentRoom + '-' + playerOrder;
        webRTCAdaptor.publish(publishStreamName, token, "", "", streamName, currentRoom, "{someKey:somveValue}", playerOrder);
    }

    function initiateWebrtc(streamOut) {
        return new WebRTCAdaptor({
            stream_out: streamOut.stream,
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

                } else if (info === "publish_started") {
                    //stream is being published
                    console.log("publish started");
                    alert("publish started");
                } else if (info === "publish_finished") {
                    //stream is being finished
                    console.log("publish finished");
                } else if (info === "trackList") {
                    console.log("trackList", obj.streamId);
                    addTrackList(obj.streamId, obj.trackList);
                } else if (info === "joinedTheRoom") {
                    console.log("Object ID", obj.streamId);
                    publish(obj.streamId, state.token);
                } else if (info === "closed") {
                    if (typeof obj != "undefined") {
                        console.log("Connecton closed: "
                            + JSON.stringify(obj));
                    }
                } else if (info === "streamInformation") {

                } else if (info === "newStreamAvailable") {
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
            <input
                    type='text'
                    name='session'
                    onChange={(e) => {state.delay = e.target.value}}
            />
            <input type='submit' value='Submit' />
        </div>
    );
}

export default Recorder;