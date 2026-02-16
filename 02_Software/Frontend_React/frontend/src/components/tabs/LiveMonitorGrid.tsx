import React, { useState, useEffect } from 'react';
import StudentCard from './components/StudentCard';
import api from '../../api/axios'; 

interface LiveMonitorGridProps {
    students: any[];
    accessCode: string;
    onAction: (studentId: string, type: 'AI_DELEGATE' | 'ROBOT_DELEGATE' | 'TEACHER_REPLY') => void;
}

const LiveMonitorGrid: React.FC<LiveMonitorGridProps> = ({ students, accessCode, onAction }) => {
    const [totalTasks, setTotalTasks] = useState(15); 

    useEffect(() => {
        const fetchLevelInfo = async () => {
            if (!accessCode) return;
            try {
                const { data } = await api.get(`/sessions/code/${accessCode}`);
                console.log(data)
                if (data?.level?.title) {
                    const title = data.level.title.toLowerCase();
                  
                    if (title.includes("informatica") || title.includes("grafuri")) {
                        setTotalTasks(24);
                    } else {
                        setTotalTasks(25);
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
            {students.map((student) => (
                <StudentCard
                    key={student.id}
                    data={student}
                    totalTasks={totalTasks} 
                    onAction={(type) => onAction(student.id, type)}
                />
            ))}
        </div>
    );
};

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '25px',
        width: '100%',
        padding: '20px 0',
        alignItems: 'stretch'          
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
    emptyTitle: {
        color: '#1e293b',
        fontSize: '1.2rem',
        fontWeight: 800,
        marginBottom: '8px'
    },
    emptySub: {
        color: '#64748b',
        fontSize: '0.9rem'
    },
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