import React, { useState, useEffect, useRef } from 'react';
const ESP32_IP = "192.168.1.140";

interface StudentData {
    studentName: string;
    accessCode: string;
    sessionId: number;
    task: string;
    details: string;
}

export const RobotFace: React.FC = () => {
    const [isAwake, setIsAwake] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState('Aștept conexiunea...');

    const [isDispatched, setIsDispatched] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentData | null>(null);

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

    

    const speak = (text: string, lang: string = 'ro-RO'): Promise<void> => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                console.warn("TTS nu este suportat pe acest browser.");
                resolve();
                return;
            }

            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.pitch = 1.1; // Voce un pic mai înaltă/prietenoasă
            utterance.rate = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };
            utterance.onerror = (e) => {
                console.warn("Eroare la redarea vocii native:", e);
                setIsSpeaking(false);
                resolve(); // Mergem mai departe chiar și la eroare
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    // INIȚIALIZARE ȘI TREZIRE
    const wakeUpRobot = async () => {
        setIsAwake(true);
        requestWakeLock();
        setMessage("Salut! Sistem activat.");
        await speak("Sistem activat.", 'ro-RO');
        connectWebSocket();
    };

    const connectWebSocket = () => {
        const wsUrl = `ws://192.168.1.131:8080/ws_game`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setMessage('Conectat la Server 🟢');
            ws.send(JSON.stringify({
                type: "JOIN",
                role: "ROBOT",
                username: "robot",
                accessCode: "GLOBAL"
            }));
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'VOICE_HINT' && data.message) {
                    setMessage(data.message);
                    const lang = data.lang || 'ro-RO';
                    await speak(data.message, lang);
                }
                if (data.type === 'ROBOT_DISPATCHED' && data.studentData) {
                    setIsDispatched(true); // Activăm ecranul verde
                    setTargetStudent(data.studentData); // Salvăm datele elevului țintă
                    const text = `Atenție ${data.studentData.studentName}, mă îndrept spre tine!`;
                    setMessage(text);
                    await speak(text, 'ro-RO');
                }
                if (data.type === 'ROBOT_EMOTE') {
                    console.log(`Declanșare Emote ID: ${data.emoteId}`);

                    // 1. Facem cererea HTTP către ESP32 să miște fizic mașinuța
                    fetch(`http://${ESP32_IP}/emote?id=${data.emoteId}`)
                        .catch(e => console.warn("Eroare la comunicarea cu ESP32:", e));

                    // 2. Redăm și mesajul vocal asociat cu mișcarea (dacă există)
                    if (data.message) {
                        setMessage(data.message);
                        await speak(data.message, 'ro-RO');
                    }
                }

            } catch (error) {
                console.error("Eroare la parsarea mesajului WS:", error);
            }
        };

        ws.onclose = () => {
            setMessage('Conexiune pierdută 🔴. Reconectare...');
            setTimeout(connectWebSocket, 3000); // Auto-reconectare
        };

        wsRef.current = ws;
    };

    const handleStudentInteraction = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && targetStudent) {

            // 1. Schimbăm IMEDIAT starea pentru a ascunde butonul
            setIsDispatched(false);

            setMessage("Mă gândesc la o soluție...");
            speak("Lasă-mă să mă gândesc la o soluție...");
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

    // Curățăm memoria la închiderea paginii
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const blinkLogic = () => {
            const randomTime = Math.random() * (6000 - 2000) + 2000;
            setTimeout(() => {
                setIsBlinking(true);
                setTimeout(() => {
                    setIsBlinking(false);
                    blinkLogic();
                }, 150); // Durata clipitului
            }, randomTime);
        };
        blinkLogic();
    }, []);
    if (!isAwake) {
        return (
            <div style={styles.container}>
                <button onClick={wakeUpRobot} style={styles.wakeButton}>
                    👆 APASĂ PENTRU A TREZI ROBOTUL
                </button>
            </div>
        );
    }

    

    return (
        <div style={styles.container}>
            {/* ECRANUL DE INTERACȚIUNE (Apare când robotul a fost trimis de prof) */}
            {isDispatched && targetStudent ? (
                <div style={styles.dispatchOverlay}>
                    <h2 style={styles.dispatchText}>Salut, {targetStudent.studentName}!</h2>
                    <p style={styles.dispatchSubtext}>Apasă butonul de mai jos pentru a primi un indiciu.</p>
                    <button onClick={handleStudentInteraction} style={styles.studentInteractBtn}>
                        👋 Apasă-mă!
                    </button>
                </div>
            ) : (
                // FAȚA NORMALĂ (Ochii și gura animate)
                <>
                    <div style={styles.eyesContainer}>
                            <div style={{
                                ...styles.eye,
                                ...(isSpeaking ? styles.eyeSpeaking : {}),
                                ...(isBlinking ? { height: '5px', marginTop: '37px' } : {}) // Clipitul
                            }}></div>
                        <div style={{ 
    ...styles.eye, 
    ...(isSpeaking ? styles.eyeSpeaking : {}),
    ...(isBlinking ? { height: '5px', marginTop: '37px' } : {}) // Clipitul
}}></div>
                    </div>
                    <div style={{ ...styles.mouth, ...(isSpeaking ? styles.mouthSpeaking : {}) }}></div>
                    <div style={styles.subtitle}>{message}</div>
                </>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: '#000000',
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
        fontSize: '20px',
        fontWeight: 'bold',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(52, 152, 219, 0.5)',
        cursor: 'pointer'
    },
    eyesContainer: {
        display: 'flex',
        gap: '60px',
        marginBottom: '40px'
    },
    eye: {
        width: '80px',
        height: '80px',
        backgroundColor: '#00ffcc',
        borderRadius: '50%',
        boxShadow: '0 0 40px #00ffcc',
        transition: 'all 0.1s ease-in-out'
    },
    eyeSpeaking: {
        transform: 'scale(1.2)',
        boxShadow: '0 0 60px #00ffcc, 0 0 20px #fff'
    },
    mouth: {
        width: '40px',
        height: '10px',
        backgroundColor: '#00ffcc',
        borderRadius: '10px',
        boxShadow: '0 0 20px #00ffcc',
        transition: 'all 0.1s ease-in-out',
        opacity: 0.3
    },
    mouthSpeaking: {
        width: '120px',
        height: '40px',
        borderRadius: '20px',
        opacity: 1
    },
    subtitle: {
        position: 'absolute',
        bottom: '40px',
        color: '#34495e',
        fontSize: '16px',
        fontFamily: 'monospace',
        textAlign: 'center',
        width: '80%'
    },

    // --- Stiluri noi pentru ecranul de interacțiune fizică ---
    dispatchOverlay: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        width: '100%',
        height: '100%',
        padding: '20px',
        boxSizing: 'border-box'
    },
    dispatchText: {
        color: '#fcd34d',
        fontSize: '32px',
        fontWeight: '900',
        margin: '0 0 10px 0',
        textAlign: 'center'
    },
    dispatchSubtext: {
        color: '#cbd5e1',
        fontSize: '18px',
        marginBottom: '40px',
        textAlign: 'center'
    },
    studentInteractBtn: {
        padding: '30px 50px',
        fontSize: '28px',
        fontWeight: '900',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5)',
        cursor: 'pointer',
        transition: 'transform 0.1s'
    }
};