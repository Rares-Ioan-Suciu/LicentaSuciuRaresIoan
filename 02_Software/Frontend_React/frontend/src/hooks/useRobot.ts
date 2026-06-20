import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config';

export const useRobot = () => {
    const defaultIp = APP_CONFIG.ROBOT_IP ? APP_CONFIG.ROBOT_IP.replace('http://', '') : '192.168.1.7';

    const [robotIp, setRobotIp] = useState<string>(defaultIp);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [lastPing, setLastPing] = useState<number>(0);
    const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.7);
    const [autoPilot, setAutoPilot] = useState<boolean>(false);
    const [obstacleWarning, setObstacleWarning] = useState<boolean>(false);

    useEffect(() => {
        if (!isConnected || !robotIp) return;
        const heartbeat = setInterval(() => {
            const start = Date.now();
            fetch(`http://${robotIp}/ping`)
                .then(res => res.text())
                .then(text => {
                    setLastPing(Date.now() - start);
                    setObstacleWarning(text === 'OBSTACLE');
                })
                .catch(() => setIsConnected(false));
        }, 500);
        return () => clearInterval(heartbeat);
    }, [isConnected, robotIp]);

    useEffect(() => {
        if (!isConnected || !robotIp) return;
        const activeKeys = new Set<string>();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            const key = e.key.toLowerCase();

            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                if (activeKeys.has(key)) return;
                activeKeys.add(key);

                let left = 0; let right = 0;
                const speed = 255 * speedMultiplier;

                if (key === 'w') { left = speed; right = speed; }
                else if (key === 's') { left = -speed; right = -speed; }
                else if (key === 'a') { left = -speed; right = speed; }
                else if (key === 'd') { left = speed; right = -speed; }

                fetch(`http://${robotIp}/joystick?left=${Math.round(left)}&right=${Math.round(right)}`).catch(() => { });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                activeKeys.delete(key);
                fetch(`http://${robotIp}/joystick?left=0&right=0`).catch(() => { });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isConnected, robotIp, speedMultiplier]);

    const handleMove = useCallback((event: any) => {
        if (!isConnected || !robotIp) return;
        const scale = 255 * speedMultiplier;
        let left = (event.y + event.x) * scale;
        let right = (event.y - event.x) * scale;

        left = Math.max(-255, Math.min(255, left));
        right = Math.max(-255, Math.min(255, right));

        fetch(`http://${robotIp}/joystick?left=${Math.round(left)}&right=${Math.round(right)}`).catch(() => { });
    }, [isConnected, robotIp, speedMultiplier]);

    const handleStop = useCallback(() => {
        if (!isConnected || !robotIp) return;
        fetch(`http://${robotIp}/joystick?left=0&right=0`).catch(() => { });
    }, [isConnected, robotIp]);

    const toggleAutoPilot = () => {
        const newState = !autoPilot;
        setAutoPilot(newState);
        fetch(`http://${robotIp}/autopilot?state=${newState ? 1 : 0}`).catch(() => { });
    };

    const handleCapture = () => {
        if (!isConnected || !robotIp) return;
        const photoWindow = window.open('', '_blank');
        if (photoWindow) {
            photoWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sistem Captură Video</title>
            <style>
              body { background-color: #0f172a; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Segoe UI', sans-serif; color: white; }
              .image-container { transform: rotate(90deg) scaleY(-1); margin: 50px; }
              img { max-width: 800px; border: 1px solid #334155; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
            </style>
          </head>
          <body>
            <div class="image-container"><img src="http://${robotIp}/capture?t=${Date.now()}" alt="Captura HD" /></div>
          </body>
        </html>
      `);
            photoWindow.document.close();
        }
    };

    const triggerEmote = (id: number) => {
        if (!isConnected || !robotIp) return;
        fetch(`http://${robotIp}/emote?id=${id}`).catch(() => { });
    };

    return {
        robotIp, setRobotIp,
        isConnected, setIsConnected,
        lastPing,
        speedMultiplier, setSpeedMultiplier,
        autoPilot, toggleAutoPilot,
        obstacleWarning,
        handleMove, handleStop,
        handleCapture, triggerEmote
    };
};