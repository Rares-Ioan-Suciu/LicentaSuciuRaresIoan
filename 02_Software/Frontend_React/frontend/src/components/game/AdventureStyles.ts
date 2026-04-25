import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
    // Fundalul paginii - stil Agent Secret
    container: {
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#020617', // Deep Navy
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px'
    },

    // Tableta de misiune
    gameContainer: {
        width: '95%',
        maxWidth: '1550px',
        height: '88vh',
        backgroundColor: '#fff',
        borderRadius: '24px',
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        border: '4px solid #1e293b'
    },

    // Bara de status a misiunii
    hud: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
        background: '#0f172a',
        color: '#fcd34d', // Amber gold
        borderBottom: '4px solid #f59e0b',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },

    scoreBox: {
        fontWeight: '900',
        color: '#fcd34d',
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textShadow: '0 0 10px rgba(252, 211, 77, 0.3)'
    },

    progressBox: {
        fontSize: '0.9rem',
        color: '#94a3b8',
        fontWeight: '800',
        letterSpacing: '1px'
    },

    mainGameArea: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'row'
    },

    // Zona de observație (imaginea)
    leftColumn: {
        flex: 1.4,
        backgroundColor: '#000',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '3px solid #1e293b'
    },

    sceneImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.9
    },

    // Consola de comandă
    rightColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        minWidth: '400px'
    },

    // Secțiunea de instrucțiuni
    taskSection: {
        flex: 1.1,
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        borderBottom: '2px solid #e2e8f0',
        overflowY: 'auto'
    },

    // Canalul securizat HQ (Chat AI)
    chatSection: {
        height: '35%',
        backgroundColor: '#0f172a',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderTop: '4px solid #1e293b'
    },

    // Dialogue cu informatorul local
    dialogueBox: {
        padding: '20px',
        background: '#fff',
        borderRadius: '16px',
        borderLeft: '8px solid #f59e0b',
        marginBottom: '25px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },

    characterAvatar: {
        width: '55px',
        height: '55px',
        borderRadius: '12px',
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        border: '3px solid #f59e0b',
        flexShrink: 0
    },

    interactionArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '20px'
    },

    // Mesajele de la HQ
    aiBubble: {
        background: 'rgba(30, 58, 138, 0.4)',
        padding: '15px',
        borderRadius: '16px 16px 0 16px',
        border: '1px solid #3b82f6',
        fontSize: '0.95rem',
        color: '#e2e8f0',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        lineHeight: '1.5',
        borderLeft: '4px solid #3b82f6'
    },

    // Feedback Misiune
    feedbackCorrect: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(6, 78, 59, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: '#fff',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(8px)',
        border: '10px solid #10b981',
        textAlign: 'center'
    },

    feedbackWrong: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(127, 29, 29, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: '#fff',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(8px)',
        border: '10px solid #ef4444',
        textAlign: 'center'
    },

    visualIdLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 20,
        cursor: 'crosshair'
    },

    // STILURI PENTRU DRAG AND DROP (DND)
    dndContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        alignItems: 'center'
    },
    itemsPool: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#e2e8f0',
        borderRadius: '16px',
        minHeight: '100px',
        width: '100%',
        border: '2px solid #cbd5e1'
    },
    dragItem: {
        padding: '12px 20px',
        backgroundColor: '#fff',
        border: '2px solid #1e293b',
        borderRadius: '10px',
        cursor: 'grab',
        fontWeight: '700',
        color: '#1e293b',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        userSelect: 'none',
        transition: 'all 0.2s'
    },
    dropZonesContainer: {
        display: 'flex',
        gap: '15px',
        width: '100%',
        justifyContent: 'space-between'
    },
    dropZone: {
        flex: 1,
        minHeight: '160px',
        padding: '15px',
        backgroundColor: '#fff',
        border: '3px dashed #1e293b',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease'
    },
    dropZoneTitle: {
        fontSize: '0.85rem',
        fontWeight: '900',
        color: '#1e293b',
        textTransform: 'uppercase',
        marginBottom: '10px'
    },

    // STILURI PENTRU CONSTRUIRE PROPOZIȚII (SENTENCE)
    sentenceContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        width: '100%',
        alignItems: 'center',
        padding: '10px'
    },
    sentenceDisplay: {
        width: '100%',
        minHeight: '100px',
        padding: '20px',
        backgroundColor: '#fff',
        border: '3px solid #1e293b',
        borderRadius: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
    },
    wordBubble: {
        padding: '12px 22px',
        backgroundColor: '#fff',
        border: '2px solid #f59e0b', // Accent amber
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '800',
        color: '#1e293b',
        fontSize: '1rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 0px #d97706', // Efect de buton 3D
        userSelect: 'none'
    },
    wordBubbleEmpty: {
        padding: '12px 22px',
        backgroundColor: '#f1f5f9',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        color: '#94a3b8',
        cursor: 'not-allowed'
    },

    // MENIUL DE SELECȚIE MISIUNE
    menuGridWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '550px',
        margin: '0 auto',
        aspectRatio: '1/1',
        borderRadius: 30,
        overflow: 'hidden',
        border: '10px solid #1e293b',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
    },
    menuImage: { width: '100%', height: '100%', objectFit: 'cover' },
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '6px',
        padding: '6px',
        background: 'rgba(0,0,0,0.2)'
    },
    gridCellActive: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(245, 158, 11, 0.2)', // Amber tint
        color: '#fff',
        cursor: 'pointer',
        border: '2px solid rgba(252, 211, 77, 0.4)',
        transition: '0.3s',
        backdropFilter: 'blur(2px)'
    },
    gridCellLocked: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        color: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(5px)',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    playBadge: {
        background: '#f59e0b',
        padding: '6px 18px',
        borderRadius: '8px',
        marginBottom: '10px',
        fontSize: '0.75rem',
        fontWeight: '900',
        color: '#000',
        boxShadow: '0 4px 0 #b45309'
    },

    centerText: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '1.6rem',
        color: '#fcd34d',
        fontWeight: '900',
        letterSpacing: '3px',
        textTransform: 'uppercase'
    }
};