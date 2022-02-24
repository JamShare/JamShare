import React, { Component } from 'react'
import io from "socket.io-client";

 
import AudioReactRecorder, { RecordState } from 'audio-react-recorder' //https://www.npmjs.com/package/audio-react-recorder 
//https://developer.mozilla.org/en-US/docs/Web/API/AudioNode

// const AudioContext = window.AudioContext || window.webkitAudioContext; //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
// const audioContext = new AudioContext(); //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

const SERVER = "http://localhost:3000";


export default function App() {

    return (
        <div>hello world</div>
    )
}