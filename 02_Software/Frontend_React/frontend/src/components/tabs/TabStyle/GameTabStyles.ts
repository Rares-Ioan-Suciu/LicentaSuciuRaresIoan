
export const gtStyles: any = {
    wrapper: {
        padding: '40px 20px',
        maxWidth: '1300px',
        margin: '0 auto',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#1e293b',
        minHeight: '80vh'
    },

    centerCard: {
        background: '#ffffff',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        maxWidth: '550px',
        margin: '40px auto',
        border: '1px solid #f1f5f9'
    },

    bigInput: {
        width: '100%',
        padding: '16px 20px',
        margin: '12px 0',
        borderRadius: '14px',
        border: '2px solid #e2e8f0',
        fontSize: '1.1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
    },

    primaryBtn: {
        background: '#2563eb',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '14px',
        border: 'none',
        fontWeight: '700',
        fontSize: '1.05rem',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
        transition: 'all 0.2s ease',
        marginTop: '10px'
    },

    secondaryBtn: {
        background: '#f1f5f9',
        color: '#475569',
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },

    broadcastBar: {
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        padding: '24px 32px',
        borderRadius: '24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        marginBottom: '40px',
        boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.3)',
        borderBottom: '4px solid #1e3a8a'
    },

    broadcastInput: {
        flex: 1,
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(0, 0, 0, 0.15)',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
    },

    pinBtn: {
        background: '#ffffff',
        color: '#1e40af',
        border: 'none',
        padding: '14px 28px',
        borderRadius: '12px',
        fontWeight: '800',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.1s'
    },

    accessCodeDisplay: {
        fontSize: '5.5rem',
        fontWeight: '900',
        color: '#1e40af',
        letterSpacing: '12px',
        margin: '25px 0',
        fontFamily: "'Monaco', 'Consolas', monospace",
        textShadow: '2px 2px 0px #dbeafe'
    },

    pinBanner: {
        position: 'fixed' as const,
        top: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '85%',
        maxWidth: '900px',
        background: '#fef3c7',
        border: '3px solid #f59e0b',
        borderRadius: '20px',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10000,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
    },

    summaryRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
    },

    summaryCard: {
        flex: 1,
        background: '#fff',
        padding: '15px 20px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
    },

    summaryLabel: { fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' },
    summaryValue: { fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' },



};

export const injectGlobalStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes sos-pulse {
            0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .sos-active {
            animation: sos-pulse 2s infinite;
            border-color: #f43f5e !important;
        }
    `;
    document.head.appendChild(style);
};