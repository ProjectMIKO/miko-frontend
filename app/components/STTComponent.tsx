"use client";

import React, { useState, useEffect } from 'react';

interface STTComponentProps {
    keywords?: string[];
}

const STTComponent: React.FC<STTComponentProps> = ({ keywords: initialKeywords = [] }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [keywords, setKeywords] = useState<string[]>(initialKeywords);

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

    const extractKeywords = async () => {
        try {
            const response = await fetch('http://52.79.125.104:5000/keyword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: transcript }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('data:', data);
            // keyword가 단일 문자열이라면 배열로 감싸서 상태에 설정
            setKeywords([data.keyword]);
            setTranscript('');  // 추출 후 STT 데이터 비우기
        } catch (error) {
            console.error('Error extracting keywords:', error);
        }
    };

    return (
        <div>
            <h1>Speech Recognition Example</h1>
            <button onClick={isListening ? stopListening : startListening}>
                {isListening ? 'Stop Recognition' : 'Start Recognition'}
            </button>
            <button onClick={extractKeywords} disabled={!transcript}>
                Extract Keywords
            </button>
            <p><strong>Transcript:</strong> {transcript}</p>
            <p><strong>Interim Transcript:</strong> {interimTranscript}</p>
            <div>
                <strong>Keywords:</strong>
                <ul>
                    {keywords.length > 0 ? (
                        keywords.map((keyword, index) => (
                            <li key={index}>{keyword}</li>
                        ))
                    ) : (
                        <li>No keywords extracted</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default STTComponent;
