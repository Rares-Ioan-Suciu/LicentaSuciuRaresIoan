import React, { useState, useEffect, useRef } from 'react';
import { GameService } from '../../services/GameService';
import type { GameLevel, GameTask } from '../../types/game';
import { styles } from './AdventureStyles';

import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import VisualIDTask from './tasks/VisualIDTask';
import DragAndDropTask from './tasks/DragAndDropTask';
import SentenceBuilderTask from './tasks/SentenceBuilderTask';

import menuBg from '../../assets/bg_menu_grid.jpeg';
import bakeryBg from '../../assets/bg_bakery_shop.png';
import gendarmeBg from '../../assets/bg_gendarme_street.jpg';
import metroBg from '../../assets/bg_metro_station.jpg';
import louvreBg from '../../assets/bg_louvre_museum.jpg';
import confetti from 'canvas-confetti';

const imageMap: Record<string, string> = {
    "/assets/bg_bakery_shop.png": bakeryBg,
    "/assets/bg_gendarme_street.jpg": gendarmeBg,
    "/assets/bg_metro_station.jpg": metroBg,
    "/assets/bg_louvre_museum.jpg": louvreBg
};

interface FrenchAdventureProps {
    sessionContext?: {
        sessionId: number;
        username: string;
        accessCode: string;
        levelId?: number;
    };
}

