import React, { useState, useEffect, useRef } from 'react';
const ESP32_IP = "192.168.1.140";

interface StudentData {
    studentName: string;
    accessCode: string;
    sessionId: number;
    task: string;
    details: string;
}

// Definim stările emoționale ale robotului
type EmotionState = 'neutral' | 'thinking' | 'happy' | 'sad' | 'alert';

export const RobotFace: React.FC = () => {
    const [isAwake, setIsAwake] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState('Aștept conexiunea...');
    const [emotion, setEmotion] = useState<EmotionState>('neutral');

    const [isDispatched, setIsDispatched] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentData | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const [isBlinking, setIsBlinking] = useState(false);

    // Funcție pentru Wake Lock (să nu se stingă ecranul telefonului)
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

            // Ajustăm tonul în funcție de emoție
            if (targetEmotion === 'happy') utterance.pitch = 1.3;
            else if (targetEmotion === 'sad') utterance.pitch = 0.8;
            else utterance.pitch = 1.1;

            utterance.onstart = () => {
                setIsSpeaking(true);
                setEmotion(targetEmotion); // Setăm emoția în timpul vorbirii
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setEmotion('neutral'); // Revine la normal după ce tace
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
        await speak("Sistem online.", 'ro-RO', 'happy');
        connectWebSocket();
    };

    const connectWebSocket = () => {
        const wsUrl = `ws://192.168.1.131:8080/ws_game`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setMessage('Conectat 🟢');
            ws.send(JSON.stringify({ type: "JOIN", role: "ROBOT", username: "robot", accessCode: "GLOBAL" }));
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'VOICE_HINT' && data.message) {
                    setMessage(data.message);

                    // Deduce emoția din text (logică simplă pt licență)
                    let textEmotion: EmotionState = 'neutral';
                    const textLower = data.message.toLowerCase();
                    if (textLower.includes('excelent') || textLower.includes('perfect') || textLower.includes('bravo')) textEmotion = 'happy';
                    if (textLower.includes('of') || textLower.includes('greșit') || textLower.includes('nu e chiar')) textEmotion = 'sad';

                    await speak(data.message, data.lang || 'ro-RO', textEmotion);
                }

                if (data.type === 'ROBOT_DISPATCHED' && data.studentData) {
                    setIsDispatched(true);
                    setEmotion('alert');
                    setTargetStudent(data.studentData);
                    const text = `Atenție ${data.studentData.studentName}, mă îndrept spre tine!`;
                    setMessage(text);
                    await speak(text, 'ro-RO', 'alert');
                }

                if (data.type === 'ROBOT_EMOTE') {
                    fetch(`http://${ESP32_IP}/emote?id=${data.emoteId}`)
                        .catch(e => console.warn("Eroare ESP32:", e));

                    if (data.message) {
                        setMessage(data.message);
                        // Dacă ID 1 = Victorie (happy), ID 2 = Eșec (sad)
                        await speak(data.message, 'ro-RO', data.emoteId === 1 ? 'happy' : 'sad');
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

            // Setăm fața "Gânditoare" cât timp așteaptă răspunsul de la AI
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

    // Clipitul (Blink logic)
    useEffect(() => {
        const blinkLogic = () => {
            const randomTime = Math.random() * (5000 - 2000) + 2000;
            setTimeout(() => {
                if (emotion === 'neutral' || emotion === 'happy') { // Nu clipește când gândește sau e alert
                    setIsBlinking(true);
                    setTimeout(() => {
                        setIsBlinking(false);
                        blinkLogic();
                    }, 150);
                } else {
                    blinkLogic(); // Mai încearcă mai târziu
                }
            }, randomTime);
        };
        blinkLogic();
    }, [emotion]);

    if (!isAwake) {
        return (
            <div style={styles.container}>
                <button onClick={wakeUpRobot} style={styles.wakeButton}>
                    [ ONLINE SYSTEM ]
                </button>
            </div>
        );
    }

    // Funcție pentru a returna stilul ochilor în funcție de Emoție
    const getEyeStyle = () => {
        let baseStyle = { ...styles.eye };

        if (isSpeaking) baseStyle = { ...baseStyle, ...styles.eyeSpeaking };
        if (isBlinking && (emotion === 'neutral' || emotion === 'happy')) {
            return { ...baseStyle, height: '5px', marginTop: '37px' };
        }

        switch (emotion) {
            case 'happy': // Ochii se curbează în sus (tipic anime ^ ^)
                return { ...baseStyle, borderRadius: '50% 50% 10px 10px', height: '60px', marginTop: '20px' };
            case 'sad': // Ochii se lasă în jos
                return { ...baseStyle, borderRadius: '10px 10px 50% 50%', height: '60px', marginTop: '20px', backgroundColor: '#3b82f6', boxShadow: '0 0 30px #3b82f6' };
            case 'alert': // Ochi mari, galbeni
                return { ...baseStyle, transform: 'scale(1.2)', backgroundColor: '#facc15', boxShadow: '0 0 40px #facc15' };
            case 'thinking': // Ochii devin mici ca niște puncte
                return { ...baseStyle, width: '20px', height: '20px', marginTop: '30px', animation: 'thinkBounce 1s infinite alternate' };
            default:
                return baseStyle;
        }
    };

    return (
        <div style={styles.container}>
            {/* INJECTĂM ANIMAȚII CSS GLOBALE PENTRU OCHI */}
            <style>
                {`
                @keyframes thinkBounce {
                    0% { transform: translateX(-15px); }
                    100% { transform: translateX(15px); }
                }
                `}
            </style>

            {isDispatched && targetStudent ? (
                <div style={styles.dispatchOverlay}>
                    <h2 style={styles.dispatchText}>Salut, {targetStudent.studentName}!</h2>
                    <p style={styles.dispatchSubtext}>Sunt aici să te ajut.</p>
                    <button onClick={handleStudentInteraction} style={styles.studentInteractBtn}>
                        ✋ Interacționează
                    </button>
                </div>
            ) : (
                <>
                    <div style={styles.eyesContainer}>
                        <div style={getEyeStyle()}></div>
                        <div style={getEyeStyle()}></div>
                    </div>

                    {/* GURA (Dispare când e trist sau gândește) */}
                    {emotion !== 'thinking' && emotion !== 'sad' && (
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
        backgroundColor: '#020617', // Negru mai profund pentru contrast pe AMOLED
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
        backgroundColor: '#22d3ee', // Cyan tech
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
        marginBottom: '40px'
    },
    eye: {
        width: '80px',
        height: '80px',
        backgroundColor: '#22d3ee', // Trecere la Cyan pentru vibe tech
        borderRadius: '50%',
        boxShadow: '0 0 40px #22d3ee',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' // Tranziție mai smooth a formelor
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
    }
};