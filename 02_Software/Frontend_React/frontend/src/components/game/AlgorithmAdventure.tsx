import React, { useEffect } from 'react';
import type { GameTask } from '../../types/game';
import { styles, injectGlobalStyles } from './CSAdventureStyles';

import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import VisualIDTask from './tasks/VisualIDTask';
import DragAndDropTask from './tasks/DragAndDropTask';
import SentenceBuilderTask from './tasks/SentenceBuilderTask';
import confetti from 'canvas-confetti';
import menu_game from '../../assets/cs_intro.jpg';

import { useAlgorithmAdventure, type SessionContextData } from '../../hooks/useAlgorithmAdventure';

interface AlgorithmAdventureProps {
    sessionContext?: SessionContextData;
}

const AlgorithmAdventure: React.FC<AlgorithmAdventureProps> = ({ sessionContext }) => {

    const {
        screen,
        currentTasks,
        currentTaskIndex,
        integrity,
        feedback,
        connectionStatus,
        hasErrorOnTask,
        aiFeedback,
        feedbackSource,
        handleAnswer,
        sendHelpRequest
    } = useAlgorithmAdventure(sessionContext);

    useEffect(() => {
        injectGlobalStyles();
    }, []);

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
    if (screen === 'result') {
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