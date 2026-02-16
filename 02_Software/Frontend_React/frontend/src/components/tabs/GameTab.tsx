import { useState, useEffect } from 'react';
import FrenchAdventure from '../game/FrenchAdventure';
import AlgorithmAdventure from '../game/AlgorithmAdventure'; 
import { TeacherService } from '../../services/TeacherService';
import LiveMonitorGrid from './LiveMonitorGrid';
import { gtStyles as s } from './TabStyle/GameTabStyles';

interface GameTabProps { isTeacher: boolean; }

interface SessionData {
    sessionId: number;
    name: string;
    levelTitle?: string;
    levelId?: number; 
}


const GameTab = ({ isTeacher }: GameTabProps) => {
    
    const [gameState, setGameState] = useState<'idle' | 'lobby' | 'running'>('idle');
    const [sessionInfo, setSessionInfo] = useState<{ id: number, accessCode: string } | null>(null);
    const [students, setStudents] = useState<Record<string, any>>({});
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [broadcastText, setBroadcastText] = useState("");
    const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

    const [studentName, setStudentName] = useState("");
    const [studentCode, setStudentCode] = useState("");

    const [activeSession, setActiveSession] = useState<SessionData | null>(null);
    const [activePin, setActivePin] = useState<string | null>(null);

    useEffect(() => {
        const savedSession = localStorage.getItem('robot_session_info');
        const savedGameState = localStorage.getItem('robot_game_state');
        const savedActiveSession = localStorage.getItem('robot_active_session');
        const savedStudentCode = localStorage.getItem('robot_student_code');

        if (savedSession) setSessionInfo(JSON.parse(savedSession));
        if (savedGameState) setGameState(savedGameState as any);
        if (savedActiveSession) setActiveSession(JSON.parse(savedActiveSession));
        if (savedStudentCode) setStudentCode(savedStudentCode);

        if (savedGameState === 'idle') {
            localStorage.removeItem('robot_active_session');
            localStorage.removeItem('robot_student_code');
            setActiveSession(null);
        }
    }, []);

    useEffect(() => {
        if (sessionInfo) localStorage.setItem('robot_session_info', JSON.stringify(sessionInfo));
        if (gameState) localStorage.setItem('robot_game_state', gameState);

        if (activeSession) {
            localStorage.setItem('robot_active_session', JSON.stringify(activeSession));
            localStorage.setItem('robot_student_code', studentCode);
        } else if (gameState === 'idle') {
            localStorage.removeItem('robot_active_session');
            localStorage.removeItem('robot_student_code');
        }
    }, [sessionInfo, gameState, activeSession, studentCode]);

    useEffect(() => {
        if (s.injectGlobalStyles) s.injectGlobalStyles();

        const canConnect = (isTeacher && sessionInfo && (gameState === 'lobby' || gameState === 'running')) ||
            (!isTeacher && activeSession);

        if (canConnect) {
            const ws = new WebSocket("ws://localhost:8080/ws_game");

            ws.onopen = () => {
                console.log("📡 WebSocket activat pentru:", isTeacher ? "PROFESOR" : "ELEV");
                ws.send(JSON.stringify({
                    type: "JOIN",
                    role: isTeacher ? "TEACHER" : "STUDENT",
                    username: isTeacher ? "teacher" : studentName,
                    accessCode: isTeacher ? sessionInfo?.accessCode : studentCode
                }));
            };

            ws.onmessage = (e) => {
                const msg = JSON.parse(e.data);

                if (isTeacher) {
                    if (msg.type === "STUDENT_JOINED" || msg.type === "STUDENT_UPDATE" || msg.type === "STUDENT_NEEDS_HELP") {
                        setStudents(prev => ({
                            ...prev,
                            [msg.data.studentName]: msg.data
                        }));
                    }
                    else if (msg.type === "AI_HINT_GENERATED") {
                        setStudents(prev => {
                            const studentToUpdate = prev[msg.data.studentName];
                            if (!studentToUpdate) return prev;
                            return {
                                ...prev,
                                [msg.data.studentName]: {
                                    ...studentToUpdate,
                                    aiHintHistory: (studentToUpdate.aiHintHistory ? studentToUpdate.aiHintHistory + " | " : "") + msg.data.hint
                                }
                            };
                        });
                    }
                } else {
                    if (msg.type === "BROADCAST_PIN") {
                        setActivePin(msg.text);
                    }
                    else if (msg.type === "SESSION_TERMINATED") {
                        console.log("Sesiunea a fost închisă de profesor.");
                        localStorage.clear();
                        setActiveSession(null);
                        setGameState('idle');
                        alert("Profesorul a închis sesiunea. Vei fi trimis la meniul principal.");
                        window.location.reload();
                    }
                }
            };

            setSocket(ws);
            return () => {
                if (ws.readyState === WebSocket.OPEN) ws.close();
            };
        }
    }, [isTeacher, sessionInfo, gameState, activeSession, studentName, studentCode]);

    const handleCreateSession = async () => {
        try {
            console.log("Am selectat: ", selectedLevelId );
            const data = await TeacherService.createSession(selectedLevelId, "Profesor_Principal");
            setSessionInfo({ id: data.id, accessCode: data.accessCode });
            setGameState('lobby');
        } catch (e) { alert("Eroare la pornirea sesiunii!"); }
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
                setSocket(null);
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

    const handleActionDelegate = (studentName: string, type: string) => {
        if (socket?.readyState === WebSocket.OPEN && sessionInfo) {
            let textForStudent = "";
            if (type === 'TEACHER_REPLY') {
                const reply = window.prompt(`Scrie mesajul tău pentru ${studentName}:`);
                if (!reply) return;
                textForStudent = reply;
            }

            const payload = {
                type: type,
                studentName: studentName,
                accessCode: sessionInfo.accessCode,
                message: textForStudent,
                details: textForStudent,
                task: students[studentName]?.lastErrorDetails || "Lecție în curs"
            };
            socket.send(JSON.stringify(payload));
        }
    };

    const handleJoinGame = async () => {
        try {
            setActiveSession(null);

            const joinUrl = `http://localhost:8080/api/sessions/join?code=${studentCode}&name=${studentName}`;
            const joinResponse = await fetch(joinUrl, { method: 'POST' });
            if (!joinResponse.ok) throw new Error("Cod invalid");
            const progressData = await joinResponse.json();

            console.log("Date Progres primite: ", progressData);

            const sessionUrl = `http://localhost:8080/api/sessions/${progressData.sessionId}`;
            const sessionResponse = await fetch(sessionUrl);
            if (!sessionResponse.ok) throw new Error("Nu am putut recupera detaliile sesiunii");
            const sessionDetails = await sessionResponse.json();

            console.log("Detalii Sesiune complete: ", sessionDetails);

          
            const titleFromDB = sessionDetails.gameLevel?.title || "La Boulangerie";
            const idFromDB = sessionDetails.gameLevel?.id || 1;

            const sessionData: SessionData = {
                sessionId: progressData.sessionId,
                name: studentName,
                levelTitle: titleFromDB,
                levelId: idFromDB
            };

          
            setActiveSession(sessionData);
            localStorage.setItem('robot_active_session', JSON.stringify(sessionData));

        } catch (e) {
            console.error("Eroare la join:", e);
            alert("Cod invalid sau sesiune inexistenta!");
            localStorage.removeItem('robot_active_session');
        }
    };

    if (isTeacher) {
        const studentList = Object.values(students);
        const activeCount = studentList.length;
        const helpCount = studentList.filter(s => s.needsHelp || s.helpStatus === 'PENDING').length;
        const avgScore = activeCount > 0 ? Math.round(studentList.reduce((acc, s) => acc + s.score, 0) / activeCount) : 0;

        return (
            <div style={s.wrapper}>
                {gameState === 'idle' && (
                    <div style={s.centerCard}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '10px' }}>Alege jocul!</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Selectează disciplina pentru această sesiune:</p>

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
                            <span style={{ ...s.summaryValue, color: helpCount > 0 ? '#ef4444' : '#1e293b' }}>
                                {helpCount}
                            </span>
                        </div>
                        <div style={s.summaryCard}>
                            <span style={s.summaryLabel}>Scor Mediu Clasă</span>
                            <span style={s.summaryValue}>{avgScore}</span>
                        </div>
                    </div>
                )}

                {gameState === 'lobby' && sessionInfo && (
                    <div style={s.centerCard}>
                        <h4 style={{ color: '#94a3b8', letterSpacing: '3px', fontWeight: 800 }}>Cod de Acces</h4>
                        <h1 style={s.accessCodeDisplay}>{sessionInfo.accessCode}</h1>
                        <p style={{ color: '#64748b', marginBottom: '40px' }}>Partajează codul pentru a lasă elevii să se alăture sesiunii de joc!</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setGameState('idle')} style={s.secondaryBtn}>Anulează</button>
                            <button onClick={() => setGameState('running')} style={{ ...s.primaryBtn, background: '#10b981', margin: 0 }}>Start Joc</button>
                        </div>
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
                                onKeyPress={(e) => e.key === 'Enter' && handleSendPin()}
                            />
                            <button style={s.pinBtn} onClick={handleSendPin}>Trimite Mesaj Tuturor</button>
                            <button onClick={handleTerminate} style={{ ...s.pinBtn, background: '#ef4444', color: 'white', marginLeft: 'auto' }}>Stop Joc</button>
                        </div>
                        <div style={{ marginBottom: '20px', fontWeight: 800, color: '#64748b' }}>
                            Sesiune Activă: <span style={{ color: '#1e40af' }}>{sessionInfo.accessCode}</span>
                        </div>
                    
                        <LiveMonitorGrid
                            students={studentList}
                            accessCode={sessionInfo.accessCode}
                    
                            onAction={handleActionDelegate}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={s.wrapper}>
            {activePin && (
                <div style={s.pinBanner}>
                    <span style={{ fontWeight: 900, color: '#92400e', fontSize: '1.1rem' }}>📢 MESAJ PROFESOR: {activePin}</span>
                    <button onClick={() => setActivePin(null)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                </div>
            )}

            {!activeSession ? (
                <div style={s.centerCard}>
                    <h2 style={{ fontWeight: 900, marginBottom: '30px' }}>Conectare la Joc</h2>
                    <input style={s.bigInput} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Numele tău" />
                    <input style={{ ...s.bigInput, textAlign: 'center', fontWeight: '900', letterSpacing: '6px' }} value={studentCode} onChange={(e) => setStudentCode(e.target.value.toUpperCase())} placeholder="Cod de acces" />
                    <button onClick={handleJoinGame} style={{ ...s.primaryBtn, marginTop: '30px' }}>Intră în joc</button>
                </div>
            ) : (
                <div style={{ marginTop: activePin ? '100px' : '0', width: '100%' }}>
                    {activeSession.levelTitle?.toLowerCase().includes("informatica") ? (
                        <AlgorithmAdventure
                            sessionContext={{
                                sessionId: activeSession.sessionId,
                                username: activeSession.name,
                                accessCode: studentCode,
                                levelId: activeSession.levelId
                            }}
                        />
                    ) : (
                        <FrenchAdventure
                            sessionContext={{
                                sessionId: activeSession.sessionId,
                                username: activeSession.name,
                                accessCode: studentCode,
                                levelId: activeSession.levelId
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default GameTab;