import React, { useState, useRef, useEffect } from 'react';

interface BotSimulatorProps {
    accessCode: string;
    sessionId: number;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({ accessCode, sessionId }) => {
    const [bots, setBots] = useState<string[]>([]);
    // Ținem referințele către WebSocket-urile boților ca să le putem da comenzi
    const botSockets = useRef<{ [key: string]: WebSocket }>({});

    // Curățăm boții când închidem panoul
    useEffect(() => {
        return () => {
            Object.values(botSockets.current).forEach(ws => ws.close());
        };
    }, []);

    const spawnBots = (count: number) => {
        const newBots: string[] = [];
        for (let i = 1; i <= count; i++) {
            const botName = `🤖_Bot_${Math.floor(Math.random() * 1000)}`;
            newBots.push(botName);

            const ws = new WebSocket("ws://localhost:8080/ws_game");
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: "JOIN",
                    role: "STUDENT",
                    username: botName,
                    accessCode: accessCode
                }));
            };
            botSockets.current[botName] = ws;
        }
        setBots(prev => [...prev, ...newBots]);
    };

    const triggerHelp = (botName: string) => {
        const ws = botSockets.current[botName];
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "HELP_REQUEST",
                username: botName,
                sessionId: sessionId,
                accessCode: accessCode
            }));
        }
    };

    const triggerWrongAnswer = (botName: string) => {
        const ws = botSockets.current[botName];
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "wrong_answer",
                username: botName,
                accessCode: accessCode,
                sessionId: sessionId,
                task: "Întrebare simulată",
                taskIndex: 1,
                details: {
                    question: "Cât fac 2+2?",
                    correctAnswer: "4",
                    studentAnswer: "5",
                    context: "Eroare generată de simulator"
                }
            }));
        }
    };

    return (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e293b', borderRadius: '10px', color: 'white', border: '2px dashed #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#f59e0b' }}>🧪 Dev Tools: Simulator Trafic</h3>
                <button
                    onClick={() => spawnBots(3)}
                    style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Adaugă 3 Boți
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {bots.map(botName => (
                    <div key={botName} style={{ backgroundColor: '#334155', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                        <strong style={{ display: 'block', marginBottom: '10px' }}>{botName}</strong>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => triggerWrongAnswer(botName)} style={{ flex: 1, padding: '5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                ❌ Greșește
                            </button>
                            <button onClick={() => triggerHelp(botName)} style={{ flex: 1, padding: '5px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                ✋ Cere Ajutor
                            </button>
                        </div>
                    </div>
                ))}
                {bots.length === 0 && <span style={{ color: '#94a3b8' }}>Niciun bot activ.</span>}
            </div>
        </div>
    );
};