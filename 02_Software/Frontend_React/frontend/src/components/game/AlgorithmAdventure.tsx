import React, { useState, useEffect } from 'react';
import { GameService } from '../../services/GameService';
import type { GameLevel, GameTask } from '../../types/game';
import { styles } from './CSAdventureStyles';

import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import VisualIDTask from './tasks/VisualIDTask';
import DragAndDropTask from './tasks/DragAndDropTask';
import SentenceBuilderTask from './tasks/SentenceBuilderTask';

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
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);

    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080/ws_game");

        const fetchLevelData = async () => {
            try {
                const data = await GameService.getAllLevels();
                if (data) setLevels(data);
            } catch (error) { console.error("Eroare incarcare nivele:", error); }
        };
        fetchLevelData();

        ws.onopen = () => {
            console.log("WebSocket Algorithm Elev conectat");
            if (sessionContext) {
                ws.send(JSON.stringify({
                    type: "JOIN",
                    role: "STUDENT",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode
                }));
            }
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "SESSION_TERMINATED") {
                window.location.reload();
                ws.close();
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

        setSocket(ws);
        return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
    }, [sessionContext]);

    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            console.log("Auto-starting level ID:", sessionContext.levelId);
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);

    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        setFeedbackSource(null);
        try {
            const tasks = await GameService.getLevelTasks(levelId);
            const parsedTasks = tasks.map(t => ({
                ...t,
                parsedData: typeof t.taskData === 'string' ? JSON.parse(t.taskData) : t.taskData
            }));
            setCurrentTasks(parsedTasks);
            setCurrentTaskIndex(0);
            setScore(0);
            setScreen('game');
        } catch (error) {
            console.error("Eroare la incarcarea task-urilor:", error);
            setScreen('menu');
        }
    };

    const handleAnswer = (isCorrect: boolean, answerValue: any) => {
        if (feedback !== 'none') return;
        const currentTask = currentTasks[currentTaskIndex];

        if (isCorrect) {
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
                socket.send(JSON.stringify({
                    type: "wrong_answer",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    task: currentTask.requirement,
                    taskIndex: currentTaskIndex,
                    details: {
                        question: currentTask.requirement,
                        correctAnswer: "Analizeaza proprietatile grafului",
                        studentAnswer: "Raspuns incorect la cerinta vizuala/teoretica",
                        context: currentTask.aiHintContext || "Focalizeaza-te pe algoritmi si grafuri."
                    }
                }));
            }
            setTimeout(() => setFeedback('none'), 2000);
        }
    };

    const sendHelpRequest = () => {
        if (socket?.readyState === WebSocket.OPEN && sessionContext) {
            socket.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: sessionContext.username,
                sessionId: sessionContext.sessionId,
                accessCode: sessionContext.accessCode
            }));
            alert("Cererea de ajutor a fost trimisa profesorului!");
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

        return <img src={task.imageUrl || menu_game} alt="Algorithm Scene" style={styles.sceneImage} />;
    };
    
    if (screen === 'menu') return (
        <div style={styles.menuContainer}>
            <h2 style={styles.menuTitle}><span>💻</span> Joc Informatică</h2>
            <div style={styles.menuGridWrapper}>
                <img src={menu_game} alt="Meniu Fundal" style={styles.menuImage} />
                <div style={styles.gridOverlay}>
                    {levels.map((level) => (
                        <div key={level.id} style={styles.gridCellActive} onClick={() => startLevel(level.id)}>
                            <span style={styles.playBadge}>▶ Joacă</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', padding: '0 5px' }}>
                                {level.title}
                            </span>
                        </div>
                    ))}
                    {[...Array(Math.max(0, 9 - levels.length))].map((_, i) => (
                        <div key={`locked-${i}`} style={styles.gridCellLocked}>In curand...</div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (screen === 'loading') return (
        <div style={styles.menuContainer}>
            <div style={styles.centerText}>⚙️ Se încarcă jocul...</div>
        </div>
    );

    if (screen === 'game' && currentTasks.length > 0) {
        const task = currentTasks[currentTaskIndex];
        return (
            <div style={styles.container}>
                <div style={styles.gameContainer}>
                    <div style={styles.hud}>
                        <div style={styles.scoreBox}>{score}</div>
                        <div style={{ fontWeight: 900 }}>
                            ETAPA <span style={{ color: '#60a5fa' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                        </div>
                    </div>

                    <div style={styles.mainGameArea}>
                        <div style={styles.leftColumn}>
                            {renderVisualArea(task)}

                            {task.type === 'VisualID' && (
                                <VisualIDTask
                                    key={`vid-${currentTaskIndex}`}
                                    data={task.parsedData}
                                    onAnswer={(res) => handleAnswer(res, "visual_click")}
                                    isDisabled={feedback !== 'none'}
                                />
                            )}

                            {feedback === 'correct' && <div style={styles.feedbackCorrect}>Răspuns Perfect</div>}
                            {feedback === 'wrong' && <div style={styles.feedbackWrong}>Greșit</div>}
                        </div>

                        <div style={styles.rightColumn}>
                            <div style={styles.taskSection}>
                                <div style={styles.dialogueBox}>
                                    <div style={styles.characterAvatar}>🤖</div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#2563eb', fontSize: '0.75rem' }}>Cerință:</h4>
                                        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
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
                                            onAnswer={(correct) => handleAnswer(correct, "dnd")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                    {task.type === 'SentenceBuilder' && (
                                        <SentenceBuilderTask
                                            key={`sb-${currentTaskIndex}`}
                                            data={task.parsedData}
                                            onAnswer={(correct) => handleAnswer(correct, "logic_flow")}
                                            isDisabled={feedback !== 'none'}
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={styles.chatSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e3a8a' }}>Chat pentru sfaturi</span>
                                    <button
                                         title={hasErrorOnTask ? "Trimite solicitarea către profesor" : "Trebuie să greșești o dată pentru a cere ajutor"}
                                        onClick={sendHelpRequest}
                                        disabled={!hasErrorOnTask}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: hasErrorOnTask ? '#ef4444' : '#cbd5e1',
                                            color: 'white',
                                            fontWeight: '800',
                                            fontSize: '0.7rem',
                                            cursor: hasErrorOnTask ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {hasErrorOnTask ? "Cere ajutor" : "Disponibil doar la greșeală"}
                                    </button>
                                </div>
                                {aiFeedback ? (
                                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b' }}>{aiFeedback}</p>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'result') return (
        <div style={styles.container}>
            <div style={styles.resultContainer}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Misiune reușită! 🏆</h1>
                <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Ai demonstrat că înțelegi grafurile</p>
                <div style={{ ...styles.finalScore, fontSize: '4rem', margin: '30px 0' }}>{score}</div>
                <button onClick={() => setScreen('menu')} style={styles.menuBtn}>Revin-o acasă</button>
            </div>
        </div>
    );

    return null;
};

export default AlgorithmAdventure;