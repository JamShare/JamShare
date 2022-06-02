import React from 'react';
import { WebRTCAdaptor } from '../js/webrtc_adaptor.js';
import { getUrlParameter } from "../js/fetch.stream.js";
import { saveAs } from 'file-saver';
import socket from "../index";

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
    const recordContext = new AudioContext(); // recorder context records incoming audio from remote stream
    recordContext.resume(); // enable the record context immediately... or should we wait?

    const playbackContext = new AudioContext(); // playback context plays back to user and combines local user audio with audiobuffer recordings to create new stream
    
    let playerOrder = 0;
    let sources = []; // holds audiobuffer sources
    let recorderNode = null; // audioWorklet node, records audio
    recordContext.audioWorklet.addModule("RecorderProcessor.js") // enables audioworklet module for local recording
    .then(() => {
        recorderNode = new AudioWorkletNode(recordContext, 'recorder-worklet');
        recorderNode.connect(recordContext.destination);
        recorderNode.port.onmessage = (e) => { // this handles message events from the associated processor (audioworkletprocessor)
            if (e.data.eventType === 'data') { // handle events based on eventType
                const audioData = e.data.audioBuffer;
                createAudioBufferSource(audioData);
            }
            if (e.data.eventType === 'stop') {
                // recording stopped
            }
            if (e.data.eventType === 'error') {
                console.error('Error in recorder node.');
                // recorderSource.connect(streamOut);
            }
        }
    });
    let delayNode = null; // audiobuffersource nodes connect to this, which are delayed when outputting to streamOut
    let stream = null; // this is the local stream
    var recorderSource = null; // source for recorderNode; uses remote stream as its source. connects.enough data it creates a buffersource which is stored in the sources array, and pulled out like a queue

    // recorder variables
    let chunks = []; // chunks of audio collected by mediaRecorder, must be reassembled before use
    let recorder = null; // mediaRecorder reading streamOut
    let audio = null; // creates an audiofile based off blob of combined mediaRecorder chunks
    let recordIcon = require('./assets/images/record.png')
    let playingIcon = require('./assets/images/playing.png')

    //for listening and recording last player's combined audio
    const mixedAudioContext = new AudioContext(); // recorder context records incoming final audio from remote stream
    let mixedAudioNode = null; //audioWorklet node records final player's stream
    mixedAudioContext.resume();//enable it. we dont want to hear it though..
    mixedAudioContext.audioWorklet.addModule("RecorderProcessor.js") // enables audioworklet module for local recording
    .then(() => {
        mixedAudioNode = new AudioWorkletNode(mixedAudioContext, 'recorder-worklet');
        mixedAudioNode.connect(mixedAudioContext.destination);
        mixedAudioNode.port.onmessage = (e) => { // this handles message events from the associated processor (audioworkletprocessor)
            if (e.data.eventType === 'data') { // handle events based on eventType
                const audioData = e.data.audioBuffer;
                createMixedAudioBufferSource(audioData);
            }
            if (e.data.eventType === 'stop') {
                // recording stopped
            }
            if (e.data.eventType === 'error') {
                console.error('Error in recorder node.');
                // recorderSource.connect(streamOut);
            }
        }
    });
    let mixedAudioBufferSources = []; // holds audiobuffer sources
    var mixedAudioSource = null; //source for final player mixedAudioNode
    let mixedChunks = [];//chunks of audio collected by mediaRecorder, must be reassembled before use
    let mixedAudioRecorder = null;  // mediaRecorder reading mixedAudioSource
    // let mixedAudio = null; //creates audiofile from blobs of mediaRecorder chunks

    //antmedia variables
    let webRTCAdaptor = null;
    let streamName = getUrlParameter("streamName");
    let streamOut = null; // combined stream, outputs to next player in the chain

    //room info
    let currentRoom = '' + state.sessionID + '-';

    //Merge variables
    let intervalReturn = null; // use this to clearInterval on the connectAudioBuffers function

    socket.on('initializeMixed',(streamval)=>{
        if(playerOrder === userlist.length){//final player already has the recording
            return;
        }

        // INITIALIZE COMBINED audio listener here

        
    });

    //socket event to initialize in proper order
    socket.on('initialize', (index) => {
            //initialize and connect to MUTED incoming remote stream.
            
            //CALL INITIALIZE HERE 
            

            //signal to next index to initialize and listen to our MUTED publish.
            let data = {index:(playerOrder)};//next player index (playerOrder is +1 to index). if we are last, server will notify everyone to listen.
            socket.emit('initjam', data)//send signal to next player
            return;
        }

    });

    function getPlayerOrder() {
        for (let i = 0; i < props.userlist.length; i++) {//zach changed to props
            if (state.username === state.userlist[i]) {
                playerOrder = i + 1;
            }
        }
    }

    //initialize listening in proper order
    function startTheJam() {
        try {
            getPlayerOrder();
        } catch (error) {
            console.log('Error in playerOrder:', error);
        }

        if(playerOrder === 1){//&& everyoneIsReady()
            try {
                getAudioDevice();
                let data = {index:playerOrder};
                socket.emit('initjam', data);//notifty player 2 at index 1.
            } catch(error) {
                console.log('Error in getAudioDevice:', error);
            }
                //initialize all players with socket event        
        }else{
            console.log("Waiting for others to ready")
        }
    }
    function initializePlayers(){
        try {
            getPlayerOrder();
        } catch (error) {
            console.log('Error in playerOrder:', error);
        }
        try {
            getAudioDevice();
            let data = {index:playerOrder};//playerOrder is 1 larger than index
            socket.emit('initjam', data)
        } catch(error) {
            console.log('Error in getAudioDevice:', error);
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

        //need to wait to do this after recieving audio?... keep listening until audio is not empty 
        //or certain volume level detected
        connectMediaStreams();

        return;
    }


   

    // event handlers for mediaRecorder
    function onDataAvailable(e) {
        if(e.muted === false){
            chunks.push(e.data);
        }
    }

    function onStop(e) {
        console.log("Recording stopped successfully.");
        let blob = new Blob(chunks, { 'type': 'audio/wav; codecs=opus' })
        let audioURL = URL.createObjectURL(blob);
        audio = new Audio(audioURL);
        saveAs(blob, "audioTest.wav")
    }
    //

    // event handlers for mixedMediaRecorder
    function mixedOnDataAvailable(e) {
        if(e.muted === false){
            mixedChunks.push(e.data);
        }
    }

    function mixedOnStop(e) {
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
        recorderSource = recordContext.createMediaStreamTrackSource(obj.track);
        recorderSource.connect(recorderNode); // connect to recorderNode. recorderNode is 

        // enable recorderNode (to disable, set value to 0)
        recorderNode.parameters.get('isRecording').setValueAtTime(1, recordContext.currentTime);//recording into buffer only occurs when set to 1.
        // connects an audiobuffer every 1000ms, use clearInterval(intervalReturn) to stop
        intervalReturn = setInterval(connectAudioBuffer, 1000);
        playbackContext.resume(); // enables playback 
        
        // record audio if you're the last player
        if (state.username === state.userlist.at(-1)) {
            recorder = new MediaRecorder(streamOut.stream);

            //initialize event handlers for recorder
            recorder.ondataavailable = onDataAvailable;//check if muted
            recorder.onstop = onStop;
        }
    }

    //begin:  saving final players audio
    function saveMixed(obj){//saves the final players stream and makes it available to viewer for download
        var index;
        if (obj.track.kind === "audio") {
            index = obj.track.id.replace("ARDAMSa", "");
        }
        if (index === currentRoom) {
            return;
        }
        // create audio source from previous players' remote stream
        mixedAudioSource = mixedAudioContext.createMediaStreamTrackSource(obj.track);
        mixedAudioSource.connect(mixedAudioNode); // connect to recorderNode. recorderNode is 

        // enable recorderNode (to disable, set value to 0)
        mixedAudioNode.parameters.get('isRecording').setValueAtTime(1, mixedAudioContext.currentTime);//recording into buffer only occurs when set to 1.
        // connects an audiobuffer every 1000ms, use clearInterval(intervalReturn) to stop
        intervalReturn = setInterval(connectAudioBuffer, 1000);
        playbackContext.resume(); // enables playback 
        
        // record audio if you're NOT the last player
        if (state.username !== state.userlist.at(-1)) {
            mixedAudioRecorder = new MediaRecorder(mixedAudioSource.stream);

            //initialize event handlers for recorder
            mixedAudioRecorder.ondataavailable = mixedOnDataAvailable;
            mixedAudioRecorder.onstop = mixedOnStop;
        }
    }

    // takes mixed recorded audio data and creates an audio source from it
    function createMixedAudioBufferSource(audioData) {
        // syntax is createBuffer(channels, seconds, sampleRate)
        let buffer = playbackContext.createBuffer(1, playbackContext.sampleRate * 1, playbackContext.sampleRate);
        buffer.copyToChannel(audioData, 0); // copy audioData into buffer
        let bufferIn = playbackContext.createBufferSource(); // create source
        bufferIn.buffer = buffer; // assign buffer to source
        // bufferIn.onended = connectAudioBuffer(); // callback function for when bufferSource ends
        mixedAudioBufferSources.push(bufferIn); // push bufferSource into array
    }
    //end: saving final player audio

    // takes recorded audio data and creates an audio source from it
    function createAudioBufferSource(audioData) {
        // syntax is createBuffer(channels, seconds, sampleRate)
        let buffer = playbackContext.createBuffer(1, playbackContext.sampleRate * 1, playbackContext.sampleRate);
        buffer.copyToChannel(audioData, 0); // copy audioData into buffer
        let bufferIn = playbackContext.createBufferSource(); // create source
        bufferIn.buffer = buffer; // assign buffer to source
        // bufferIn.onended = connectAudioBuffer(); // callback function for when bufferSource ends
        sources.push(bufferIn); // push bufferSource into array
    }


    function connectAudioBuffer() { // add delay parameter to control when audiobuffer plays back? (in ms)
        console.log("loading audio buffer");
        let audioBuffer = sources.splice(0, 1)[0]; // grab the first bufferSource in the array
        if (audioBuffer) { // if audioBuffer exists
            audioBuffer.connect(playbackContext.destination);
            audioBuffer.connect(delayNode);
            audioBuffer.start();
            console.log("audio buffer connected");
        } else { // if audioBuffer is undefined
            /* add last player check
            if (state.isRecording) {
                state.isRecording = !state.isRecording;
            }
            */ 
            console.error("No audio buffer sources found; cannot connect it to playback context.");
        }
    }

    function connectMediaStreams() {
        var streamIn = playbackContext.createMediaStreamSource(stream); // local stream
        delayNode = playbackContext.createDelay(10); // create delayNode with maxDelay of 10s
        delayNode.delayTime.setValueAtTime(state.delay, playbackContext.currentTime); // set delayTime of delayNode for writing to combined buffer
        

        streamOut = playbackContext.createMediaStreamDestination(); // output combined stream of localStream and audioBufferSourceNodes, send to next player
        
        //connect delayed local audio and incoming stream
        streamIn.connect(streamOut); // connect localStream to new combined stream
        delayNode.connect(streamOut); // connect delayNode to new combined stream
        
        webRTCAdaptor = initiateWebrtc(streamOut.stream); // initialize the webRTC adaptor
    }

    //publish the local stream
    function publish(token) {
        let publishStreamName = '' + currentRoom + '-' + playerOrder;
        webRTCAdaptor.publish(publishStreamName, token, "", "", streamName, currentRoom, "{someKey:somveValue}", playerOrder);//publishes to ant stream
    }

    // this function is called when WebRTCAdaptor is finished intializing, to prevent "WebRTCAdaptor is null" errors
    function initAntMedia() {
        //join the antmedia room with audio only amcu
        webRTCAdaptor.joinRoom(currentRoom, state.streamName, "multitrack", "amcu");
        webRTCAdaptor.play(currentRoom, state.token, ""); //might play final player's audio?
    };

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

                    //todo: WAIT for incoming stream to actually have sound before publishing?  
                    console.log("Object ID", obj.streamId);
                    publish(obj.streamId, state.token);

                } else if (info === "closed") {
                    if (typeof obj != "undefined") {
                        console.log("Connecton closed: " + JSON.stringify(obj));
                    }
                } else if (info === "streamInformation") {
                    let tempOrder = obj.trackId.slice(-1);
                    //THIS IS where we begin adding to our buffer IF audio is not muted?
                    //https://stackoverflow.com/questions/54488329/webrtc-how-to-tell-if-there-is-audio
                    //https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/muted
                    
                    if(obj.track.muted !== true){
                        //begin writing to buffer like in play audio. 
                        //check if it's the last players. write to mixed. otherwise, save as player ahead of us'.
                        if ((playerOrder !== props.userlist.length) && parseInt(tempOrder, 10) === parseInt(props.userlist.length, 10)) {
                            console.log("recieving final player's mixed stream info:", obj.trackId);
                            saveMixed(obj);
                        }
                        // get previous players stream
                        if (parseInt(tempOrder, 10) === parseInt(playerOrder-1, 10)) {
                            console.log("recieving prior player stream info", obj.trackId);
                            // playAudio(obj);
                        }
                    }

                    // obj.track.onunmute = () => {
                    //     console.log("Audio data arriving!");
                    //     publish(obj.streamId, state.token);
                    // }

                } else if (info === "newStreamAvailable") {
                    let tempOrder = obj.trackId.slice(-1);

                    //get final player's stream here
                    //check if its the final player's and make sure we are not the final player
                    if ((playerOrder !== props.userlist.length) && parseInt(tempOrder, 10) === parseInt(props.userlist.length, 10)) {
                        console.log("recieving final player's mixed stream:", obj.trackId);
                        saveMixed(obj);
                    }

                    // get previous players stream
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
                    if(obj.muted === false){
                        //start actually writing to buffer?
                    }

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