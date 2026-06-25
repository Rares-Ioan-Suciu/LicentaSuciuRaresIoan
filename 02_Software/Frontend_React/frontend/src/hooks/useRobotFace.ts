import { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config';

export interface StudentData {
    studentName: string;
    accessCode: string;
    sessionId: number;
    task: string;
    details: string;
}

export type EmotionState = 'neutral' | 'thinking' | 'happy' | 'sad' | 'alert';

export const useRobotFace = () => {
    const [hasIntroduced, setHasIntroduced] = useState(false);
    const [isAwake, setIsAwake] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState('Aștept conexiunea...');
    const [emotion, setEmotion] = useState<EmotionState>('neutral');

    const [isDispatched, setIsDispatched] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentData | null>(null);
    const [secretCode, setSecretCode] = useState<string | null>(null);
    const [isBlinking, setIsBlinking] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const robotIpRaw = APP_CONFIG.ROBOT_IP.replace('http://', '') || '192.168.1.139';

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.log('wake lock fail', err);
        }
    };

    const speak = (text: string, lang: string = 'ro-RO', targetEmotion: EmotionState = 'neutral'): Promise<void> => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            const voices = window.speechSynthesis.getVoices();

            if (lang === 'fr-FR') {
                const frenchVoice = voices.find(v => v.lang.includes('fr-FR') || v.lang === 'fr_FR');
                if (frenchVoice) utterance.voice = frenchVoice;
                utterance.rate = 0.9;
            } else {
                const romanianVoice = voices.find(v => v.lang.includes('ro-RO') || v.lang === 'ro_RO');
                if (romanianVoice) utterance.voice = romanianVoice;
            }

            if (targetEmotion === 'happy') utterance.pitch = 1.3;
            else if (targetEmotion === 'sad') utterance.pitch = 0.8;
            else utterance.pitch = 1.1;

            utterance.onstart = () => {
                setIsSpeaking(true);
                setEmotion(targetEmotion);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setEmotion('neutral');
                resolve();
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                setEmotion('neutral');
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const connectWebSocket = () => {
        const wsUrl = `${APP_CONFIG.WS_BASE_URL}/ws_game`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setMessage('Conectat 🟢');
            ws.send(JSON.stringify({ type: "JOIN", role: "ROBOT", username: "robot", accessCode: "GLOBAL" }));
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'VOICE_HINT' && data.message) {
                    let textEmotion: EmotionState = 'neutral';
                    const textLower = data.message.toLowerCase();
                    if (textLower.includes('excelent') || textLower.includes('perfect') || textLower.includes('bravo') || textLower.includes('excellent')) textEmotion = 'happy';
                    if (textLower.includes('of') || textLower.includes('greșit') || textLower.includes('nu e chiar') || textLower.includes('non')) textEmotion = 'sad';

                    if (data.message.includes('|')) {
                        const parts = data.message.split('|');
                        const frenchPart = parts[0].trim();
                        const romanianPart = parts[1].trim();
                        setMessage(frenchPart);
                        await speak(frenchPart, 'fr-FR', textEmotion);
                        await new Promise(res => setTimeout(res, 500));
                        setMessage(romanianPart);
                        await speak(romanianPart, 'ro-RO', textEmotion);
                    } else {
                        setMessage(data.message);
                        await speak(data.message, data.lang || 'ro-RO', textEmotion);
                    }
                }

                if (data.type === 'ROBOT_DISPATCHED' && data.studentData) {
                    setIsDispatched(true);
                    setEmotion('alert');
                    setTargetStudent(data.studentData);
                    const text = `Atenție ${data.studentData.studentName}, mă îndrept spre tine!`;
                    setMessage(text);
                    await speak(text, 'ro-RO', 'alert');
                }

                if (data.type === 'SHOW_EXTRACTION_CODE' && data.code) {
                    setSecretCode(data.code);
                    setEmotion('alert');
                    const textToSpeak = `Attention! Le code secret est ${data.code.split('').join(', ')}`;
                    setMessage("Cod de extracție activat!");
                    await speak(textToSpeak, 'fr-FR', 'alert');
                    setTimeout(() => setSecretCode(null), 60000);
                }

                if (data.type === 'ROBOT_EMOTE') {
                    fetch(`http://${robotIpRaw}/emote?id=${data.emoteId}`)
                        .catch(() => { });

                    if (data.message) {
                        setMessage(data.message);
                        await speak(data.message, data.lang || 'ro-RO', data.emoteId === 1 ? 'happy' : 'sad');
                    }
                }
            } catch (error) {
                console.log("ws parse err:", error);
            }
        };

        ws.onclose = () => {
            setMessage('Reconectare... 🔴');
            setTimeout(connectWebSocket, 3000);
        };

        wsRef.current = ws;
    };

    const wakeUpRobot = async () => {
        setIsAwake(true);
        requestWakeLock();
        window.speechSynthesis.getVoices();
        await speak("Sistem online.", 'ro-RO', 'happy');
        connectWebSocket();
    };

    const introduceRobot = async () => {
        setHasIntroduced(true);
        const introText = "Da, haideți să vă arăt!";

        setMessage("Bună ziua, stimată comisie! Eu sunt Beatrix...");

        await speak(introText, 'ro-RO', 'happy');
    };

    const introduceRobotBilingual = async () => {
        setHasIntroduced(true);
        const frenchPart = "Bonjour à tous ! Je suis Beatrix, votre assistante robotique. Je suis très heureuse de vous rencontrer et j'ai hâte de commencer la mission d'aujourd'hui. Bonne chance !";
        const romanianPart = "Salutare tuturor! Eu sunt Beatrix, asistentul vostru robotic. Sunt foarte fericită să vă cunosc și abia aștept să începem misiunea de astăzi. Mult succes!";
        setMessage(frenchPart);
        await speak(frenchPart, 'fr-FR', 'happy');
        await new Promise(resolve => setTimeout(resolve, 500));
        setMessage(romanianPart);
        await speak(romanianPart, 'ro-RO', 'happy');
    };

    const handleStudentInteraction = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && targetStudent) {
            setIsDispatched(false);
            setMessage("Procesez datele...");
            setEmotion('thinking');

            wsRef.current.send(JSON.stringify({
                type: "ROBOT_ENGAGED",
                studentName: targetStudent.studentName,
                accessCode: targetStudent.accessCode,
                sessionId: targetStudent.sessionId,
                task: targetStudent.task,
                details: targetStudent.details
            }));
            setTargetStudent(null);
        }
    };

    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const blinkLogic = () => {
            const randomTime = Math.random() * (5000 - 2000) + 2000;
            setTimeout(() => {
                if ((emotion === 'neutral' || emotion === 'happy') && !secretCode) {
                    setIsBlinking(true);
                    setTimeout(() => {
                        setIsBlinking(false);
                        blinkLogic();
                    }, 150);
                } else {
                    blinkLogic();
                }
            }, randomTime);
        };
        blinkLogic();
    }, [emotion, secretCode]);

    return {
        hasIntroduced,
        isAwake,
        isSpeaking,
        message,
        emotion,
        isDispatched,
        targetStudent,
        secretCode,
        isBlinking,
        wakeUpRobot,
        introduceRobot,
        introduceRobotBilingual,
        handleStudentInteraction
    };
};