const FrenchAdventure: React.FC<FrenchAdventureProps> = ({ sessionContext }) => {
    const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>(
        sessionContext ? 'loading' : 'menu'
    );

    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);
    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [currentTasks, setCurrentTasks] = useState<GameTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);

    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleOffline = () => {
            console.warn("🌐 Browser-ul a pierdut conexiunea la internet!");
            setConnectionStatus('reconnecting');
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };

        const handleOnline = () => {
            console.log("🌐 Internetul a revenit!");
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [socket]);

    useEffect(() => {
     
        if (currentTasks.length > 0 && currentTaskIndex === currentTasks.length - 1) {
            if (socket && socket.readyState === WebSocket.OPEN && sessionContext) {
                console.log("🚨 S-a atins ultimul task! Declanșăm codul pe robot.");
                socket.send(JSON.stringify({
                    type: "SHOW_EXTRACTION_CODE",
                    code: "7392" 
                }));
            }
        }
    }, [currentTaskIndex, currentTasks.length, socket, sessionContext]);

    useEffect(() => {
        const fetchLevelData = async () => {
            try {
                const data = await GameService.getAllLevels();
                if (data && data.length > 0) setLevels(data);
            } catch (error) { console.error("Eroare nivele:", error); }
        };
        fetchLevelData();

        if (!sessionContext) return;
        let isComponentMounted = true;

        const connectWebSocket = (retryCount = 0) => {
            if (!isComponentMounted) return;

            const ws = new WebSocket("ws://localhost:8080/ws_game");

            ws.onopen = () => {
                if (!isComponentMounted) { ws.close(); return; }
                console.log("WebSocket Agent conectat!");
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
                    console.log("Misiune întreruptă de Comandament.");
                    window.location.reload();
                    ws.close();
                    return;
                }

                if (data.type === "BROADCAST_PIN") {
                    setActivePin(data.text);
                }

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
                console.warn("Legătură pierdută cu HQ. Reconectare...");
                setConnectionStatus('reconnecting');

                const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
                reconnectTimeout.current = setTimeout(() => {
                    connectWebSocket(retryCount + 1);
                }, timeout);
            };

            ws.onerror = (err) => {
                console.error("Eroare de semnal:", err);
                ws.close();
            };

            setSocket(ws);
        };

        connectWebSocket(0);

        return () => {
            isComponentMounted = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            setSocket(prev => {
                if (prev && prev.readyState === WebSocket.OPEN) prev.close();
                return null;
            });
        };
    }, [sessionContext]);

    // 3. LOGICĂ PORNIRE MISIUNE
    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        setFeedbackSource(null);
        try {
            const tasks = await GameService.getLevelTasks(levelId);
            setCurrentTasks(tasks);
            setCurrentTaskIndex(0);
            setScore(0);
            setScreen('game');
        } catch (error) { setScreen('menu'); }
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
            const nextScore = score + 100;
            const nextIndex = currentTaskIndex + 1;
            setScore(nextScore);
            setFeedback('correct');
            setAiFeedback("");

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "UPDATE_PROGRESS",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    taskIndex: nextIndex,
                    score: nextScore
                }));
            }

            setTimeout(() => {
                setFeedback('none');
                if (currentTaskIndex < currentTasks.length - 1) {
                    setCurrentTaskIndex(nextIndex);
                } else {
                    setScreen('result');
                }
            }, 1500);
        } else {
            setHasErrorOnTask(true);
            setFeedback('wrong');

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                let correctAnswerStr = "";
                let studentAnswerStr = "";

                switch (currentTask.type) {
                    case 'MultipleChoice':
                        correctAnswerStr = currentTask.parsedData?.correctAnswer;
                        studentAnswerStr = answerValue;
                        break;
                    case 'SentenceBuilder':
                        correctAnswerStr = currentTask.parsedData?.correctOrder?.join(" ");
                        studentAnswerStr = Array.isArray(answerValue) ? answerValue.join(" ") : answerValue;
                        break;
                    case 'DragAndDrop':
                        correctAnswerStr = currentTask.parsedData?.items
                            ?.map((i: any) => `${i.text} -> ${i.category}`).join(", ");
                        studentAnswerStr = "Eroare la maparea categoriilor sub acoperire.";
                        break;
                    case 'VisualID':
                        correctAnswerStr = "Ținta corectă din imagine";
                        studentAnswerStr = "Agentul a scanat o zonă greșită.";
                        break;
                }

                socket.send(JSON.stringify({
                    type: "wrong_answer",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    task: currentTask.requirement,
                    taskIndex: currentTaskIndex,
                    details: {
                        question: currentTask.requirement,
                        correctAnswer: correctAnswerStr,
                        studentAnswer: studentAnswerStr,
                        context: currentTask.aiHintContext || "Focalizare pe protocoale lingvistice."
                    }
                }));
            }
            setTimeout(() => setFeedback('none'), 2000);
        }
    };

    const sendHelpRequest = () => {
        if (connectionStatus === 'reconnecting') {
            alert("Așteptați restabilirea legăturii securizate!");
            return;
        }

        if (socket?.readyState === WebSocket.OPEN && sessionContext) {
            socket.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: sessionContext.username,
                sessionId: sessionContext.sessionId,
                accessCode: sessionContext.accessCode
            }));
            alert("Solicitare de Backup trimisă către HQ!");
        }
    };

    // --- RANDARE ECRANE ---

    if (screen === 'menu') return (
        <div style={styles.container}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px', fontWeight: 900 }}>OPÉRATION CROISSANT 🥐</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.8 }}>Agent, infiltrați-vă în Paris și colectați informații prin limbaj.</p>
                <div style={styles.menuGridWrapper}>
                    <img src={menuBg} alt="Meniu" style={styles.menuImage} />
                    <div style={styles.gridOverlay}>
                        {levels.length > 0 && (
                            <div style={styles.gridCellActive} onClick={() => startLevel(levels[0].id)}>
                                <span style={styles.playBadge}>START MISIUNE</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{levels[0].title}</span>
                            </div>
                        )}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={styles.gridCellLocked}>CLASSIFIED</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (screen === 'loading') return (
        <div style={styles.container}>
            <div style={styles.centerText}>🇫🇷 ENCRYPTING CONNECTION...</div>
        </div>
    );

    if (screen === 'game' && currentTasks.length > 0) {
        const task = currentTasks[currentTaskIndex];
        return (
            <div style={{ ...styles.container, position: 'relative' }}>

                {/* MODAL RECONECTARE */}
                {connectionStatus === 'reconnecting' && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(2, 6, 23, 0.9)', zIndex: 9999,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            padding: '30px 50px', background: '#ef4444', color: 'white',
                            borderRadius: '16px', fontWeight: 'bold', fontSize: '1.3rem',
                            boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
                            ACOPERIRE COMPROMISĂ...<br />
                            <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Restabilire legătură cu HQ, vă rugăm așteptați.</span>
                        </div>
                    </div>
                )}

                {activePin && (
                    <div style={{
                        position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
                        background: '#facc15', border: '3px solid #f59e0b', borderRadius: '50px',
                        padding: '12px 30px', fontWeight: '900', zIndex: 10000, color: '#000',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', gap: '15px', alignItems: 'center'
                    }}>
                        <span>INFORMATIV: {activePin}</span>
                        <button onClick={() => setActivePin(null)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                )}

                <div style={styles.gameContainer}>
                    <div style={styles.hud}>
                        <div style={styles.scoreBox}>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>INTEL GATHERED:</span> {score}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Fază Misiune</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fcd34d' }}>
                                ETAPA <span style={{ color: '#fff' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                            </div>
                        </div>
                    </div>

                    <div style={styles.mainGameArea}>
                        <div style={styles.leftColumn}>
                            <img
                                src={imageMap[task.parsedData?.imageUrl] || bakeryBg}
                                alt="Mission Scene"
                                style={styles.sceneImage}
                            />

                            {task.type === 'VisualID' && (
                                <VisualIDTask
                                    key={`vid-${currentTaskIndex}`}
                                    data={task.parsedData}
                                    onAnswer={(res) => handleAnswer(res, "scan_spot")}
                                    isDisabled={feedback !== 'none'}
                                />
                            )}

                            {feedback === 'correct' && (
                                <div style={styles.feedbackCorrect}>
                                    <div>INTELLIGENCE VALIDATED</div>
                                    <div style={{ fontSize: '1.2rem', marginTop: '10px', fontWeight: '400' }}>BON TRAVAIL, AGENT.</div>
                                </div>
                            )}
                            {feedback === 'wrong' && (
                                <div style={styles.feedbackWrong}>
                                    <div>COVER COMPROMISED</div>
                                    <div style={{ fontSize: '1.2rem', marginTop: '10px', fontWeight: '400' }}>RETRY PROTOCOL.</div>
                                </div>
                            )}
                        </div>

                        <div style={styles.rightColumn}>
                            <div style={styles.taskSection}>
                                <div style={styles.dialogueBox}>
                                    <div style={styles.characterAvatar}>🇫🇷</div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact Local:</h4>
                                        <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
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
                                            onAnswer={(correct) => handleAnswer(correct, "dnd_intel")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}

                                    {task.type === 'SentenceBuilder' && (
                                        <SentenceBuilderTask
                                            key={`sb-${currentTaskIndex}`}
                                            data={task.parsedData}
                                            onAnswer={(correct) => handleAnswer(correct, "sentence_recon")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={styles.chatSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#22d3ee', textTransform: 'uppercase' }}>Canal HQ Securizat</span>
                                    <button
                                        onClick={sendHelpRequest}
                                        disabled={!hasErrorOnTask || connectionStatus === 'reconnecting'}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: hasErrorOnTask ? '#f43f5e' : '#1e293b',
                                            color: 'white',
                                            fontWeight: '800',
                                            fontSize: '0.7rem',
                                            cursor: hasErrorOnTask ? 'pointer' : 'not-allowed',
                                            boxShadow: hasErrorOnTask ? '0 4px 12px rgba(244, 63, 94, 0.3)' : 'none'
                                        }}
                                    >
                                        REQUEST BACKUP
                                    </button>
                                </div>

                                {aiFeedback ? (
                                    <div style={{
                                        padding: '14px 18px',
                                        background: '#fff',
                                        borderRadius: '16px',
                                        borderLeft: `6px solid ${feedbackSource === 'TEACHER' ? '#10b981' : '#3b82f6'}`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '1.1rem' }}>
                                                {feedbackSource === 'TEACHER' ? '👨‍🏫' : (feedbackSource === 'ROBOT' ? '🤖' : '✨')}
                                            </span>
                                            <b style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {feedbackSource === 'TEACHER' ? "Profesor HQ" : "Sistem Analiză AI"}
                                            </b>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.98rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 500 }}>
                                            {aiFeedback}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '15px', textAlign: 'center', color: '#64748b',
                                        fontSize: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '12px'
                                    }}>
                                        Se așteaptă semnal de la HQ...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'result') {
        // Tragem o salvă masivă de confetti când se încarcă ecranul final
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
            <div style={styles.container}>
                <div style={{
                    background: 'white', padding: '60px', borderRadius: '30px',
                    textAlign: 'center', border: '10px solid #f59e0b', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <h1 style={{ fontSize: '3.5rem', color: '#1e293b', fontWeight: 900 }}>MISSION ACCOMPLISHED 🏅</h1>
                    <p style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '30px' }}>Ați asigurat toate datele pentru Comandament. Alarma a fost dezactivată!</p>
                    <div style={{ fontSize: '6rem', fontWeight: 900, color: '#f59e0b', marginBottom: '40px' }}>{score}</div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '18px 50px', background: '#1e293b', color: 'white',
                            border: 'none', borderRadius: '50px', fontWeight: 'bold',
                            fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s'
                        }}
                    >
                        RE-DEPLOY AGENT
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default FrenchAdventure;