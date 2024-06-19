"use client";

import React, { useState, useEffect } from 'react';

const STTComponent: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const speechRecognition: SpeechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.lang = 'ko-KR';

            speechRecognition.onstart = () => {
                console.log('음성 인식 시작');
            };

            speechRecognition.onend = () => {
                console.log('음성 인식 종료');
                setIsListening(false);
            };

            speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript((prev) => prev + finalTranscript);
                setInterimTranscript(interimTranscript);
                console.log('음성 인식 결과:', finalTranscript, interimTranscript);
            };

            speechRecognition.onerror = (event: any) => {
                console.error('음성 인식 오류:', event.error);
            };

            setRecognition(speechRecognition);
        } else {
            console.warn('Web Speech API is not supported in this browser.');
        }
    }, []);

    const startListening = () => {
        if (recognition) {
            recognition.start();
            setIsListening(true);
            console.log('음성 인식 시작됨');
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
            console.log('음성 인식 중지됨');
        }
    };

    return (
        <div>
            <h1>Speech Recognition Example</h1>
            <button onClick={isListening ? stopListening : startListening}>
                {isListening ? 'Stop Recognition' : 'Start Recognition'}
            </button>
            <p><strong>Transcript:</strong> {transcript}</p>
            <p><strong>Interim Transcript:</strong> {interimTranscript}</p>
        </div>
    );
};

export default STTComponent;
