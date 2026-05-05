import React, { useState, useEffect, useRef } from 'react';

const ESP32_IP = "192.168.1.7";

interface StudentData {
    studentName: string;
    accessCode: string;
    sessionId: number;
    task: string;
    details: string;
}

type EmotionState = 'neutral' | 'thinking' | 'happy' | 'sad' | 'alert';

export const RobotFace: React.FC = () => {
    const [hasIntroduced, setHasIntroduced] = useState(false);
    const [isAwake, setIsAwake] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState('Aștept conexiunea...');
    const [emotion, setEmotion] = useState<EmotionState>('neutral');

    const [isDispatched, setIsDispatched] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentData | null>(null);

    const [secretCode, setSecretCode] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const [isBlinking, setIsBlinking] = useState(false);

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                await navigator.wakeLock.request('screen');
                console.log('Screen Wake Lock activat!');
            }
        } catch (err) {
            console.warn('Wake Lock a eșuat:', err);
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
                const frenchVoice = voices.find(voice => voice.lang.includes('fr-FR') || voice.lang === 'fr_FR');
                if (frenchVoice) utterance.voice = frenchVoice;
                utterance.rate = 0.9;
            } else {
                const romanianVoice = voices.find(voice => voice.lang.includes('ro-RO') || voice.lang === 'ro_RO');
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

    const wakeUpRobot = async () => {
        setIsAwake(true);
        requestWakeLock();
        window.speechSynthesis.getVoices();
        await speak("Sistem online.", 'ro-RO', 'happy');
        connectWebSocket();
    };

    const introduceRobot = async () => {
        setHasIntroduced(true);
        const introText = "Salutare tuturor! Eu sunt Beatrix, asistentul vostru robotic. Sunt foarte fericită să vă cunosc și abia aștept să începem misiunea de astăzi. Mult succes!";
        setMessage("Salutare tuturor! Eu sunt Beatrix...");
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

    

    const connectWebSocket = () => {
        const wsUrl = `ws://192.168.1.13:8080/ws_game`;
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
                        await new Promise(resolve => setTimeout(resolve, 500));
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
                    fetch(`http://${ESP32_IP}/emote?id=${data.emoteId}`)
                        .catch(e => console.warn("Eroare ESP32:", e));

                    if (data.message) {
                        setMessage(data.message);
                        await speak(data.message, data.lang || 'ro-RO', data.emoteId === 1 ? 'happy' : 'sad');
                    }
                }

            } catch (error) {
                console.error("WS Parse Error:", error);
            }
        };

        ws.onclose = () => {
            setMessage('Reconectare... 🔴');
            setTimeout(connectWebSocket, 3000);
        };

        wsRef.current = ws;
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

    if (!isAwake) {
        return (
            <div style={styles.container}>
                <button onClick={wakeUpRobot} style={styles.wakeButton}>
                    [ ONLINE SYSTEM ]
                </button>
            </div>
        );
    }

    const getEyeStyle = () => {
        let baseStyle = { ...styles.eye };

        if (isSpeaking) baseStyle = { ...baseStyle, ...styles.eyeSpeaking };
        if (isBlinking && (emotion === 'neutral' || emotion === 'happy')) {
            return { ...baseStyle, height: '5px', marginTop: '37px' };
        }

        switch (emotion) {
            case 'happy':
                return { ...baseStyle, borderRadius: '50% 50% 10px 10px', height: '60px', marginTop: '20px' };
            case 'sad':
                return { ...baseStyle, borderRadius: '10px 10px 50% 50%', height: '60px', marginTop: '20px', backgroundColor: '#3b82f6', boxShadow: '0 0 30px #3b82f6' };
            case 'alert':
                return { ...baseStyle, transform: 'scale(1.2)', backgroundColor: '#facc15', boxShadow: '0 0 40px #facc15' };
            case 'thinking':
                return { ...baseStyle, width: '20px', height: '20px', marginTop: '30px', animation: 'thinkBounce 1s infinite alternate' };
            default:
                return baseStyle;
        }
    };

    return (
        <div style={styles.container}>
            {!hasIntroduced && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '10px' }}>
                <button
                    onClick={introduceRobot}
                    style={{
                        padding: '8px 16px', background: 'transparent', color: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px',
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}
                >
                    👋 Prez. RO
                </button>
                <button
                    onClick={introduceRobotBilingual}
                    style={{
                        padding: '8px 16px', background: 'transparent', color: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px',
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}
                >
                    🥐 Prez. FR
                </button>
            </div>
    )}
            <style>
                {`
                @keyframes thinkBounce {
                    0% { transform: translateX(-15px); }
                    100% { transform: translateX(15px); }
                }
                `}
            </style>

            {secretCode && (
                <div style={styles.secretCodeOverlay}>
                    {secretCode}
                </div>
            )}

            {isDispatched && targetStudent && !secretCode ? (
                <div style={styles.dispatchOverlay}>
                    <h2 style={styles.dispatchText}>Salut, {targetStudent.studentName}!</h2>
                    <p style={styles.dispatchSubtext}>Sunt aici să te ajut.</p>
                    <button onClick={handleStudentInteraction} style={styles.studentInteractBtn}>
                        ✋ Interacționează
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ ...styles.eyesContainer, opacity: secretCode ? 0.1 : 1 }}>
                        <div style={getEyeStyle()}></div>
                        <div style={getEyeStyle()}></div>
                    </div>

                    {emotion !== 'thinking' && emotion !== 'sad' && !secretCode && (
                        <div style={{ ...styles.mouth, ...(isSpeaking ? styles.mouthSpeaking : {}) }}></div>
                    )}

                    <div style={styles.subtitle}>{message}</div>
                </>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: '#020617',
        height: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0
    },
    wakeButton: {
        padding: '20px 40px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#22d3ee',
        color: '#000',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)',
        cursor: 'pointer',
        fontFamily: 'monospace'
    },
    eyesContainer: {
        display: 'flex',
        gap: '60px',
        marginBottom: '40px',
        transition: 'opacity 0.3s ease-in-out'
    },
    eye: {
        width: '80px',
        height: '80px',
        backgroundColor: '#22d3ee',
        borderRadius: '50%',
        boxShadow: '0 0 40px #22d3ee',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    eyeSpeaking: {
        transform: 'scale(1.1)',
        boxShadow: '0 0 60px #22d3ee, 0 0 15px #fff'
    },
    mouth: {
        width: '30px',
        height: '8px',
        backgroundColor: '#22d3ee',
        borderRadius: '4px',
        boxShadow: '0 0 20px #22d3ee',
        transition: 'all 0.1s ease-in-out',
        opacity: 0.5
    },
    mouthSpeaking: {
        width: '100px',
        height: '30px',
        borderRadius: '15px',
        opacity: 1
    },
    subtitle: {
        position: 'absolute',
        bottom: '30px',
        color: '#475569',
        fontSize: '14px',
        fontFamily: 'monospace',
        textAlign: 'center',
        width: '90%',
        opacity: 0.5
    },
    dispatchOverlay: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.95)',
        width: '100%',
        height: '100%',
        padding: '20px',
        boxSizing: 'border-box'
    },
    dispatchText: {
        color: '#facc15',
        fontSize: '36px',
        fontWeight: '900',
        margin: '0 0 10px 0',
        textAlign: 'center',
        fontFamily: 'sans-serif'
    },
    dispatchSubtext: {
        color: '#94a3b8',
        fontSize: '20px',
        marginBottom: '50px',
        textAlign: 'center'
    },
    studentInteractBtn: {
        padding: '30px 60px',
        fontSize: '24px',
        fontWeight: '900',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        textTransform: 'uppercase'
    },
    secretCodeOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#10b981',
        fontSize: '6rem',
        fontWeight: '900',
        fontFamily: 'monospace',
        textShadow: '0 0 30px #10b981, 0 0 10px #fff',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: '30px 50px',
        borderRadius: '20px',
        border: '4px solid #10b981',
        letterSpacing: '15px'
    }
};