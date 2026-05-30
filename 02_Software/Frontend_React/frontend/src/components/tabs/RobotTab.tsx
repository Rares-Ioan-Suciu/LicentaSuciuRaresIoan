import React, { useState, useEffect, useCallback } from 'react';
import { Joystick } from 'react-joystick-component';

export const RobotTab: React.FC = () => {
  const [robotIp, setRobotIp] = useState<string>('192.168.1.7');
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
    fetch(`http://${robotIp}/emote?id=${id}`).catch(err => console.error("Eroare emote:", err));
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Sistem Beatrix 4WD</h1>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <input
              type="text"
              value={robotIp}
              onChange={(e) => setRobotIp(e.target.value)}
              placeholder="Adresă IP (ex: 192.168.1.7)"
              style={{ padding: '12px 15px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '220px', fontSize: '14px', backgroundColor: 'white' }}
            />
            <button
              onClick={() => setIsConnected(!isConnected)}
              style={{ padding: '12px 25px', backgroundColor: isConnected ? '#ef4444' : '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', transition: '0.2s' }}
            >
              {isConnected ? 'Deconectare' : 'Conectare Sistem'}
            </button>
          </div>
        </div>

        {!isConnected ? (
          <div style={{ textAlign: 'center', marginTop: '100px', padding: '60px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#334155', fontSize: '22px', fontWeight: 600, textTransform: 'uppercase' }}>Conexiune Inactivă</h3>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Introduceți adresa IP a unității pentru a iniția conexiunea securizată.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 900px) 1fr', gap: '30px' }}>

            <div style={{ backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', border: '2px solid #1e293b', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              <img
                src={`http://${robotIp}:81/stream`}
                alt="Video Feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'rotate(90deg) scaleY(-1)' }}
              />

              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: '#00ffcc', fontFamily: 'monospace' }}>
                <div style={{ position: 'absolute', top: '25px', left: '25px', width: '30px', height: '30px', borderTop: '3px solid rgba(0, 255, 204, 0.8)', borderLeft: '3px solid rgba(0, 255, 204, 0.8)' }}></div>
                <div style={{ position: 'absolute', top: '25px', right: '25px', width: '30px', height: '30px', borderTop: '3px solid rgba(0, 255, 204, 0.8)', borderRight: '3px solid rgba(0, 255, 204, 0.8)' }}></div>
                <div style={{ position: 'absolute', bottom: '25px', left: '25px', width: '30px', height: '30px', borderBottom: '3px solid rgba(0, 255, 204, 0.8)', borderLeft: '3px solid rgba(0, 255, 204, 0.8)' }}></div>
                <div style={{ position: 'absolute', bottom: '25px', right: '25px', width: '30px', height: '30px', borderBottom: '3px solid rgba(0, 255, 204, 0.8)', borderRight: '3px solid rgba(0, 255, 204, 0.8)' }}></div>

                <div style={{ position: 'absolute', top: '40px', left: '40px', textShadow: '1px 1px 3px #000', fontSize: '15px', lineHeight: '1.6' }}>
                  <span style={{ fontWeight: 'bold' }}>SYS_READY</span><br />TGT_IP: {robotIp}<br />LATENCY: {lastPing}ms
                </div>
                <div style={{ position: 'absolute', top: '40px', right: '40px', textShadow: '1px 1px 3px #000', fontSize: '15px', textAlign: 'right' }}>
                  MODE: {autoPilot ? 'AUTO_NAV' : 'MANUAL_OVR'}
                </div>
              </div>

              {obstacleWarning && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(220, 38, 38, 0.9)', color: 'white', padding: '15px 30px',
                  borderRadius: '4px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px',
                  border: '2px solid white', textShadow: '1px 1px 0px #000', zIndex: 10,
                  textAlign: 'center', textTransform: 'uppercase'
                }}>
                  AVERTISMENT COLIZIUNE
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Reacții Robot</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => triggerEmote(1)} style={{ ...actionBtnStyle, flex: 1, padding: '12px', backgroundColor: '#10b981', fontSize: '13px' }}>Victorie</button>
                  <button onClick={() => triggerEmote(2)} style={{ ...actionBtnStyle, flex: 1, padding: '12px', backgroundColor: '#ef4444', fontSize: '13px' }}>Eșec</button>
                  <button onClick={() => triggerEmote(3)} style={{ ...actionBtnStyle, flex: 1, padding: '12px', backgroundColor: '#8b5cf6', fontSize: '13px' }}>Rotire</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={toggleAutoPilot} style={{ ...actionBtnStyle, flex: 1, padding: '15px', fontSize: '14px', backgroundColor: autoPilot ? '#ef4444' : '#0f172a', letterSpacing: '1px' }}>
                  {autoPilot ? 'OPREȘTE AUTOPILOT' : 'AUTOPILOT'}
                </button>

                <button onClick={handleCapture} style={{ ...actionBtnStyle, flex: 1, padding: '15px', fontSize: '14px', backgroundColor: '#3b82f6', letterSpacing: '1px' }}>
                  FOTO
                </button>
              </div>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Viteze</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ label: 'LENT', val: 0.4 }, { label: 'NORMAL', val: 0.7 }, { label: 'RAPID', val: 1.0 }].map((mode) => (
                    <button key={mode.val} onClick={() => setSpeedMultiplier(mode.val)}
                      style={{ flex: 1, padding: '12px', border: '2px solid', borderColor: speedMultiplier === mode.val ? '#0f172a' : '#e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', backgroundColor: speedMultiplier === mode.val ? '#0f172a' : 'white', color: speedMultiplier === mode.val ? 'white' : '#64748b', transition: '0.2s' }}
                    > {mode.label} </button>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <Joystick size={180} sticky={false} baseColor="#f1f5f9" stickColor="#334155" move={handleMove} stop={handleStop} />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = { border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase' };