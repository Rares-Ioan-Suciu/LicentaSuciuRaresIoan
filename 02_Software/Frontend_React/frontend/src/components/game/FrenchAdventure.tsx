import React from 'react';
import type { GameTask } from '../../types/game';
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

import { useFrenchAdventure, type SessionContextData } from '../../hooks/useFrenchAdventure';

const imageMap: Record<string, string> = {
    "/assets/bg_bakery_shop.png": bakeryBg,
    "/assets/bg_gendarme_street.jpg": gendarmeBg,
    "/assets/bg_metro_station.jpg": metroBg,
    "/assets/bg_louvre_museum.jpg": louvreBg
};

interface FrenchAdventureProps {
    sessionContext?: SessionContextData;
}

const FrenchAdventure: React.FC<FrenchAdventureProps> = ({ sessionContext }) => {
    const {
        screen,
        currentTasks,
        currentTaskIndex,
        score,
        feedback,
        connectionStatus,
        hasErrorOnTask,
        activePin,
        setActivePin,
        aiFeedback,
        feedbackSource,
        handleAnswer,
        sendHelpRequest
    } = useFrenchAdventure(sessionContext);

    if (screen === 'loading') return (
        <div style={styles.container}>
            <div style={styles.centerText}>ENCRYPTING CONNECTION...</div>
        </div>
    );

    if (screen === 'game' && currentTasks.length > 0) {
        const task = currentTasks[currentTaskIndex];
        return (
            <div style={{ ...styles.container, position: 'relative' }}>

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
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Mission state</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fcd34d' }}>
                                State <span style={{ color: '#fff' }}>{currentTaskIndex + 1}</span> / {currentTasks.length}
                            </div>
                        </div>
                        <button onClick={() => {
                            if (window.confirm("Voulez-vous quitter? Progresul e salvat.")) {
                                localStorage.removeItem('robot_active_session');
                                localStorage.removeItem('robot_student_code');
                                window.location.reload();
                            }
                        }} style={{ marginLeft: '20px', padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            QUITTER
                        </button>
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
                                    <div>RENSEIGNEMENTS VALIDÉS</div>
                                    <div style={{ fontSize: '1.2rem', marginTop: '10px', fontWeight: '400' }}>BON TRAVAIL, AGENT.</div>
                                </div>
                            )}
                            {feedback === 'wrong' && (
                                <div style={styles.feedbackWrong}>
                                    <div>COUVERTURE COMPROMISE</div>
                                    <div style={{ fontSize: '1.2rem', marginTop: '10px', fontWeight: '400' }}>PROTOCOLE DE RÉESSAI.</div>
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
                                        DEMANDER DES RENFORTS
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
                    <h1 style={{ fontSize: '3.5rem', color: '#1e293b', fontWeight: 900 }}>Mission réussie ! 🏅</h1>
                    <p style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '30px' }}>Ați asigurat toate datele pentru Comandament. Alarma a fost dezactivată!</p>
                    <div style={{ fontSize: '6rem', fontWeight: 900, color: '#f59e0b', marginBottom: '40px' }}>{score}</div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('robot_active_session');
                            localStorage.removeItem('robot_student_code');
                            window.location.reload();
                        }}
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