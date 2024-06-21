import React, { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

const VoiceRecorder: React.FC = () => {
    useEffect(() => {
        init();
    }, []);

    let mediaRecorder: MediaRecorder;
    let recordedChunks: Blob[] = [];
    let audioContext: AudioContext;
    let mediaStreamSource: MediaStreamAudioSourceNode;
    let processor: ScriptProcessorNode;
    let isRecording = false;
    const maxRecordingDuration = 5000; // 5 seconds
    const silenceDuration = 2000; // 2 seconds of silence to stop recording
    let silenceTimeout: NodeJS.Timeout;
    let recordingTimeout: NodeJS.Timeout;

    const setupAudioContext = (stream: MediaStream) => {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        processor = audioContext.createScriptProcessor(2048, 1, 1);
        mediaStreamSource.connect(processor);
        processor.connect(audioContext.destination);
    };

    const startMonitoring = (stream: MediaStream) => {
        processor.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0);
            const isSilent = !input.some(sample => Math.abs(sample) > 0.01); // 임계값 조정 가능
            
            if (isSilent && isRecording) {
                if (silenceTimeout) clearTimeout(silenceTimeout);
                silenceTimeout = setTimeout(() => {
                    stopRecording();
                }, silenceDuration);
            } else if (!isSilent && !isRecording) {
                startRecording(stream);
            } else if (!isSilent && isRecording) {
                if (silenceTimeout) clearTimeout(silenceTimeout);
            }
        };
    };

    const startRecording = (stream: MediaStream) => {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/wav' });
            recordedChunks = [];
            sendAudioToServer(blob);
        };

        mediaRecorder.start();
        isRecording = true;
        console.log('Recording started');

        recordingTimeout = setTimeout(() => {
            stopRecording();
        }, maxRecordingDuration);
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            console.log('Recording stopped');
            if (silenceTimeout) clearTimeout(silenceTimeout);
            if (recordingTimeout) clearTimeout(recordingTimeout);
        }
    };

    const sendAudioToServer = (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target?.result;
            if (arrayBuffer) {
                socket.emit('audioData', arrayBuffer);
            }
        };
        reader.readAsArrayBuffer(blob);
    };

    const init = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setupAudioContext(stream);
            startMonitoring(stream);
        } catch (err) {
            console.error('Error accessing audio stream: ', err);
        }
    };

    return (
        <div>
            <h1>Voice Recorder with WebSocket</h1>
            <div id="audioContainer"></div>
        </div>
    );
};

export default VoiceRecorder;
