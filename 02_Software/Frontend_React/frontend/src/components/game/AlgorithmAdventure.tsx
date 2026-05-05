import React, { useState, useEffect, useRef } from 'react';
import { GameService } from '../../services/GameService';
import type { GameLevel, GameTask } from '../../types/game';
import { styles, injectGlobalStyles } from './CSAdventureStyles';

import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import VisualIDTask from './tasks/VisualIDTask';
import DragAndDropTask from './tasks/DragAndDropTask';
import SentenceBuilderTask from './tasks/SentenceBuilderTask';
import confetti from 'canvas-confetti';


import menu_game from '../../assets/cs_intro.jpg';

interface AlgorithmAdventureProps {
    sessionContext?: {
        sessionId: number;
        username: string;
        accessCode: string;
        levelId?: number;
    };
}

const AlgorithmAdventure: React.FC<AlgorithmAdventureProps> = ({ sessionContext }) => {
   
    const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>(
        sessionContext ? 'loading' : 'menu'
    );
    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [currentTasks, setCurrentTasks] = useState<GameTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [integrity, setIntegrity] = useState(0); 

    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);
    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

 
    useEffect(() => {
        injectGlobalStyles();
    }, []);

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


        const connectToUplink = (retryCount = 0) => {
            if (!isComponentMounted) return;

            const ws = new WebSocket("ws://192.168.1.13:8080/ws_game");

            ws.onopen = () => {
                if (!isComponentMounted) { ws.close(); return; }
                console.log("Conexiune stabilită cu backend.");
                setConnectionStatus('connected');

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

    useEffect(() => {
        const handleOffline = () => {
            setConnectionStatus('reconnecting');
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        };

        window.addEventListener('offline', handleOffline);
        return () => window.removeEventListener('offline', handleOffline);
    }, [socket]);

    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);

    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        try {
            const tasks = await GameService.getLevelTasks(levelId);

            const parsedTasks = tasks.map(t => ({
                ...t,
                parsedData: typeof t.taskData === 'string' ? JSON.parse(t.taskData) : t.taskData
            }));
            setCurrentTasks(parsedTasks);

            let startingIndex = 0;
            if (sessionContext) {
                const joinUrl = `http://192.168.1.13:8080/api/sessions/join?code=${sessionContext.accessCode}&name=${sessionContext.username}`;
                const res = await fetch(joinUrl, { method: 'POST' });

                if (res.ok) {
                    const progress = await res.json();
                    startingIndex = progress.currentTaskIndex || 0;
                } else {
                    
                    alert("Sesiunea a fost închisă sau nu mai este valabilă.");
                    localStorage.removeItem('robot_active_session');
                    localStorage.removeItem('robot_student_code');
                    window.location.reload();
                    return; 
                }
            }

            setCurrentTaskIndex(startingIndex);
           
            setIntegrity(Math.min(Math.round((startingIndex / parsedTasks.length) * 100), 100));

            if (startingIndex >= parsedTasks.length && parsedTasks.length > 0) {
                setScreen('result');
            } else {
                setScreen('game');
            }
        } catch (error) {
            console.error("Eroare inițializare sectoare:", error);
            setScreen('menu');
        }
    };

    const handleAnswer = (isCorrect: boolean, answerValue: any) => {
        if (feedback !== 'none' || connectionStatus === 'reconnecting') return;

        const currentTask = currentTasks[currentTaskIndex];

        if (isCorrect) {
              confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#10b981', '#3b82f6', '#fcd34d']
                        });
            setHasErrorOnTask(false);
            const nextIntegrity = Math.min(integrity + 1 / 32 * 100, 100);
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

           
            const expectedAnswer = currentTask.parsedData?.correctAnswer ||
                currentTask.parsedData?.correctOrder?.join(', ') ||
                "Acțiune vizuală corectă";

            let studentAnsText = String(answerValue);
            if (Array.isArray(answerValue)) studentAnsText = answerValue.join(', ');

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
                        correctAnswer: expectedAnswer,     
                        studentAnswer: studentAnsText,     
                        context: currentTask.aiHintContext || "Analizează cerința și graficul aferent."
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
            alert("Solicitare transmisă terminalului central. Așteaptă date de la AI sau Profesor.");
        }
    };

    const renderVisualArea = (task: GameTask) => {
        const taskData = task.parsedData;
        if (taskData && taskData.svgContent) {
            return (
                <div
                    className="svg-visual-container" 
                    style={styles.svgVisualContainer}
                    dangerouslySetInnerHTML={{ __html: taskData.svgContent }}
                />
            );
        }
        return <img src={task.imageUrl || menu_game} alt="Space Sector" style={styles.sceneImage} />;
    };

    

    if (screen === 'loading') return (
        <div style={styles.menuContainer}>
            <div style={styles.centerText}>🛰️ SYNCING SATELLITE UPLINK...</div>
        </div>
    );

    if (screen === 'game' && currentTasks.length > 0) {
        const task = currentTasks[currentTaskIndex];
        return (
            <div style={{ ...styles.container, position: 'relative' }}>

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
                    <div style={styles.hud}>
                        <div style={styles.scoreBox}>
                            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>SYSTEM INTEGRITY:</span> {integrity}%
                        </div>
                        <div style={{ fontWeight: 900, color: '#facc15', marginLeft: '750px' }}>
                            CORE SECTOR: <span style={{ color: '#22d3ee' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                        </div>
                        

                        <button onClick={() => {
                            if (window.confirm("Abandonezi misiunea? Progresul tău e salvat.")) {
                                localStorage.removeItem('robot_active_session');
                                localStorage.removeItem('robot_student_code');
                                window.location.reload();
                            }
                        }} style={{ marginLeft: 'auto', padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            ABORT MISSION
                        </button>
                    </div>

                    <div style={styles.mainGameArea}>
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
    if (screen === 'result'){

           setTimeout(() => {
                    confetti({
                        particleCount: 400,
                        spread: 160,
                        origin: { y: 0.4 },
                        colors: ['#10b981', '#3b82f6', '#fcd34d', '#ef4444', '#a855f7'],
                        zIndex: 10000
                    });
                }, 100);
        
        return (

        
        <div style={{
            ...styles.container,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: '15%' 
        }}>
            <div style={{
                ...styles.resultContainer,
                maxWidth: '500px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '24px',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                backdropFilter: 'blur(20px)'
            }}>
                <h1 style={{
                    fontSize: '2.2rem', 
                    marginBottom: '5px',
                    color: '#22d3ee',
                    letterSpacing: '2px',
                    fontWeight: 900
                }}>
                    MISSION SUCCESS
                </h1>

                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                }}>
                    Sectoare sincronizate.
                </p>

                <div style={{ margin: '30px 0' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#22d3ee',
                        textTransform: 'uppercase',
                        marginBottom: '5px',
                        letterSpacing: '2px',
                        opacity: 0.8
                    }}>
                        Final Integrity
                    </div>
                    <div style={{
                        fontSize: '5rem',
                        fontWeight: 900,
                        color: '#22d3ee',
                        textShadow: '0 0 30px rgba(34, 211, 238, 0.5)',
                        lineHeight: '1'
                    }}>
                        {integrity}%
                    </div>
                </div>

                <button onClick={() => {
                    localStorage.removeItem('robot_active_session');
                    localStorage.removeItem('robot_student_code');
                    window.location.reload();
                }} style={{
                    padding: '14px 40px',
                    background: 'transparent',
                    border: '2px solid #22d3ee',
                    color: '#22d3ee',
                    borderRadius: '50px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    marginTop: '10px'
                }}>
                    RETURN TO BASE
                </button>
            </div>
        </div>
    );
    }
    return null;
};

export default AlgorithmAdventure;