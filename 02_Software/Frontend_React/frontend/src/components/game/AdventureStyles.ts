import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
    
    container: {
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',     
        padding: '10px'
    },

    gameContainer: {
        width: '95%',
        maxWidth: '1500px',  
        height: '85vh',       
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },

    mainGameArea: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'row'
    },

    leftColumn: {
        flex: 1.4,          
        backgroundColor: '#0f172a',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '2px solid #e2e8f0'
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
        backgroundColor: '#fff',
        minWidth: '400px'    
    },

    taskSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '25px',
        borderBottom: '2px solid #f1f5f9',
        overflowY: 'auto'
    },

    chatSection: {
        height: '30%',      
        backgroundColor: '#f8fafc',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: '2px solid #e2e8f0'
    },
    hud: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 30px',
        background: '#1e293b',
        color: 'white',
        borderBottom: '4px solid #334155'
    },

    scoreBox: {
        fontWeight: '800',
        color: '#fbbf24',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    progressBox: {
        fontSize: '1rem',
        color: '#94a3b8',
        fontWeight: '600'
    },

    dialogueBox: {
        padding: '15px',
        background: '#fff9f0',
        borderRadius: '16px',
        borderLeft: '6px solid #f59e0b',
        marginBottom: '25px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },

    characterAvatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        border: '3px solid #f59e0b',
        flexShrink: 0
    },

    interactionArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '15px'
    },

    aiBubble: {
        background: '#fff',
        padding: '15px',
        borderRadius: '16px 16px 0 16px',
        border: '1px solid #3b82f6',
        fontSize: '0.9rem',
        color: '#1e293b',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lineHeight: '1.5'
    },

    feedbackCorrect: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(16, 185, 129, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        color: 'white',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(4px)'
    },

    feedbackWrong: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(239, 68, 68, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        color: 'white',
        zIndex: 100,
        fontWeight: '900',
        backdropFilter: 'blur(4px)'
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
        gap: '10px',
        justifyContent: 'center',
        padding: '15px',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        minHeight: '80px',
        width: '100%'
    },
    dragItem: {
        padding: '10px 18px',
        backgroundColor: '#fff',
        border: '2px solid #3b82f6',
        borderRadius: '10px',
        cursor: 'grab',
        fontWeight: '700',
        color: '#1e293b',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        userSelect: 'none',
        transition: 'transform 0.2s'
    },
    dropZonesContainer: {
        display: 'flex',
        gap: '15px',
        width: '100%',
        justifyContent: 'space-between'
    },
    dropZone: {
        flex: 1,
        minHeight: '150px',
        padding: '15px',
        backgroundColor: '#fff',
        border: '3px dashed #cbd5e1',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease'
    },
    dropZoneTitle: {
        fontSize: '0.9rem',
        fontWeight: '900',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: '10px'
    },


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
        minHeight: '80px',
        padding: '15px',
        backgroundColor: '#fff',
        border: '3px solid #e2e8f0',
        borderRadius: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
    },
    wordBubble: {
        padding: '10px 18px',
        backgroundColor: '#fff',
        border: '2px solid #3b82f6',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '700',
        color: '#1e293b',
        fontSize: '1rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        userSelect: 'none'
    },
    wordBubbleEmpty: {
        padding: '10px 18px',
        backgroundColor: '#f1f5f9',
        border: '2px dashed #cbd5e1',
        borderRadius: '20px',
        color: '#94a3b8',
        cursor: 'not-allowed'
    },

    menuGridWrapper: { position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', border: '8px solid #fff' },
    menuImage: { width: '100%', height: '100%', objectFit: 'cover' },
    gridOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '4px' },
    gridCellActive: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(34, 197, 94, 0.3)', color: '#fff', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.4)', transition: '0.3s' },
    gridCellLocked: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.75)', color: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)' },
    playBadge: { background: '#22c55e', padding: '5px 15px', borderRadius: '20px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 'bold' },

    centerText: { textAlign: 'center', padding: '50px', fontSize: '1.4rem', color: '#64748b' }
};