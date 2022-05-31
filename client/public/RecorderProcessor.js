/*
Implements code based on the example here: https://gist.github.com/flpvsk/047140b31c968001dc563998f7440cc1
Grabs raw PCM data as it passes through the worklet processor
*/

class RecorderWorkletProcessor extends AudioWorkletProcessor { // this worklet is single channel audio
    static get parameterDescriptors() {
        return [{
            name: 'isRecording',
            defaultValue: 0
        }];
    }

    constructor() {
        super();
        this._bufferSize = 48000; // samplerate 48000; grabs 1 second of audio
        this._buffer = new Float32Array(this._bufferSize);
        this._initBuffer();
    }

    _initBuffer() {
        this._bytesWritten = 0;
    }

    _isBufferEmpty() {
        return this._bytesWritten === 0;
    }

    _isBufferFull() {
        return this._bytesWritten === this._bufferSize;
    }

    _appendToBuffer(value) {
        if (this._isBufferFull()) {
            this._flush();
        }

        this._buffer[this._bytesWritten] = value;
        this._bytesWritten += 1;
    }

    _flush() {
        let buffer = this._buffer;
        if (this._bytesWritten < this._bufferSize) {
            buffer = buffer.slice(0, this._bytesWritten);
        }

        this.port.postMessage({
            eventType: 'data',
            audioBuffer: buffer
        });

        this._initBuffer();
    }

    _recordingStopped() {
        this.port.postMessage({
            eventType: 'stop'
        });
    }

    _reportError(err) {
        this.port.postMessage({
            eventType: 'error',
            error: err
        });
    }

    process(inputs, outputs, parameters) {
        const isRecordingValues = parameters.isRecording;

        for (
            let dataIndex = 0;
            dataIndex < isRecordingValues.length;
            dataIndex++
        ) {
            const shouldRecord = isRecordingValues[dataIndex] === 1;
            if (!shouldRecord && !this._isBufferEmpty()) {
                this._flush();
                this._recordingStopped();
            }

            if (shouldRecord) {
                try {
                this._appendToBuffer(inputs[0][0][dataIndex]);
                } catch (err) {
                    this._reportError(err);
                }
            }
        }

        return true;
    }

}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);