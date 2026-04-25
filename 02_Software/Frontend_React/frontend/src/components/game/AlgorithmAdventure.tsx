import React, { useState, useEffect, useRef } from 'react';
import { GameService } from '../../services/GameService';
import type { GameLevel, GameTask } from '../../types/game';
import { styles, injectGlobalStyles } from './CSAdventureStyles';

// Importul componentelor pentru tipurile de task-uri (Quiz, Vizual, Drag&Drop, Construire Propoziții)
import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import VisualIDTask from './tasks/VisualIDTask';
import DragAndDropTask from './tasks/DragAndDropTask';
import SentenceBuilderTask from './tasks/SentenceBuilderTask';

// Imagine de fallback pentru meniu
import menu_game from '../../assets/cs_intro.jpg';

interface AlgorithmAdventureProps {
    sessionContext?: {
        sessionId: number;
        username: string;
        accessCode: string;
        levelId?: number;
    };
}

/**
 * AlgorithmAdventure - Simulator Spațial de Grafuri
 * Poveste: Restaurarea conexiunii cu un satelit prin repararea nodurilor rețelei.
 */
const AlgorithmAdventure: React.FC<AlgorithmAdventureProps> = ({ sessionContext }) => {
    // --- 1. STĂRI DE NAVIGARE ȘI DATE ---
    const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>(
        sessionContext ? 'loading' : 'menu'
    );
    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [currentTasks, setCurrentTasks] = useState<GameTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [integrity, setIntegrity] = useState(0); // Scorul tematic: Integritatea Sistemului (%)

    // --- 2. COMUNICAȚII ȘI FEEDBACK ---
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);
    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    // --- 3. RECONECTARE ȘI SIGURANȚĂ REȚEA ---
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- EFECT: ACTIVARE STILURI GLOBALE (Fix Vizibilitate SVG) ---
    useEffect(() => {
        injectGlobalStyles(); // Forțează grafurile negre să devină Cyan/Alb pe fundalul întunecat
    }, []);

    // --- EFECT: ENGINE WEBSOCKET CU AUTO-RECONNECT ---
    useEffect(() => {
        const fetchLevelData = async () => {
            try {
                const data = await GameService.getAllLevels();
                if (data) setLevels(data);
            } catch (error) {
                console.error("[MISSION CONTROL] Eroare critică la încărcarea nivelelor:", error);
            }
        };
        fetchLevelData();

        if (!sessionContext) return;
        let isComponentMounted = true;

        /**
         * Inițializează și monitorizează legătura cu serverul
         */
        const connectToUplink = (retryCount = 0) => {
            if (!isComponentMounted) return;

            const ws = new WebSocket("ws://localhost:8080/ws_game");

            ws.onopen = () => {
                if (!isComponentMounted) { ws.close(); return; }
                console.log("📡 [UPLINK] Conexiune stabilită cu Mission Control.");
                setConnectionStatus('connected');

                // Autentificăm terminalul elevului
                ws.send(JSON.stringify({
                    type: "JOIN",
                    role: "STUDENT",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode
                }));
            };

            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);

                if (data.type === "SESSION_TERMINATED") {
                    console.log("Sesiune închisă de comandament.");
                    window.location.reload();
                    return;
                }

                if (data.type === "BROADCAST_PIN") setActivePin(data.text);

                // Procesăm feedback-ul primit de la AI sau Profesor
                if (data.type === "ai_feedback") {
                    setAiFeedback(data.message);
                    setFeedbackSource('AI');
                } else if (data.type === "robot_feedback") {
                    setAiFeedback(data.message);
                    setFeedbackSource('ROBOT');
                } else if (data.type === "teacher_reply") {
                    setAiFeedback(data.message);
                    setFeedbackSource('TEACHER');
                }
            };

            ws.onclose = () => {
                if (!isComponentMounted) return;
                console.warn("⚠️ [SIGNAL LOST] Re-stabilire legătură...");
                setConnectionStatus('reconnecting');

                // Algoritm de așteptare exponențială (1s, 2s, 4s... max 10s)
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                reconnectTimeout.current = setTimeout(() => connectToUplink(retryCount + 1), delay);
            };

            ws.onerror = (err) => {
                console.error("[CIRCUIT BREAKER] Eroare WebSocket:", err);
                ws.close();
            };

            setSocket(ws);
        };

        connectToUplink(0);

        return () => {
            isComponentMounted = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        };
    }, [sessionContext]);

    // --- EFECT: DETECTOR NATIV DE BROWSER (PENTRU WI-FI OPRIT) ---
    useEffect(() => {
        const handleOffline = () => {
            setConnectionStatus('reconnecting');
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        };

        window.addEventListener('offline', handleOffline);
        return () => window.removeEventListener('offline', handleOffline);
    }, [socket]);

    // --- EFECT: PORNIRE AUTOMATĂ NIVEL DIN CONTEXT ---
    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);

    // --- LOGICĂ JOC ---
    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        try {
            const tasks = await GameService.getLevelTasks(levelId);
            // Parsăm datele SVG și JSON din DB
            const parsedTasks = tasks.map(t => ({
                ...t,
                parsedData: typeof t.taskData === 'string' ? JSON.parse(t.taskData) : t.taskData
            }));
            setCurrentTasks(parsedTasks);
            setCurrentTaskIndex(0);
            setIntegrity(0);
            setScreen('game');
        } catch (error) {
            console.error("Eroare inițializare sectoare:", error);
            setScreen('menu');
        }
    };

    const handleAnswer = (isCorrect: boolean, answerValue: any) => {
        if (feedback !== 'none' || connectionStatus === 'reconnecting') return;

        const currentTask = currentTasks[currentTaskIndex];

        if (isCorrect) {
            setHasErrorOnTask(false);
            const nextIntegrity = Math.min(integrity + 10, 100);
            const nextIndex = currentTaskIndex + 1;

            setIntegrity(nextIntegrity);
            setFeedback('correct');
            setAiFeedback("");

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "UPDATE_PROGRESS",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    taskIndex: nextIndex,
                    score: nextIntegrity
                }));
            }

            setTimeout(() => {
                setFeedback('none');
                if (currentTaskIndex < currentTasks.length - 1) setCurrentTaskIndex(nextIndex);
                else setScreen('result');
            }, 1500);
        } else {
            setHasErrorOnTask(true);
            setFeedback('wrong');

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "wrong_answer",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    task: currentTask.requirement,
                    taskIndex: currentTaskIndex,
                    details: {
                        question: currentTask.requirement,
                        correctAnswer: "Check graph node consistency",
                        studentAnswer: "Data parity error on node selection",
                        context: currentTask.aiHintContext || "Analizează conexiunile nodurilor."
                    }
                }));
            }
            setTimeout(() => setFeedback('none'), 2000);
        }
    };

    const sendHelpRequest = () => {
        if (connectionStatus === 'reconnecting') return;
        if (socket?.readyState === WebSocket.OPEN && sessionContext) {
            socket.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: sessionContext.username,
                sessionId: sessionContext.sessionId,
                accessCode: sessionContext.accessCode
            }));
            alert("🚨 Solicitare transmisă terminalului central. Așteaptă date de la AI sau Profesor.");
        }
    };

    const renderVisualArea = (task: GameTask) => {
        const taskData = task.parsedData;
        if (taskData && taskData.svgContent) {
            return (
                <div
                    className="svg-visual-container" // Clasa critică pentru injectGlobalStyles
                    style={styles.svgVisualContainer}
                    dangerouslySetInnerHTML={{ __html: taskData.svgContent }}
                />
            );
        }
        return <img src={task.imageUrl || menu_game} alt="Space Sector" style={styles.sceneImage} />;
    };

    // --- RENDER SCREEN: MENU ---
    if (screen === 'menu') return (
        <div style={styles.menuContainer}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', fontWeight: 900, letterSpacing: '4px' }}>
                🌌 MISSION CONTROL
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {levels.map(l => (
                    <button key={l.id} onClick={() => startLevel(l.id)} style={{ padding: '20px 40px', background: '#22d3ee', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
                        INITIATE: {l.title}
                    </button>
                ))}
            </div>
        </div>
    );

    // --- RENDER SCREEN: LOADING ---
    if (screen === 'loading') return (
        <div style={styles.menuContainer}>
            <div style={styles.centerText}>🛰️ SYNCING SATELLITE UPLINK...</div>
        </div>
    );

    // --- RENDER SCREEN: MAIN GAME ---
    if (screen === 'game' && currentTasks.length > 0) {
        const task = currentTasks[currentTaskIndex];
        return (
            <div style={{ ...styles.container, position: 'relative' }}>

                {/* BANNER DE SIGURANȚĂ (RECONECTARE) */}
                {connectionStatus === 'reconnecting' && (
                    <div style={{
                        position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)',
                        zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            padding: '40px 60px', background: '#ef4444', color: 'white',
                            borderRadius: '16px', border: '2px solid #fff', textAlign: 'center',
                            boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📡⚡</div>
                            <b style={{ fontSize: '1.6rem', letterSpacing: '2px' }}>CRITICAL: SIGNAL LOST</b><br />
                            <p style={{ marginTop: '10px', opacity: 0.8 }}>Attempting to re-establish secure uplink...</p>
                        </div>
                    </div>
                )}

                <div style={styles.gameContainer}>
                    {/* BARA DE STATUS (HUD) */}
                    <div style={styles.hud}>
                        <div style={styles.scoreBox}>
                            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>SYSTEM INTEGRITY:</span> {integrity}%
                        </div>
                        <div style={{ fontWeight: 900, color: '#facc15' }}>
                            CORE SECTOR: <span style={{ color: '#22d3ee' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                        </div>
                    </div>

                    <div style={styles.mainGameArea}>
                        {/* COLOANA STÂNGA: VIZUALIZARE GRAF (SVG) */}
                        <div style={styles.leftColumn}>
                            {renderVisualArea(task)}

                            {task.type === 'VisualID' && (
                                <VisualIDTask
                                    key={`vid-${currentTaskIndex}`}
                                    data={task.parsedData}
                                    onAnswer={(res) => handleAnswer(res, "sector_scan")}
                                    isDisabled={feedback !== 'none'}
                                />
                            )}

                            {/* FEEDBACK TEMATIC SUPRAPUS */}
                            {feedback === 'correct' && (
                                <div style={styles.feedbackCorrect}>
                                    <div style={{ letterSpacing: '4px' }}>UPLINK STABLE</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '400', marginTop: '10px' }}>DATA PACKET SYNCHRONIZED</div>
                                </div>
                            )}
                            {feedback === 'wrong' && (
                                <div style={styles.feedbackWrong}>
                                    <div style={{ letterSpacing: '4px' }}>BREACH DETECTED</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '400', marginTop: '10px' }}>CORRUPTED DATA STREAM</div>
                                </div>
                            )}
                        </div>

                        {/* COLOANA DREAPTĂ: INSTRUCȚIUNI ȘI COMUNICARE */}
                        <div style={styles.rightColumn}>
                            <div style={styles.taskSection}>
                                <div style={styles.dialogueBox}>
                                    <div style={styles.characterAvatar}>👩‍🚀</div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#22d3ee', fontSize: '0.7rem', textTransform: 'uppercase' }}>Mission Control:</h4>
                                        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: '1.4' }}>
                                            {task.requirement}
                                        </p>
                                    </div>
                                </div>

                                <div style={styles.interactionArea}>
                                    {task.type === 'MultipleChoice' && (
                                        <MultipleChoiceTask
                                            key={`mc-${currentTaskIndex}`}
                                            data={task.parsedData}
                                            onAnswer={(ans) => handleAnswer(ans === task.parsedData.correctAnswer, ans)}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                    {task.type === 'DragAndDrop' && (
                                        <DragAndDropTask
                                            key={`dnd-${currentTaskIndex}`}
                                            data={task.parsedData}
                                            onAnswer={(correct) => handleAnswer(correct, "dnd_uplink")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                    {task.type === 'SentenceBuilder' && (
                                        <SentenceBuilderTask
                                            key={`sb-${currentTaskIndex}`}
                                            data={task.parsedData}
                                            onAnswer={(correct) => handleAnswer(correct, "logic_rebuild")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* PANEL CHAT / ASISTENȚĂ AI */}
                            <div style={styles.chatSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#22d3ee', textTransform: 'uppercase' }}>Encrypted Terminal</span>
                                    <button
                                        onClick={sendHelpRequest}
                                        disabled={!hasErrorOnTask || connectionStatus === 'reconnecting'}
                                        style={{
                                            padding: '8px 14px', borderRadius: '8px', border: 'none',
                                            backgroundColor: hasErrorOnTask ? '#f43f5e' : '#1e293b',
                                            color: 'white', fontWeight: '800', fontSize: '0.65rem',
                                            cursor: hasErrorOnTask ? 'pointer' : 'not-allowed',
                                            boxShadow: hasErrorOnTask ? '0 0 15px rgba(244, 63, 94, 0.4)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        SOS ASSISTANCE
                                    </button>
                                </div>

                                {aiFeedback ? (
                                    <div style={{
                                        padding: '14px', background: 'rgba(34, 211, 238, 0.08)',
                                        borderRadius: '12px', borderLeft: '4px solid #22d3ee',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                                            <b style={{ color: '#22d3ee', fontSize: '0.7rem', textTransform: 'uppercase' }}>[{feedbackSource}]:</b> {aiFeedback}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', border: '1px dashed #1e293b', padding: '20px', borderRadius: '12px' }}>
                                        WAITING FOR DATA INPUT ANALYSIS...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER SCREEN: MISSION COMPLETE ---
    if (screen === 'result') return (
        <div style={styles.container}>
            <div style={styles.resultContainer}>
                <div style={{ fontSize: '5rem', marginBottom: '25px' }}>🛰️✨</div>
                <h1 style={{ fontSize: '2.8rem', marginBottom: '10px', color: '#22d3ee', letterSpacing: '2px' }}>
                    MISSION SUCCESS
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>All satellite sectors are operational and synced.</p>

                <div style={{ margin: '45px 0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#22d3ee', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Final Integrity Level</div>
                    <div style={{ fontSize: '6rem', fontWeight: 900, color: '#22d3ee', textShadow: '0 0 40px rgba(34, 211, 238, 0.7)' }}>
                        {integrity}%
                    </div>
                </div>

                <button onClick={() => setScreen('menu')} style={{
                    padding: '18px 50px', background: 'transparent', border: '2px solid #22d3ee',
                    color: '#22d3ee', borderRadius: '50px', fontWeight: '900', cursor: 'pointer',
                    transition: 'all 0.3s ease', letterSpacing: '3px', textTransform: 'uppercase'
                }}>
                    RETURN TO BASE
                </button>
            </div>
        </div>
    );

    return null;
};

export default AlgorithmAdventure;