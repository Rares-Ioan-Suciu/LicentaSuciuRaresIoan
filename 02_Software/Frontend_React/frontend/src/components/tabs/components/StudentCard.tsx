import React from 'react';

interface StudentCardProps {
    data: any;
    totalTasks: number; 
    onAction: (type: 'AI_DELEGATE' | 'ROBOT_DELEGATE' | 'TEACHER_REPLY') => void;
}

const renderErrorDetails = (errorDetails: string) => {
    if (!errorDetails) return null;
    try {
        const parsed = JSON.parse(errorDetails);
        return (
            <div style={localStyles.errorBox}>
                <div style={localStyles.errorItem}><strong>Cerință:</strong> {parsed.question}</div>
                <div style={{ ...localStyles.errorItem, color: '#e11d48' }}><strong>Greșit:</strong> {parsed.studentAnswer}</div>
                <div style={{ ...localStyles.errorItem, color: '#059669' }}><strong>Corect:</strong> {parsed.correctAnswer}</div>
            </div>
        );
    } catch (e) {
        return <div style={localStyles.errorBox}>{errorDetails}</div>;
    }
}

const StudentCard: React.FC<StudentCardProps> = ({ data, totalTasks, onAction }) => {
    const needsHelp = data.needsHelp === true || data.helpStatus === 'PENDING';

    const currentTask = data.currentTaskIndex !== undefined ? data.currentTaskIndex + 1 : 1;
    const progressPercent = Math.min((currentTask / totalTasks) * 100, 100);

    return (
        <div style={{
            ...localStyles.card,
            border: needsHelp ? '3px solid #f43f5e' : '1px solid #e2e8f0',
            boxShadow: needsHelp ? '0 10px 30px rgba(244, 63, 94, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)'
        }}>
            <div style={localStyles.header}>
                <div>
                    <div style={localStyles.name}>{data.studentName || 'Elev'}</div>
                    <div style={localStyles.idTag}>ID: {data.id?.toString().slice(-4) || '????'}</div>
                </div>
                <div style={localStyles.xpBadge}>{data.score || 0} XP</div>
            </div>

            <div style={localStyles.statsRow}>
                <div style={localStyles.statItem}>
                    <span style={localStyles.statLabel}>Etapa curentă</span>
                    <span style={localStyles.statValue}>
                        {currentTask} / {totalTasks}
                    </span>
                </div>
                <div style={localStyles.statItem}>
                    <span style={localStyles.statLabel}>Erori totale</span>
                    <span style={{ ...localStyles.statValue, color: data.errorCount > 3 ? '#ef4444' : '#64748b' }}>
                        {data.errorCount || 0}
                    </span>
                </div>
            </div>

            <div style={localStyles.progressBg}>
                <div style={{
                    ...localStyles.progressFill,
                    width: `${progressPercent}%`,
                    backgroundColor: needsHelp ? '#f43f5e' : '#10b981'
                }} />
            </div>

            {data.aiHintHistory && !needsHelp && (
                <div style={localStyles.hintBox}>
                    <small style={localStyles.hintLabel}>Ultimul sfat AI</small>
                    <div style={localStyles.hintText}>
                        "{data.aiHintHistory.split('|').pop()?.trim()}"
                    </div>
                </div>
            )}

            {needsHelp && (
                <div style={{ marginTop: '16px' }}>
                    <div style={localStyles.sosBadge}>Solicitare Ajutor</div>
                    {renderErrorDetails(data.lastErrorDetails)}

                    <div style={localStyles.actionGrid}>
                        <button onClick={() => onAction('TEACHER_REPLY')} style={{ ...localStyles.btn, background: '#1e293b' }}>
                            Intervin Eu
                        </button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => onAction('AI_DELEGATE')} style={{ ...localStyles.btn, flex: 1, background: '#6366f1' }}>Delegare AI</button>
                            <button onClick={() => onAction('ROBOT_DELEGATE')} style={{ ...localStyles.btn, flex: 1, background: '#f59e0b' }}>Trimitere Robot</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const localStyles = {
    card: {
        background: '#fff',
        borderRadius: '20px',
        padding: '30px 40px',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box' as const
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontWeight: 900, fontSize: '1.8rem', color: '#1e293b' },
    idTag: { fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const },
    xpBadge: { background: '#f1f5f9', padding: '8px 16px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 800, color: '#1e40af' },
    statsRow: { display: 'flex', gap: '80px', marginTop: '10px' },
    statItem: { display: 'flex', flexDirection: 'column' as const },
    statLabel: { fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const },
    statValue: { fontSize: '1.8rem', fontWeight: 900, color: '#334155' },
    progressBg: { width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', marginTop: '10px' },
    progressFill: { height: '100%', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' },
    hintBox: { padding: '20px', background: '#f0f9ff', borderRadius: '14px', border: '1px solid #bae6fd' },
    hintLabel: { fontSize: '0.8rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase' as const },
    hintText: { fontSize: '1.1rem', color: '#0c4a6e', fontStyle: 'italic', marginTop: '6px' },
    sosBadge: { background: '#fff1f2', color: '#e11d48', padding: '10px', textAlign: 'center' as const, fontSize: '1rem', fontWeight: 900, borderRadius: '8px', marginBottom: '16px', border: '2px solid #fecdd3' },
    errorBox: { padding: '20px', background: '#fef2f2', borderRadius: '14px', fontSize: '1.1rem', border: '1px solid #fee2e2' },
    errorItem: { marginBottom: '8px' },
    actionGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px', marginTop: '20px' },
    btn: { border: 'none', padding: '18px', color: '#fff', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.1s' }
};

export default StudentCard;