import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
        backgroundColor: '#020617',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden'
    },

    gameContainer: {
        width: '100%',
        maxWidth: '1450px',
        height: '85vh',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 40px rgba(34, 211, 238, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        border: '1px solid rgba(34, 211, 238, 0.3)',
        zIndex: 10
    },

    hud: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        background: '#0f172a',
        color: '#22d3ee',
        borderBottom: '2px solid #22d3ee',
        textTransform: 'uppercase',
        letterSpacing: '2px'
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
        backgroundColor: '#000814',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid rgba(34, 211, 238, 0.2)',
        padding: '40px',
        overflow: 'hidden'
    },

    svgVisualContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.8))', // Glow puternic pentru graf
        pointerEvents: 'auto'
    },

    rightColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        minWidth: '420px'
    },

    taskSection: {
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        padding: '25px',
        borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
        overflowY: 'auto'
    },

    chatSection: {
        flex: 0.8,
        backgroundColor: 'rgba(2, 6, 23, 0.5)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderTop: '1px solid rgba(34, 211, 238, 0.1)',
        overflowY: 'auto'
    },

    scoreBox: {
        fontWeight: '900',
        color: '#22d3ee',
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },

    dialogueBox: {
        padding: '18px',
        background: 'rgba(30, 58, 138, 0.3)',
        borderRadius: '12px',
        borderLeft: '4px solid #22d3ee',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
    },

    characterAvatar: {
        width: '55px',
        height: '55px',
        borderRadius: '12px',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '30px',
        border: '1px solid #22d3ee',
        flexShrink: 0
    },

    interactionArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '15px'
    },

    feedbackCorrect: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(6, 78, 59, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        color: '#34d399',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(8px)',
        border: '4px solid #34d399'
    },

    feedbackWrong: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(127, 29, 29, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        color: '#f87171',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(8px)',
        border: '4px solid #f87171'
    },

    menuContainer: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#22d3ee'
    },

    centerText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        letterSpacing: '4px',
        animation: 'pulse 2s infinite'
    }
};

// ACEASTA FUNCȚIE REPARĂ SVG-URILE TALE!
export const injectGlobalStyles = () => {
    const id = 'game-global-styles';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
        /* Forțăm liniile și cercurile din graf să fie vizibile pe negru */
        .svg-visual-container svg line, 
        .svg-visual-container svg path {
            stroke: #22d3ee !important;
            stroke-width: 2.5px !important;
        }
        .svg-visual-container svg circle {
            stroke: #22d3ee !important;
            fill: #0f172a !important;
            stroke-width: 2px !important;
        }
        .svg-visual-container svg text {
            fill: #ffffff !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-weight: bold !important;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};