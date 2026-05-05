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

    const [gameState, setGameState] = useState<'idle' | 'lobby' | 'running'>(() => {
        return (localStorage.getItem('robot_game_state') as any) || 'idle';
    });

    const [sessionInfo, setSessionInfo] = useState<{ id: number, accessCode: string } | null>(() => {
        const saved = localStorage.getItem('robot_session_info');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeSession, setActiveSession] = useState<SessionData | null>(() => {
        const saved = localStorage.getItem('robot_active_session');
        return saved ? JSON.parse(saved) : null;
    });

    const [studentCode, setStudentCode] = useState(() => {
        return localStorage.getItem('robot_student_code') || "";
    });

    const [students, setStudents] = useState<Record<string, any>>({});
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [broadcastText, setBroadcastText] = useState("");
    const [selectedLevelId, setSelectedLevelId] = useState<number>(2);
    const [studentName, setStudentName] = useState("");
    const [activePin, setActivePin] = useState<string | null>(null);
    const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const savedMagicCode = localStorage.getItem('magic_join_code');

        if (savedMagicCode && !isTeacher) {
            setStudentCode(savedMagicCode.toUpperCase());
            localStorage.removeItem('magic_join_code');
        }
    }, [isTeacher]);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token && !isTeacher) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                if (payload.full_name) {
                    setStudentName(payload.full_name);
                }
            }
        } catch (e) {
            console.log("Nu am putut extrage numele din token", e);
        }
    }, [isTeacher]);

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
        if (isTeacher && sessionInfo && gameState === 'running') {
            const fetchExistingStudents = async () => {
                try {
                    const res = await fetch(`http://192.168.1.13:8080/api/sessions/${sessionInfo.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.students && data.students.length > 0) {
                            const studentsMap: Record<string, any> = {};
                            data.students.forEach((s: any) => {
                                studentsMap[s.studentName] = s;
                            });
                            setStudents(studentsMap);
                        }
                    }
                } catch (e) {
                    console.error("Nu am putut recupera lista de elevi din DB:", e);
                }
            };
            fetchExistingStudents();
        }
    }, [isTeacher, sessionInfo, gameState]);

    useEffect(() => {
        if (s.injectGlobalStyles) s.injectGlobalStyles();

        const canConnect = (isTeacher && sessionInfo && (gameState === 'lobby' || gameState === 'running')) ||
            (!isTeacher && activeSession);

        if (canConnect) {
            const ws = new WebSocket("ws://192.168.1.13:8080/ws_game");

            ws.onopen = () => {
                console.log("WebSocket activat pentru:", isTeacher ? "PROFESOR" : "ELEV");
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

                        if (msg.type === "STUDENT_NEEDS_HELP" || (msg.type === "STUDENT_UPDATE" && msg.data.helpStatus === 'PENDING')) {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(err => console.warn("Sunetul a fost blocat de browser:", err));
                        }

                        setStudents(prev => {
                            const oldStudent = prev[msg.data.studentName] || {};
                            const newStudent = { ...oldStudent, ...msg.data };

                          
                            if (msg.type === "STUDENT_NEEDS_HELP") {
                                newStudent.responded = false; 
                            } else if (newStudent.helpStatus !== 'PENDING') {
                                newStudent.responded = false; 
                            } else if (oldStudent.responded && newStudent.errorCount > (oldStudent.respondedErrorCount ?? -1)) {
                                newStudent.responded = false; 
                            } else if (newStudent.currentTaskIndex > (oldStudent.currentTaskIndex ?? -1)) {
                                newStudent.responded = false; 
                            }

                            return { ...prev, [msg.data.studentName]: newStudent };
                        });
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
                    else if (msg.type === "ROBOT_ENGAGED") {
                        setStudents(prev => ({
                            ...prev,
                            [msg.studentName]: { ...prev[msg.studentName], needsHelp: false, helpStatus: 'RESOLVED', responded: false }
                        }));
                    }
                } else {
                    if (msg.type === "BROADCAST_PIN") {
                        setActivePin(msg.text);
                    }
                    else if (msg.type === "SESSION_TERMINATED") {
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
            console.error("Conexiune WebSocket indisponibilă!");
        }
    };

    const handleJoinGame = async () => {
        try {
            setActiveSession(null);

            const joinUrl = `http://192.168.1.13:8080/api/sessions/join?code=${studentCode}&name=${studentName}`;
            const joinResponse = await fetch(joinUrl, { method: 'POST' });
            if (!joinResponse.ok) throw new Error("Cod invalid");
            const progressData = await joinResponse.json();

            const sessionUrl = `http://192.168.1.13:8080/api/sessions/${progressData.sessionId}`;
            const sessionResponse = await fetch(sessionUrl);
            if (!sessionResponse.ok) throw new Error("Nu am putut recupera detaliile sesiunii");
            const sessionDetails = await sessionResponse.json();

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
                                    navigator.clipboard.writeText(`http://192.168.1.13:5173/login?join=${sessionInfo.accessCode}`);
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