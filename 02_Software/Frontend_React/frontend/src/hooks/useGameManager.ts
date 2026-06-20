import { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';

export interface SessionData {
    sessionId: number;
    name: string;
    levelTitle?: string;
    levelId?: number;
}

export const useGameManager = (isTeacher: boolean) => {

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
    const [studentName, setStudentName] = useState("");
    const [activePin, setActivePin] = useState<string | null>(null);

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
            console.log("nu a mers parsarea jwt pt nume", e);
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
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/sessions/${sessionInfo.id}`);
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
                    console.log("fail la luat elevii din db", e);
                }
            };
            fetchExistingStudents();
        }
    }, [isTeacher, sessionInfo, gameState]);

    useEffect(() => {
        const canConnect = (isTeacher && sessionInfo && (gameState === 'lobby' || gameState === 'running')) ||
            (!isTeacher && activeSession);

        if (canConnect) {
            const ws = new WebSocket(`${APP_CONFIG.WS_BASE_URL}/ws_game`);

            ws.onopen = () => {
                console.log("ws deschis pt", isTeacher ? "prof" : "elev");
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
                            audio.play().catch(err => console.log("browseru a blocat audio", err));
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

    return {
        gameState, setGameState,
        sessionInfo, setSessionInfo,
        activeSession, setActiveSession,
        studentCode, setStudentCode,
        students, setStudents,
        socket,
        studentName, setStudentName,
        activePin
    };
};