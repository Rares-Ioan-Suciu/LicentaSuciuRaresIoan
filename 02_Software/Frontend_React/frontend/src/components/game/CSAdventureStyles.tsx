import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
        backgroundColor: 'transparent' 
    },

    gameContainer: {
        width: '100%',
        maxWidth: '1450px',
        height: '82vh', 
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        border: '2px solid #e2e8f0'
    },

    hud: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 25px',
        background: '#1e293b',
        color: 'white',
        borderBottom: '4px solid #2563eb'
    },

    mainGameArea: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        width: '100%'
    },

    leftColumn: {
        flex: 1.5, 
        backgroundColor: '#ffffff',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '2px solid #f1f5f9',
        padding: '20px',
        overflow: 'hidden'
    },

    svgVisualContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto'
    },

    sceneImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },

    rightColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        minWidth: '380px'
    },

    taskSection: {
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        borderBottom: '2px solid #e2e8f0',
        overflowY: 'auto'
    },

    chatSection: {
        flex: 0.8,
        backgroundColor: '#fff',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderTop: '1px solid #e2e8f0',
        overflowY: 'auto'
    },

    scoreBox: {
        fontWeight: '900',
        color: '#60a5fa',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    dialogueBox: {
        padding: '15px',
        background: '#eff6ff',
        borderRadius: '12px',
        borderLeft: '5px solid #2563eb',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },

    characterAvatar: {
        width: '45px',
        height: '45px',
        borderRadius: '10px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        border: '2px solid #2563eb',
        flexShrink: 0
    },

    interactionArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '12px'
    },

    feedbackCorrect: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(16, 185, 129, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: 'white',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(4px)'
    },

    feedbackWrong: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(239, 68, 68, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: 'white',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(4px)'
    },

    resultContainer: {
        textAlign: 'center',
        background: 'white',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        border: '4px solid #2563eb',
        maxWidth: '500px'
    },

    centerText: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '1.2rem',
        color: '#64748b',
        fontWeight: '700'
    }
};