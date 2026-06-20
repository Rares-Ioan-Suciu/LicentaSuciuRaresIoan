import React from 'react';
import { useRobotFace } from '../../hooks/useRobotFace';

export const RobotFace: React.FC = () => {
    const {
        hasIntroduced,
        isAwake,
        isSpeaking,
        message,
        emotion,
        isDispatched,
        targetStudent,
        secretCode,
        isBlinking,
        wakeUpRobot,
        introduceRobot,
        introduceRobotBilingual,
        handleStudentInteraction
    } = useRobotFace();

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