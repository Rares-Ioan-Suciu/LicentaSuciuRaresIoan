    import React, { useState, useEffect } from 'react';
    import { GameService } from '../../services/GameService';
    import type { GameLevel, GameTask } from '../../types/game';
    import { styles } from './AdventureStyles';

    import MultipleChoiceTask from './tasks/MultipleChoiceTask';
    import VisualIDTask from './tasks/VisualIDTask';
    import DragAndDropTask from './tasks/DragAndDropTask';
    import SentenceBuilderTask from './tasks/SentenceBuilderTask';

    import menuBg from '../../assets/bg_menu_grid.jpeg';
    import bakeryBg from '../../assets/bg_bakery_shop.png';

    interface FrenchAdventureProps {
        sessionContext?: {
            sessionId: number;
            username: string;
            accessCode: string;
            levelId?: number;
        };
    }

    const FrenchAdventure: React.FC<FrenchAdventureProps> = ({ sessionContext }) => {
        const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>('menu');
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
                    if (data && data.length > 0) setLevels(data);
                } catch (error) { console.error("Eroare nivele:", error); }
            };
            fetchLevelData();

            ws.onopen = () => {
                console.log("WebSocket Elev conectat");
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
                    console.log("FrenchAdventure oprește emisia.");
                    window.location.reload()
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

            setSocket(ws);
            return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
        }, [sessionContext]);

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
                            studentAnswerStr = "Plasare incorectă a elementelor în categorii.";
                            break;
                        case 'VisualID':
                            correctAnswerStr = "Elementul corect din imagine";
                            studentAnswerStr = "Elevul a apăsat în zona greșită a imaginii.";
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
                            context: currentTask.aiHintContext || "Focalizează-te pe gramatică și vocabular."
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
                alert("Cererea de ajutor a fost trimisă profesorului!");
            }
        };
        
        if (screen === 'menu') return (
            <div style={styles.menuContainer}>
                <h2 style={styles.menuTitle}><span></span> Aventures en Français</h2>
                <div style={styles.menuGridWrapper}>
                    <img src={menuBg} alt="Meniu" style={styles.menuImage} />
                    <div style={styles.gridOverlay}>
                        {[...Array(8)].map((_, i) => <div key={i} style={styles.gridCellLocked}>Bientôt...</div>)}
                        {levels.length > 0 && (
                            <div style={styles.gridCellActive} onClick={() => startLevel(levels[0].id)}>
                                <span style={styles.playBadge}>▶ Joacă</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{levels[0].title}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

        if (screen === 'loading') return <div style={styles.menuContainer}><div style={styles.centerText}>🇫🇷 Préparation...</div></div>;

        if (screen === 'game' && currentTasks.length > 0) {
            const task = currentTasks[currentTaskIndex];
            return (
                <div style={{ ...styles.container, position: 'relative' }}>

                    {activePin && (
                        <div style={{
                            position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
                            background: '#facc15', border: '3px solid #f59e0b', borderRadius: '50px',
                            padding: '12px 30px', fontWeight: '900', zIndex: 10000, color: '#000',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', gap: '15px', alignItems: 'center'
                        }}>
                            <span>Anunț: {activePin}</span>
                            <button onClick={() => setActivePin(null)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                    )}

                    <div style={styles.gameContainer}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '15px 25px',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            marginBottom: '20px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 8px 15px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#fef3c7', padding: '8px 15px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#92400e' }}>{score}</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Progres Joc</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a' }}>
                                    Etapa <span style={{ color: '#2563eb' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                                </div>
                            </div>
                        </div>

                        <div style={styles.mainGameArea}>
                            <div style={styles.leftColumn}>
                                <img src={bakeryBg} alt="Bakery Scene" style={styles.sceneImage} />

                                {task.type === 'VisualID' && (
                                    <VisualIDTask
                                        key={`vid-${currentTaskIndex}`}
                                        data={task.parsedData}
                                        onAnswer={(res) => handleAnswer(res, "click_zone")}
                                        isDisabled={feedback !== 'none'}
                                    />
                                )}

                                {feedback === 'correct' && <div style={styles.feedbackCorrect}>C'EST BIEN!</div>}
                                {feedback === 'wrong' && (
                                    <div style={styles.feedbackWrong}>
                                        <div style={{ marginBottom: '10px' }}>DOMMAGE!</div>
                                    </div>
                                )}
                            </div>

                            <div style={styles.rightColumn}>
                                <div style={styles.taskSection}>
                                    <div style={styles.dialogueBox}>
                                        <div style={styles.characterAvatar}>👨‍🍳</div>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '0.8rem' }}>Cerință:</h4>
                                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
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
                                                onAnswer={(correct) => handleAnswer(correct, "sentence_complete")}
                                                isDisabled={feedback !== 'none'}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div style={styles.chatSection}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e3a8a' }}>Chat pentru sfaturi</span>
                                        <button
                                            onClick={sendHelpRequest}
                                            disabled={!hasErrorOnTask}
                                            style={{
                                                padding: '8px 15px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                backgroundColor: hasErrorOnTask ? '#f43f5e' : '#e2e8f0',
                                                color: hasErrorOnTask ? 'white' : '#94a3b8',
                                                fontWeight: '800',
                                                fontSize: '0.65rem',
                                                cursor: hasErrorOnTask ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s ease',
                                                boxShadow: hasErrorOnTask ? '0 4px 10px rgba(244, 63, 94, 0.3)' : 'none'
                                            }}
                                        >
                                            {hasErrorOnTask ? "Cere ajutor" : "Disponibil doar la greșeală"}
                                        </button>
                                    </div>

                                   
                                    {aiFeedback ? (
                                        <div style={{
                                            padding: '12px 16px',
                                            background: feedbackSource === 'TEACHER' ? '#f0fdf4' : '#ffffff',
                                            borderRadius: '16px',
                                            border: `1px solid ${feedbackSource === 'TEACHER' ? '#bbf7d0' : '#e2e8f0'}`,
                                            borderLeft: `6px solid ${feedbackSource === 'TEACHER' ? '#10b981' : (feedbackSource === 'ROBOT' ? '#3b82f6' : '#7c3aed')}`,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: '10px', left: '-10px',
                                                width: 0, height: 0,
                                                borderTop: '10px solid transparent',
                                                borderBottom: '10px solid transparent',
                                                borderRight: `10px solid ${feedbackSource === 'TEACHER' ? '#bbf7d0' : '#e2e8f0'}`
                                            }} />

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '1rem' }}>
                                                    {feedbackSource === 'TEACHER' ? '👨‍🏫' : (feedbackSource === 'ROBOT' ? '🤖' : '✨')}
                                                </span>
                                                <b style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {feedbackSource === 'TEACHER' ? "Profesorul tău" : (feedbackSource === 'ROBOT' ? "Indiciu Rapid" : "Asistent AI")}
                                                </b>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 500 }}>
                                                {aiFeedback}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '20px', textAlign: 'center', color: '#94a3b8',
                                            fontSize: '0.85rem', border: '2px dashed #f1f5f9', borderRadius: '16px'
                                        }}>
                                            Aici vor apărea sfaturi atunci când ai nevoie.
                                        </div>
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
                    <h1>FÉLICITATIONS!</h1>
                    <p>Aventura la Boulangerie s-a încheiat cu succes.</p>
                    <div style={styles.finalScore}>{score}</div>
                    <button onClick={() => setScreen('menu')} style={styles.menuBtn}>RETOUR AU MENU</button>
                </div>
            </div>
        );

        return null;
    };

    export default FrenchAdventure;