import { useState, useEffect, useRef } from 'react';
import { GameService } from '../services/GameService';
import { APP_CONFIG } from '../config';
import type { GameLevel, GameTask } from '../types/game';
import confetti from 'canvas-confetti';

export interface SessionContextData {
    sessionId: number;
    username: string;
    accessCode: string;
    levelId?: number;
}

export const useFrenchAdventure = (sessionContext?: SessionContextData) => {
    const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>(
        sessionContext ? 'loading' : 'menu'
    );

    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [currentTasks, setCurrentTasks] = useState<GameTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);

    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleOffline = () => {
            console.log("offline detectat de browser");
            setConnectionStatus('reconnecting');
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };

        const handleOnline = () => {
            console.log("net revenit");
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [socket]);

    useEffect(() => {
        if (currentTasks.length > 0 && currentTaskIndex === currentTasks.length - 1) {
            if (socket && socket.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "SHOW_EXTRACTION_CODE",
                    code: "7392"
                }));
            }
        }
    }, [currentTaskIndex, currentTasks.length, socket, sessionContext]);

    useEffect(() => {
        const fetchLevelData = async () => {
            try {
                const data = await GameService.getAllLevels();
                if (data && data.length > 0) setLevels(data);
            } catch (error) {
                console.log("fail la adus nivele franceza", error);
            }
        };
        fetchLevelData();

        if (!sessionContext) return;
        let isComponentMounted = true;

        const connectWebSocket = (retryCount = 0) => {
            if (!isComponentMounted) return;

            const ws = new WebSocket(`${APP_CONFIG.WS_BASE_URL}/ws_game`);

            ws.onopen = () => {
                if (!isComponentMounted) { ws.close(); return; }
                console.log("ws agent conectat");
                setConnectionStatus('connected');

                ws.send(JSON.stringify({
                    type: "JOIN",
                    role: "STUDENT",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode
                }));
            };

            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);

                if (data.type === "SESSION_TERMINATED") {
                    console.log("sesiune kill din server");
                    window.location.reload();
                    ws.close();
                    return;
                }

                if (data.type === "BROADCAST_PIN") {
                    setActivePin(data.text);
                }

                if (data.type === "ai_feedback") {
                    setAiFeedback(data.message);
                    setFeedbackSource('AI');
                } else if (data.type === "robot_feedback") {
                    setAiFeedback(data.message);
                    setFeedbackSource('ROBOT');
                } else if (data.type === "teacher_reply") {
                    setAiFeedback(data.message);
                    setFeedbackSource('TEACHER');
                }
            };

            ws.onclose = () => {
                if (!isComponentMounted) return;
                console.log("ws picat, incerc reconectare");
                setConnectionStatus('reconnecting');

                const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
                reconnectTimeout.current = setTimeout(() => {
                    connectWebSocket(retryCount + 1);
                }, timeout);
            };

            ws.onerror = (err) => {
                console.log("eroare ws", err);
                ws.close();
            };

            setSocket(ws);
        };

        connectWebSocket(0);

        return () => {
            isComponentMounted = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            setSocket(prev => {
                if (prev && prev.readyState === WebSocket.OPEN) prev.close();
                return null;
            });
        };
    }, [sessionContext]);

    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        setFeedbackSource(null);
        try {
            const tasks = await GameService.getLevelTasks(levelId);
            setCurrentTasks(tasks);

            let startingIndex = 0;
            let startingScore = 0;
            if (sessionContext) {
                const joinUrl = `${APP_CONFIG.API_BASE_URL}/api/sessions/join?code=${sessionContext.accessCode}&name=${sessionContext.username}`;
                const res = await fetch(joinUrl, { method: 'POST' });

                if (res.ok) {
                    const progress = await res.json();
                    startingIndex = progress.currentTaskIndex || 0;
                    startingScore = progress.score || 0;
                } else {
                    alert("Sesiunea a fost închisă sau nu mai este valabilă.");
                    localStorage.removeItem('robot_active_session');
                    localStorage.removeItem('robot_student_code');
                    window.location.reload();
                    return;
                }
            }

            setCurrentTaskIndex(startingIndex);
            setScore(startingScore);
            if (startingIndex >= tasks.length && tasks.length > 0) {
                setScreen('result');
            } else {
                setScreen('game');
            }
        } catch (error) {
            setScreen('menu');
        }
    };

    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);

    const handleAnswer = (isCorrect: boolean, answerValue: any) => {
        if (feedback !== 'none' || connectionStatus === 'reconnecting') return;

        const currentTask = currentTasks[currentTaskIndex];

        if (isCorrect) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#fcd34d']
            });
            setHasErrorOnTask(false);
            const nextScore = score + 100;
            const nextIndex = currentTaskIndex + 1;
            setScore(nextScore);
            setFeedback('correct');
            setAiFeedback("");

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "UPDATE_PROGRESS",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    taskIndex: nextIndex,
                    score: nextScore
                }));
            }

            setTimeout(() => {
                setFeedback('none');
                if (currentTaskIndex < currentTasks.length - 1) {
                    setCurrentTaskIndex(nextIndex);
                } else {
                    setScreen('result');
                }
            }, 1500);
        } else {
            setHasErrorOnTask(true);
            setFeedback('wrong');

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                let correctAnswerStr = "";
                let studentAnswerStr = "";

                switch (currentTask.type) {
                    case 'MultipleChoice':
                        correctAnswerStr = currentTask.parsedData?.correctAnswer;
                        studentAnswerStr = answerValue;
                        break;
                    case 'SentenceBuilder':
                        correctAnswerStr = currentTask.parsedData?.correctOrder?.join(" ");
                        studentAnswerStr = Array.isArray(answerValue) ? answerValue.join(" ") : answerValue;
                        break;
                    case 'DragAndDrop':
                        correctAnswerStr = currentTask.parsedData?.items
                            ?.map((i: any) => `${i.text} -> ${i.category}`).join(", ");
                        studentAnswerStr = "Eroare la maparea categoriilor sub acoperire.";
                        break;
                    case 'VisualID':
                        correctAnswerStr = "Ținta corectă din imagine";
                        studentAnswerStr = "Agentul a scanat o zonă greșită.";
                        break;
                }

                socket.send(JSON.stringify({
                    type: "wrong_answer",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    task: currentTask.requirement,
                    taskIndex: currentTaskIndex,
                    details: {
                        question: currentTask.requirement,
                        correctAnswer: correctAnswerStr,
                        studentAnswer: studentAnswerStr,
                        context: currentTask.aiHintContext || "Focalizare pe protocoale lingvistice."
                    }
                }));
            }
            setTimeout(() => setFeedback('none'), 2000);
        }
    };

    const sendHelpRequest = () => {
        if (connectionStatus === 'reconnecting') {
            alert("Așteptați restabilirea legăturii securizate!");
            return;
        }

        if (socket?.readyState === WebSocket.OPEN && sessionContext) {
            socket.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: sessionContext.username,
                sessionId: sessionContext.sessionId,
                accessCode: sessionContext.accessCode
            }));
            alert("Solicitare de Backup trimisă către HQ!");
        }
    };

    return {
        screen,
        currentTasks,
        currentTaskIndex,
        score,
        feedback,
        connectionStatus,
        hasErrorOnTask,
        activePin,
        setActivePin,
        aiFeedback,
        feedbackSource,
        handleAnswer,
        sendHelpRequest
    };
};