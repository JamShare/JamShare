import React from 'react';
const io = require('socket.io-client');
const socketPromise = require('../socket.io-promise').promise;
const mediasoup = require('mediasoup-client');
const config = require('../clientConfig');

const SERVER = "http://localhost:3001";
const hostname = window.location.hostname;

class Recorder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isPlaying: false,
            icon: '',
            text: 'Jam!',
        };

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
        this.connect = this.connect.bind(this);
        this.loadDevice = this.loadDevice.bind(this);
        this.publish = this.publish.bind(this);
        this.consume = this.consume.bind(this);
        this.getUserMedia = this.getUserMedia.bind(this);
        this.subscribe = this.subscribe.bind(this);

        this.device = null;
        this.socket = null;
        this.producer = null;
        //this.data = null;
        this.stream = null;


        //his.socket = io.connect(SERVER);    
        /*
        (async () => {
            try {
                await this.connect();
                await this.publish();
                await this.subscribe();
            } catch (err) {
                console.error(err);
            }
        })();
        */

    }

    async connect() {
        const opts = {
            transports: ['websocket'],
        };

        const serverUrl = `https://${hostname}:${config.listenPort}`;
        this.socket = io(SERVER);
        this.socket.request = socketPromise(this.socket);

        this.socket.on('connect', async () => {
            const data = await this.socket.request('getRouterRtpCapabilities');
            await this.loadDevice(data);
        });

        this.socket.on('disconnect', () => {

        });

        this.socket.on('connect_error', (error) => {
            console.error('could not connect to %s%s (%s)', SERVER, opts.path, error.message);
        });

        this.socket.on('newProducer', () => {

        });

        this.socket.on("audio-blob", (chunks) => {
            console.log("Audio blob recieved.");
            let blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' })
            let audioURL = URL.createObjectURL(blob);
            this.audio = new Audio(audioURL);
        });
    }

    async loadDevice(routerRtpCapabilities) {
        try {
            this.device = new mediasoup.Device();
        } catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported');
            }
        }
        await this.device.load({ routerRtpCapabilities });
    }

    async publish(e) {
    const isWebcam = (e.target.id === 'btn_webcam');

    const data = await this.socket.request('createProducerTransport', {
        forceTcp: false,
        rtpCapabilities: this.device.rtpCapabilities,
    });
    if (data.error) {
        console.error(data.error);
        return;
    }

    console.log(data);
    const transport = this.device.createSendTransport(data);
    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        this.socket.request('connectProducerTransport', { dtlsParameters })
            .then(callback)
            .catch(errback);
    });

    transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
            const { id } = await this.socket.request('produce', {
                transportId: transport.id,
                kind,
                rtpParameters,
            });
            callback({ id });
        } catch (err) {
            errback(err);
        }
    });

    transport.on('connectionstatechange', (state) => {
        switch (state) {
            case 'connecting':
                
                break;

            case 'connected':
                document.querySelector('audio#localAudio').srcObject = stream;
                
                break;

            case 'failed':
                transport.close();
                
                break;

            default: break;
        }
    });

    let stream;
    try {
        stream = await this.getUserMedia(transport, isWebcam);
        const track = stream.getVideoTracks()[0];
        const params = { track };
        
        this.producer = await transport.produce(params);
    } catch (err) {
        
    }
}

    async consume(transport) {
        const { rtpCapabilities } = this.device;
        const data = await this.socket.request('consume', { rtpCapabilities });
        const {
            producerId,
            id,
            kind,
            rtpParameters,
        } = data;

        let codecOptions = {};
        const consumer = await transport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            codecOptions,
        });
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        return stream;
    }

    async getUserMedia() {
        if (!this.device.canProduce('audio')) {
            console.error('cannot produce audio');
            return;
        }

        let stream;
        try {
            const constraints = {
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                    latency: 0,
                }
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.error('getUserMedia() failed:', err.message);
            throw err;
        }
        return stream;
    }

    async subscribe() {
        const data = await this.socket.request('createConsumerTransport', {
            forceTcp: false,
        });
        if (data.error) {
            console.error(data.error);
            return;
        }

        const transport = this.device.createRecvTransport(data);
        transport.on('connect', ({ dtlsParameters }, callback, errback) => {
            this.socket.request('connectConsumerTransport', {
                transportId: transport.id,
                dtlsParameters
            })
                .then(callback)
                .catch(errback);
        });

        transport.on('connectionstatechange', async (state) => {
            switch (state) {
                case 'connecting':

                    break;

                case 'connected':
                    document.querySelector('#remote_audio').srcObject = await stream;
                    await this.socket.request('resume');

                    break;

                case 'failed':
                    transport.close();

                    break;

                default: break;
            }
        });

        const stream = this.consume(transport);
    }



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
        async function playAudio() {
            try {
                const constraints = {
                    audio: {
                        echoCancellation: false,
                        autoGainControl: false,
                        noiseSuppression: false,
                        latency: 0
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const audioElement = document.querySelector('audio#localAudio');
                audioElement.srcObject = stream;
            } catch (error) {
                console.error('Error opening audio .', error);
            }
        }
        this.socket.emit("audio-stream-start");
        playAudio();
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
        return (
            <div id="container" >
                <body>
                    <audio id="localAudio" autoPlay playsInline controls={true} />
                </body>
                <button onClick={this.featureRun}>
                    <image src={this.icon} alt=""></image>
                    {this.text}
                </button>
                <button onClick={this.connect}>
                    Choose audio device
                </button>
                <button onClick={this.subscribe}>
                    Start recording
                </button>
                <button onClick={this.publish}>
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