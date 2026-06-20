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

export const useAlgorithmAdventure = (sessionContext?: SessionContextData) => {
    const [screen, setScreen] = useState<'menu' | 'loading' | 'game' | 'result'>(
        sessionContext ? 'loading' : 'menu'
    );
    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [currentTasks, setCurrentTasks] = useState<GameTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [integrity, setIntegrity] = useState(0);

    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [hasErrorOnTask, setHasErrorOnTask] = useState(false);
    const [activePin, setActivePin] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [feedbackSource, setFeedbackSource] = useState<'AI' | 'ROBOT' | 'TEACHER' | null>(null);

    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const fetchLevelData = async () => {
            try {
                const data = await GameService.getAllLevels();
                if (data) setLevels(data);
            } catch (error) {
                console.log("nu merge sa iau nivelele", error);
            }
        };
        fetchLevelData();

        if (!sessionContext) return;
        let isComponentMounted = true;

        const connectToUplink = (retryCount = 0) => {
            if (!isComponentMounted) return;

            const ws = new WebSocket(`${APP_CONFIG.WS_BASE_URL}/ws_game`);

            ws.onopen = () => {
                if (!isComponentMounted) { ws.close(); return; }
                console.log("m-am conectat la backend");
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
                    window.location.reload();
                    return;
                }

                if (data.type === "BROADCAST_PIN") setActivePin(data.text);

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
                console.log("picat netul, incerc iar...");
                setConnectionStatus('reconnecting');

                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                reconnectTimeout.current = setTimeout(() => connectToUplink(retryCount + 1), delay);
            };

            ws.onerror = (err) => {
                console.log("eroare pe ws", err);
                ws.close();
            };

            setSocket(ws);
        };

        connectToUplink(0);

        return () => {
            isComponentMounted = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        };
    }, [sessionContext]);

    useEffect(() => {
        const handleOffline = () => {
            setConnectionStatus('reconnecting');
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        };

        window.addEventListener('offline', handleOffline);
        return () => window.removeEventListener('offline', handleOffline);
    }, [socket]);

    useEffect(() => {
        if (sessionContext?.levelId && screen === 'loading') {
            startLevel(sessionContext.levelId);
        }
    }, [sessionContext, screen]);

    const startLevel = async (levelId: number) => {
        setScreen('loading');
        setAiFeedback("");
        try {
            const tasks = await GameService.getLevelTasks(levelId);

            const parsedTasks = tasks.map(t => ({
                ...t,
                parsedData: typeof t.taskData === 'string' ? JSON.parse(t.taskData) : t.taskData
            }));
            setCurrentTasks(parsedTasks);

            let startingIndex = 0;
            if (sessionContext) {
                const joinUrl = `${APP_CONFIG.API_BASE_URL}/api/sessions/join?code=${sessionContext.accessCode}&name=${sessionContext.username}`;
                const res = await fetch(joinUrl, { method: 'POST' });

                if (res.ok) {
                    const progress = await res.json();
                    startingIndex = progress.currentTaskIndex || 0;
                } else {
                    alert("Sesiunea a fost închisă sau nu mai este valabilă.");
                    localStorage.removeItem('robot_active_session');
                    localStorage.removeItem('robot_student_code');
                    window.location.reload();
                    return;
                }
            }

            setCurrentTaskIndex(startingIndex);
            setIntegrity(Math.min(Math.round((startingIndex / parsedTasks.length) * 100), 100));

            if (startingIndex >= parsedTasks.length && parsedTasks.length > 0) {
                setScreen('result');
            } else {
                setScreen('game');
            }
        } catch (error) {
            setScreen('menu');
        }
    };

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
            const nextIntegrity = Math.min(integrity + 1 / 32 * 100, 100);
            const nextIndex = currentTaskIndex + 1;

            setIntegrity(nextIntegrity);
            setFeedback('correct');
            setAiFeedback("");

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "UPDATE_PROGRESS",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    taskIndex: nextIndex,
                    score: nextIntegrity
                }));
            }

            setTimeout(() => {
                setFeedback('none');
                if (currentTaskIndex < currentTasks.length - 1) setCurrentTaskIndex(nextIndex);
                else setScreen('result');
            }, 1500);
        } else {
            setHasErrorOnTask(true);
            setFeedback('wrong');

            const expectedAnswer = currentTask.parsedData?.correctAnswer ||
                currentTask.parsedData?.correctOrder?.join(', ') ||
                "Acțiune vizuală corectă";

            let studentAnsText = String(answerValue);
            if (Array.isArray(answerValue)) studentAnsText = answerValue.join(', ');

            if (socket?.readyState === WebSocket.OPEN && sessionContext) {
                socket.send(JSON.stringify({
                    type: "wrong_answer",
                    username: sessionContext.username,
                    accessCode: sessionContext.accessCode,
                    sessionId: sessionContext.sessionId,
                    task: currentTask.requirement,
                    taskIndex: currentTaskIndex,
                    details: {
                        question: currentTask.requirement,
                        correctAnswer: expectedAnswer,
                        studentAnswer: studentAnsText,
                        context: currentTask.aiHintContext || "Analizează cerința și graficul aferent."
                    }
                }));
            }
            setTimeout(() => setFeedback('none'), 2000);
        }
    };

    const sendHelpRequest = () => {
        if (connectionStatus === 'reconnecting') return;
        if (socket?.readyState === WebSocket.OPEN && sessionContext) {
            socket.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: sessionContext.username,
                sessionId: sessionContext.sessionId,
                accessCode: sessionContext.accessCode
            }));
            alert("Solicitare transmisă terminalului central. Așteaptă date de la AI sau Profesor.");
        }
    };

    return {
        screen,
        currentTasks,
        currentTaskIndex,
        integrity,
        feedback,
        connectionStatus,
        hasErrorOnTask,
        aiFeedback,
        feedbackSource,
        handleAnswer,
        sendHelpRequest
    };
};