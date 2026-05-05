import React, { useState, useEffect } from 'react';
import StudentCard from './components/StudentCard';
import api from '../../api/axios';

interface LiveMonitorGridProps {
    students: any[];
    accessCode: string;
    onAction: (studentName: string, type: 'AI_DELEGATE' | 'ROBOT_DELEGATE' | 'TEACHER_REPLY' | 'CANCEL_ROBOT') => void;
    pendingActions: Record<string, boolean>;
}

const LiveMonitorGrid: React.FC<LiveMonitorGridProps> = ({ students, accessCode, onAction, pendingActions }) => {
    const [totalTasks, setTotalTasks] = useState(32);

    useEffect(() => {
        const fetchLevelInfo = async () => {
            if (!accessCode) return;
            try {
                const { data } = await api.get(`/sessions/code/${accessCode}`);
                if (data?.level?.title) {
                    const title = data.level.title.toLowerCase();
                    if (title.includes("informatica") || title.includes("grafuri")) {
                        setTotalTasks(32);
                    } else {
                        setTotalTasks(32);
                    }
                }
            } catch (err) {
                console.error("Eroare la determinarea limitelor nivelului:", err);
            }
        };

        fetchLevelInfo();
    }, [accessCode]);

    if (!students || students.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <div style={styles.pulseDot} />
                <h3 style={styles.emptyTitle}>Sesiune activă: {accessCode}</h3>
                <p style={styles.emptySub}>Așteptăm conectarea elevilor pentru a începe monitorizarea.</p>
            </div>
        );
    }

    return (
        <div style={styles.gridContainer}>
            {students.map((student) => {
                const isStudentPending = pendingActions[student.studentName] || false;
                const isStudentResponded = student.responded === true;
                const isActivelyNeedingHelp = (student.needsHelp || student.helpStatus === 'PENDING') && !isStudentResponded;

                return (
                    <div
                        key={student.id || student.studentName}
                        style={{
                            ...styles.cardWrapper,
                           
                            borderColor: isActivelyNeedingHelp ? '#ef4444' : (isStudentResponded ? '#10b981' : 'transparent'),
                            boxShadow: isActivelyNeedingHelp
                                ? '0 0 15px rgba(239, 68, 68, 0.4)'
                                : 'none',
                            transform: isActivelyNeedingHelp ? 'scale(1.02)' : 'scale(1)',
                        }}
                    >
                        <StudentCard
                            data={student}
                            totalTasks={totalTasks}
                            onAction={(type: any) => onAction(student.studentName, type)}
                            isPending={isStudentPending}
                            isResponded={isStudentResponded}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const styles = {
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
        gap: '25px',
        width: '100%',
        padding: '20px 0',
        alignItems: 'start'
    },
    cardWrapper: {
        borderRadius: '20px',
        borderWidth: '3px',
        borderStyle: 'solid',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%'
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        background: '#fff',
        borderRadius: '20px',
        border: '2px dashed #e2e8f0',
        marginTop: '20px'
    },
    emptyTitle: { color: '#1e293b', fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' },
    emptySub: { color: '#64748b', fontSize: '0.9rem' },
    pulseDot: {
        width: '12px',
        height: '12px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        marginBottom: '20px',
        boxShadow: '0 0 0 rgba(16, 185, 129, 0.4)',
        animation: 'pulse-green 2s infinite'
    }
};

export default LiveMonitorGrid;