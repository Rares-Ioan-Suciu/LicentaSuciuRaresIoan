import { useState, useEffect } from 'react';
import FrenchAdventure from '../game/FrenchAdventure';
import AlgorithmAdventure from '../game/AlgorithmAdventure';
import { TeacherService } from '../../services/TeacherService';
import LiveMonitorGrid from './LiveMonitorGrid';
import { gtStyles as s } from './TabStyle/GameTabStyles';
import { APP_CONFIG } from '../../config';
import { useGameManager } from '../../hooks/useGameManager';

interface GameTabProps { isTeacher: boolean; }

const GameTab = ({ isTeacher }: GameTabProps) => {

    const {
        gameState, setGameState,
        sessionInfo, setSessionInfo,
        activeSession, setActiveSession,
        studentCode, setStudentCode,
        studentName, setStudentName,
        students, setStudents,
        socket
    } = useGameManager(isTeacher);


    const [broadcastText, setBroadcastText] = useState("");
    const [selectedLevelId, setSelectedLevelId] = useState<number>(2);
    const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (s.injectGlobalStyles) s.injectGlobalStyles();
    }, []);

    const handleCreateSession = async () => {
        try {
            const data = await TeacherService.createSession(selectedLevelId, "Profesor_Principal");
            setSessionInfo({ id: data.id, accessCode: data.accessCode });
            setGameState('lobby');
        } catch (e) {
            alert("Eroare la pornirea sesiunii!");
        }
    };

    const handleTerminate = async () => {
        if (sessionInfo && window.confirm("Descarci raportul final și închizi sesiunea definitiv?")) {
            try {
                await TeacherService.downloadReport(sessionInfo.id);
                await TeacherService.terminateSession(sessionInfo.id);
                localStorage.clear();
                setGameState('idle');
                setSessionInfo(null);
                setStudents({});
                setPendingActions({});
                alert("Sesiune închisă cu succes!");
            } catch (e) {
                alert("Eroare la închiderea sesiunii.");
            }
        }
    };

    const handleSendPin = () => {
        if (socket?.readyState === WebSocket.OPEN && broadcastText.trim() && sessionInfo) {
            socket.send(JSON.stringify({
                type: "TEACHER_BROADCAST",
                accessCode: sessionInfo.accessCode,
                text: broadcastText
            }));
            setBroadcastText("");
        }
    };

    const handleTestRobotVoice = () => {
        const testMessage = window.prompt("Scrie o propoziție pe care să o citească fața robotului:");
        if (testMessage && socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "ROBOT_SPEAK",
                accessCode: "GLOBAL",
                text: testMessage
            }));
        }
    };

    const handleActionDelegate = (studentName: string, type: string) => {
        setPendingActions(prev => ({ ...prev, [studentName]: true }));

        const clearPending = (delay = 800) => {
            setTimeout(() => {
                setPendingActions(prev => ({ ...prev, [studentName]: false }));
            }, delay);
        };

        const markAsResponded = () => {
            setStudents(prev => ({
                ...prev,
                [studentName]: {
                    ...prev[studentName],
                    responded: true,
                    respondedErrorCount: prev[studentName]?.errorCount || 0
                }
            }));
        };

        if (type === 'ROBOT_DELEGATE') {
            if (socket?.readyState === WebSocket.OPEN && sessionInfo) {
                socket.send(JSON.stringify({
                    type: "ROBOT_DISPATCH",
                    accessCode: "GLOBAL",
                    studentData: {
                        studentName: studentName,
                        accessCode: sessionInfo.accessCode,
                        sessionId: sessionInfo.id,
                        task: students[studentName]?.lastErrorDetails || "Lecție în curs",
                        details: students[studentName]?.lastErrorDetails || "Fara detalii"
                    }
                }));
                markAsResponded();
            }
            clearPending(1000);
            return;
        }

        if (type === 'CANCEL_ROBOT') {
            clearPending(500);
            return;
        }

        if (socket?.readyState === WebSocket.OPEN && sessionInfo) {
            let textForStudent = "";

            if (type === 'TEACHER_REPLY') {
                const reply = window.prompt(`Scrie mesajul tău pentru ${studentName}:`);
                if (!reply) {
                    setPendingActions(prev => ({ ...prev, [studentName]: false }));
                    return;
                }
                textForStudent = reply;
            }

            const errorDetailsJSON = students[studentName]?.lastErrorDetails || "{}";

            const payload = {
                type: type,
                studentName: studentName,
                accessCode: sessionInfo.accessCode,
                message: textForStudent,
                details: errorDetailsJSON,
                task: "Exercițiu curent",
                sessionId: sessionInfo.id
            };

            socket.send(JSON.stringify(payload));
            markAsResponded();
            clearPending(800);
        } else {
            setPendingActions(prev => ({ ...prev, [studentName]: false }));
            console.log("ws indisponibil pt actiune");
        }
    };

    const handleJoinGame = async () => {
        try {
            setActiveSession(null);

            const joinUrl = `${APP_CONFIG.API_BASE_URL}/api/sessions/join?code=${studentCode}&name=${studentName}`;
            const joinResponse = await fetch(joinUrl, { method: 'POST' });
            if (!joinResponse.ok) throw new Error("Cod invalid");
            const progressData = await joinResponse.json();

            const sessionUrl = `${APP_CONFIG.API_BASE_URL}/api/sessions/${progressData.sessionId}`;
            const sessionResponse = await fetch(sessionUrl);
            if (!sessionResponse.ok) throw new Error("Nu am putut recupera detaliile sesiunii");
            const sessionDetails = await sessionResponse.json();

            const titleFromDB = sessionDetails.gameLevel?.title || "La Boulangerie";
            const idFromDB = sessionDetails.gameLevel?.id || 1;

            const sessionData = {
                sessionId: progressData.sessionId,
                name: studentName,
                levelTitle: titleFromDB,
                levelId: idFromDB
            };

            setActiveSession(sessionData);
            localStorage.setItem('robot_active_session', JSON.stringify(sessionData));

        } catch (e) {
            alert("Cod invalid sau sesiune inexistenta!");
            localStorage.removeItem('robot_active_session');
        }
    };

    if (isTeacher) {
        const sortedStudents = Object.values(students).sort((a: any, b: any) => {
            const aNeedsHelp = a.needsHelp || a.helpStatus === 'PENDING';
            const bNeedsHelp = b.needsHelp || b.helpStatus === 'PENDING';

            if (aNeedsHelp && !bNeedsHelp) return -1;
            if (!aNeedsHelp && bNeedsHelp) return 1;

            const aErrors = a.errorCount || 0;
            const bErrors = b.errorCount || 0;
            if (aErrors !== bErrors) {
                return bErrors - aErrors;
            }
            return (a.studentName || "").localeCompare(b.studentName || "");
        });

        const activeCount = sortedStudents.length;
        const helpCount = sortedStudents.filter((s: any) => s.needsHelp || s.helpStatus === 'PENDING').length;

        return (
            <div style={s.wrapper}>
                {gameState === 'idle' && (
                    <div style={s.centerCard}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '10px' }}>Alege jocul!</h2>
                        <select
                            title='LevelSelector'
                            value={selectedLevelId}
                            onChange={(e) => setSelectedLevelId(Number(e.target.value))}
                            style={{ ...s.bigInput, marginBottom: '20px', cursor: 'pointer' }}
                        >
                            <option value="1">Franceză</option>
                            <option value="2">Informatică</option>
                        </select>
                        <button onClick={handleCreateSession} style={s.primaryBtn}>Începe o nouă sesiune!</button>
                    </div>
                )}

                {gameState !== 'idle' && (
                    <div style={s.summaryRow}>
                        <div style={s.summaryCard}>
                            <span style={s.summaryLabel}>Elevi Conectați</span>
                            <span style={s.summaryValue}>{activeCount} </span>
                        </div>
                        <div style={s.summaryCard}>
                            <span style={s.summaryLabel}>Solicitări de Ajutor</span>
                            <span style={{ ...s.summaryValue, color: helpCount > 0 ? '#ef4444' : '#1e293b' }}>{helpCount}</span>
                        </div>
                    </div>
                )}

                {gameState === 'lobby' && sessionInfo && (
                    <div style={s.centerCard}>
                        <h4 style={{ color: '#94a3b8', letterSpacing: '3px', fontWeight: 800 }}>Cod de Acces</h4>
                        <h1 style={s.accessCodeDisplay}>{sessionInfo.accessCode}</h1>

                        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <input
                                readOnly
                                aria-label="Link magic pentru conectare elevi"
                                title="Link conectare"
                                value={`${window.location.origin}/login?join=${sessionInfo.accessCode}`}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '300px', backgroundColor: '#f8fafc', color: '#64748b' }}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/login?join=${sessionInfo.accessCode}`);
                                    alert("Link-ul a fost copiat! Trimite-l elevilor.");
                                }}
                                style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                📋 Copiază Link
                            </button>
                        </div>

                        <button onClick={() => setGameState('running')} style={{ ...s.primaryBtn, background: '#10b981' }}>Start Joc</button>
                    </div>
                )}

                {gameState === 'running' && sessionInfo && (
                    <div style={{ width: '100%' }}>
                        <div style={s.broadcastBar}>
                            <input
                                style={s.broadcastInput}
                                value={broadcastText}
                                onChange={(e) => setBroadcastText(e.target.value)}
                                placeholder="Mesaj pentru toată lumea..."
                            />
                            <button style={s.pinBtn} onClick={handleSendPin}>Trimite Mesaj</button>
                            <button onClick={handleTestRobotVoice} style={{ ...s.pinBtn, background: '#8b5cf6', color: 'white', marginLeft: '15px' }}>
                                Voce Robot
                            </button>
                            <button onClick={handleTerminate} style={{ ...s.pinBtn, background: '#ef4444', color: 'white', marginLeft: 'auto' }}>Stop Joc</button>
                        </div>

                        <LiveMonitorGrid
                            students={sortedStudents}
                            accessCode={sessionInfo.accessCode}
                            onAction={handleActionDelegate}
                            pendingActions={pendingActions}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={s.wrapper}>
            {!activeSession ? (
                <div style={s.centerCard}>
                    <h2 style={{ fontWeight: 900, marginBottom: '20px' }}>Conectare la Joc</h2>

                    {studentCode && new URLSearchParams(window.location.search).get('join') ? (
                        <div style={{ padding: '12px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
                            Cod sesiune: {studentCode}
                        </div>
                    ) : (
                        <input
                            aria-label="Cod sesiune"
                            title="Cod sesiune"
                            style={{ ...s.bigInput, textAlign: 'center', fontWeight: '900', letterSpacing: '6px', marginBottom: '15px' }}
                            value={studentCode}
                            onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                            placeholder="Cod Sesiune"
                        />
                    )}
                    {studentName ? (
                        <div style={{ fontSize: '18px', color: '#475569', marginBottom: '25px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            Conectat ca: <strong>{studentName}</strong>
                        </div>
                    ) : (
                        <input
                            style={s.bigInput}
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Numele tău"
                        />
                    )}

                    <button onClick={handleJoinGame} style={{ ...s.primaryBtn, marginTop: '10px', fontSize: '20px', padding: '15px' }}>
                        Start Joc
                    </button>
                </div>
            ) : (
                <div style={{ width: '100%' }}>
                    {activeSession.levelId === 2 ? (
                        <AlgorithmAdventure sessionContext={{ sessionId: activeSession.sessionId, username: activeSession.name, accessCode: studentCode, levelId: activeSession.levelId }} />
                    ) : (
                        <FrenchAdventure sessionContext={{ sessionId: activeSession.sessionId, username: activeSession.name, accessCode: studentCode, levelId: activeSession.levelId }} />
                    )}
                </div>
            )}
        </div>
    );
};
export default GameTab;