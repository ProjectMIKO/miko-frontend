"use client";

import { useEffect, useState } from 'react';

const VoiceRecorder = () => {
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState<number>(0);

    useEffect(() => {
        let mediaRecorder: MediaRecorder;
        let recordedChunks: BlobPart[] = [];
        let audioContext: AudioContext | null = null;
        let mediaStreamSource: MediaStreamAudioSourceNode;
        let workletNode: AudioWorkletNode;
        let isRecording = false;
        const maxRecordingDuration = 5000; // 5 seconds
        const silenceDetectorProcessor = '/worklets/SilenceDetectorProcessor.js'; // AudioWorklet 프로세서 경로
        const silenceDuration = 2000; // 2 seconds of silence to stop recording
        let silenceTimeout: NodeJS.Timeout;
        let recordingTimeout: NodeJS.Timeout;

        const audioContainer = document.getElementById('audioContainer');

        async function init() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setupAudioContext(stream);
                await setupWorkletNode(audioContext);
                startMonitoring(stream);
            } catch (error) {
                console.error('Error accessing audio stream: ', error);
                handleError(error);
            }
        }

        function handleError(error: any) {
            switch (error.name) {
                case 'NotAllowedError':
                    setError('마이크 접근이 거부되었습니다. 설정에서 마이크 접근을 허용해주세요.');
                    break;
                case 'NotFoundError':
                    setError('마이크가 감지되지 않았습니다. 마이크가 연결되어 있는지 확인해주세요.');
                    break;
                case 'NotReadableError':
                    setError('마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중인지 확인해주세요.');
                    break;
                case 'OverconstrainedError':
                    setError('요구된 오디오 제약 조건을 만족시키는 장치를 찾을 수 없습니다.');
                    break;
                case 'SecurityError':
                    setError('보안 오류로 인해 마이크 접근이 차단되었습니다.');
                    break;
                case 'AbortError':
                    setError('마이크 요청이 중단되었습니다. 다시 시도해주세요.');
                    break;
                default:
                    setError(`알 수 없는 오류가 발생했습니다: ${error.message}`);
                    break;
            }
        }

        function setupAudioContext(stream: MediaStream) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            mediaStreamSource = audioContext.createMediaStreamSource(stream);
        }

        async function setupWorkletNode(context: AudioContext | null) {
            if (context) {
                await context.audioWorklet.addModule(silenceDetectorProcessor);
                workletNode = new AudioWorkletNode(context, 'silence-detector-processor');
                mediaStreamSource.connect(workletNode);
                workletNode.connect(context.destination);
            }
        }

        function startMonitoring(stream: MediaStream) {
            if (workletNode) {
                workletNode.port.onmessage = (event) => {
                    const isSilent = event.data === 'silent';

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
            }
        }

        function startRecording(stream: MediaStream) {
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
                const audioURL = URL.createObjectURL(blob);
                createAudioElement(audioURL);
            };

            mediaRecorder.start();
            isRecording = true;
            console.log('Recording started');

            recordingTimeout = setTimeout(() => {
                stopRecording();
            }, maxRecordingDuration);
        }

        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                isRecording = false;
                console.log('Recording stopped');
                if (silenceTimeout) clearTimeout(silenceTimeout);
                if (recordingTimeout) clearTimeout(recordingTimeout);
            }
        }

        function createAudioElement(src: string) {
            if (audioContainer) {
                const audioElement = document.createElement('audio');
                audioElement.controls = true;
                audioElement.src = src;
                audioContainer.appendChild(audioElement);
            }
        }

        init();

        return () => {
            if (audioContext) {
                audioContext.close();
            }
        };
    }, [retry]);

    return (
        <div>
            <h1>자동 분할 기능이 있는 음성 녹음기</h1>
            {error ? (
                <div>
                    <p>{error}</p>
                    <button onClick={() => setRetry(retry + 1)}>다시 시도</button>
                </div>
            ) : (
                <div id="audioContainer"></div>
            )}
        </div>
    );
};

export default VoiceRecorder;
