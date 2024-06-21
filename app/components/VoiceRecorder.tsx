"use client";

import { useEffect, useState, useRef } from 'react';

const VoiceRecorder = () => {
    const [error, setError] = useState<string | null>(null);
    const [recording, setRecording] = useState<boolean>(false);
    const [audioURLs, setAudioURLs] = useState<string[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const isSilentRef = useRef<boolean>(false); // 침묵 상태를 추적

    useEffect(() => {
        async function init() {
            try {
                console.log("Requesting microphone access...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("Microphone access granted:", stream);

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContextRef.current = audioContext;

                try {
                    console.log("Loading AudioWorklet module...");
                    await audioContext.audioWorklet.addModule('/worklet-processor.js');
                    console.log("AudioWorklet module loaded successfully.");
                } catch (err) {
                    console.error('Error loading AudioWorklet module:', err);
                    setError('Error loading AudioWorklet module');
                    return;
                }

                const mediaStreamSource = audioContext.createMediaStreamSource(stream);
                const workletNode = new AudioWorkletNode(audioContext, 'silence-detector-processor');
                workletNodeRef.current = workletNode;

                workletNode.port.onmessage = (event) => {
                    console.log('Silence detector event:', event.data);
                    console.log(event.data.isSilent);
                    if (event.data.isSilent) {
                        isSilentRef.current = true;
                        console.log('Detected silence, stopping recording...');
                        stopRecording();
                    } else {
                        isSilentRef.current = false;
                        console.log('Detected sound, starting recording...');
                        startRecording();
                    }
                };

                mediaStreamSource.connect(workletNode);
                workletNode.connect(audioContext.destination);

                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    if (audioChunksRef.current.length > 0) {
                        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                        const url = URL.createObjectURL(blob);
                        setAudioURLs(prev => [...prev, url]);
                        audioChunksRef.current = [];
                    }
                };
            } catch (err: any) {
                console.error('Error accessing audio stream:', err);
                handleError(err);
            }
        }

        function handleError(err: any) {
            switch (err.name) {
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
                    setError(`알 수 없는 오류가 발생했습니다: ${err.message}`);
                    break;
            }
        }

        init();

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
            mediaRecorderRef.current.start();
            setRecording(true);
            console.log("Recording started");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecording(false);
            console.log("Recording stopped and data saved");
        }
    };

    return (
        <div>
            <h1>마이크 접근 테스트</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <div>
                    <button onClick={startRecording} disabled={recording}>Start Recording</button>
                    <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
                    {audioURLs.map((url, index) => (
                        <audio key={index} src={url} controls />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
