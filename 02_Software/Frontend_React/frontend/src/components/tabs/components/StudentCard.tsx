import React from 'react';

interface StudentCardProps {
    data: any;
    totalTasks: number;
    onAction: (type: 'AI_DELEGATE' | 'ROBOT_DELEGATE' | 'TEACHER_REPLY' | 'CANCEL_ROBOT') => void;
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
    const isRobotOnTheWay = data.robotOnTheWay === true; // Starea nouă!

    const currentTask = data.currentTaskIndex !== undefined ? data.currentTaskIndex + 1 : 1;
    const progressPercent = Math.min((currentTask / totalTasks) * 100, 100);

    return (
        <div style={{
            ...localStyles.card,
            border: needsHelp ? (isRobotOnTheWay ? '3px dashed #eab308' : '3px solid #f43f5e') : '1px solid #e2e8f0',
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
                    <span style={localStyles.statValue}>{currentTask} / {totalTasks}</span>
                </div>
                <div style={localStyles.statItem}>
                    <span style={localStyles.statLabel}>Erori totale</span>
                    <span style={{ ...localStyles.statValue, color: data.errorCount > 3 ? '#ef4444' : '#64748b' }}>
                        {data.errorCount || 0}
                    </span>
                </div>
            </div>

            {/* BUTOANELE NORMALE CÂND ROBOTUL NU A PLECAT ÎNCĂ */}
            {needsHelp && !isRobotOnTheWay && (
                <div style={{ marginTop: '16px' }}>
                    <div style={localStyles.sosBadge}>Solicitare Ajutor</div>
                    {renderErrorDetails(data.lastErrorDetails)}

                    <div style={localStyles.actionGrid}>
                        <button onClick={() => onAction('TEACHER_REPLY')} style={{ ...localStyles.btn, background: '#1e293b' }}>
                            Intervin Eu
                        </button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => onAction('AI_DELEGATE')} style={{ ...localStyles.btn, flex: 1, background: '#6366f1' }}>Delegare AI (Instant)</button>
                            <button onClick={() => onAction('ROBOT_DELEGATE')} style={{ ...localStyles.btn, flex: 1, background: '#f59e0b' }}>🏃‍♂️ Trimite Robotul</button>
                        </div>
                    </div>
                </div>
            )}

            {/* UI NOU PENTRU CÂND ROBOTUL ESTE PE DRUM */}
            {needsHelp && isRobotOnTheWay && (
                <div style={{ marginTop: '16px', padding: '20px', background: '#fef9c3', borderRadius: '16px', border: '3px dashed #eab308', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>🏃‍♂️🤖</div>
                    <div style={{ fontWeight: 900, color: '#854d0e', fontSize: '1.2rem', marginBottom: '15px' }}>
                        Robotul se deplasează spre elev...
                    </div>
                    <button
                        onClick={() => onAction('AI_DELEGATE')}
                        style={{ ...localStyles.btn, background: '#10b981', width: '100%', marginBottom: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                    >
                        📍 Confirmă Ajungerea & Vorbește!
                    </button>
                    <button
                        onClick={() => onAction('CANCEL_ROBOT')}
                        style={{ ...localStyles.btn, background: '#ef4444', width: '100%', padding: '12px', fontSize: '1rem' }}
                    >
                        Anulează deplasarea
                    </button>
                </div>
            )}
        </div>
    );
};

const localStyles = {
    card: { background: '#fff', borderRadius: '20px', padding: '30px 40px', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' as const, gap: '20px', width: '100%', boxSizing: 'border-box' as const },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontWeight: 900, fontSize: '1.8rem', color: '#1e293b' },
    idTag: { fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const },
    xpBadge: { background: '#f1f5f9', padding: '8px 16px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 800, color: '#1e40af' },
    statsRow: { display: 'flex', gap: '80px', marginTop: '10px' },
    statItem: { display: 'flex', flexDirection: 'column' as const },
    statLabel: { fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const },
    statValue: { fontSize: '1.8rem', fontWeight: 900, color: '#334155' },
    sosBadge: { background: '#fff1f2', color: '#e11d48', padding: '10px', textAlign: 'center' as const, fontSize: '1rem', fontWeight: 900, borderRadius: '8px', marginBottom: '16px', border: '2px solid #fecdd3' },
    errorBox: { padding: '20px', background: '#fef2f2', borderRadius: '14px', fontSize: '1.1rem', border: '1px solid #fee2e2' },
    errorItem: { marginBottom: '8px' },
    actionGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px', marginTop: '20px' },
    btn: { border: 'none', padding: '18px', color: '#fff', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.1s' }
};

export default StudentCard;