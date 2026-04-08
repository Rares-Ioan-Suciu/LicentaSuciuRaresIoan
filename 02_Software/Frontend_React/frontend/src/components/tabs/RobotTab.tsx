import React, { useState, useEffect, useCallback } from 'react';
import { Joystick } from 'react-joystick-component';

export const RobotTab: React.FC = () => {
  const [robotIp, setRobotIp] = useState<string>('192.168.1.140');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastPing, setLastPing] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.7);

  // --- NOU: STATE PENTRU AUTOPILOT SI TELEMETRIE ---
  const [autoPilot, setAutoPilot] = useState<boolean>(false);
  const [obstacleWarning, setObstacleWarning] = useState<boolean>(false);

  // --- ACTUALIZAT: HEARTBEAT SI VERIFICARE OBSTACOLE ---
  useEffect(() => {
    if (!isConnected || !robotIp) return;
    const heartbeat = setInterval(() => {
      const start = Date.now();
      fetch(`http://${robotIp}/ping`)
        .then(res => res.text()) // Citim raspunsul ca text (poate fi "OK" sau "OBSTACLE")
        .then(text => {
          setLastPing(Date.now() - start);
          setObstacleWarning(text === 'OBSTACLE'); // Daca e obstacol, declansam alerta
        })
        .catch(() => setIsConnected(false));
    }, 500); // Frecventa crescuta la 2 pe secunda pentru reactie rapida
    return () => clearInterval(heartbeat);
  }, [isConnected, robotIp]);

  // CONTROL TASTATURA
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
        else if (key === 'a') { left = -speed * 0.6; right = speed * 0.6; }
        else if (key === 'd') { left = speed * 0.6; right = -speed * 0.6; }

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

  // CONTROL JOYSTICK
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

  const triggerAction = (action: string) => {
    fetch(`http://${robotIp}/${action}`).catch(() => { });
  };

  const triggerEmote = (id: number) => {
    fetch(`http://${robotIp}/emote?id=${id}`).catch(() => { });
  };

  // --- NOU: FUNCTIA PENTRU AUTOPILOT ---
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
            <title>Captură Beatrix HD</title>
            <style>
              body { background-color: #0f172a; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Segoe UI', sans-serif; color: white; }
              .image-container { transform: rotate(90deg) scaleY(-1); margin: 50px; }
              img { max-width: 800px; border: 4px solid #334155; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
              .info { position: fixed; bottom: 30px; text-align: center; color: #94a3b8; }
            </style>
          </head>
          <body>
            <h2 style="position: fixed; top: 30px; color: #38bdf8;">📸 Captură de Înaltă Rezoluție</h2>
            <div class="image-container"><img src="http://${robotIp}/capture?t=${Date.now()}" alt="Captura HD" /></div>
            <div class="info"><p>Pentru a salva poza rotită corect, folosește un utilitar de screenshot.</p></div>
          </body>
        </html>
      `);
      photoWindow.document.close();
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '32px', fontWeight: 900 }}>Sistem Beatrix 4WD</h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '16px' }}>Centru de comandă și telemetrie avansată</p>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <input
              type="text"
              value={robotIp}
              onChange={(e) => setRobotIp(e.target.value)}
              placeholder="IP Robot (ex: 192.168.1.140)"
              aria-label="Adresă IP Robot"
              title="Adresă IP Robot"
              style={{ padding: '15px', borderRadius: '8px', border: '1px solid #dcdde1', outline: 'none', width: '220px', fontSize: '16px' }}
            />
            <button
              onClick={() => setIsConnected(!isConnected)}
              style={{ padding: '15px 30px', backgroundColor: isConnected ? '#e74c3c' : '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              {isConnected ? 'Deconectare Sistem' : 'Conectare Robot'}
            </button>
          </div>
        </div>

        {!isConnected ? (
          <div style={{ textAlign: 'center', marginTop: '100px', padding: '60px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤖</div>
            <h3 style={{ color: '#2c3e50', fontSize: '24px' }}>Robotul nu este conectat</h3>
            <p style={{ color: '#7f8c8d', fontSize: '18px' }}>Introdu IP-ul robotului și asigură-te că acesta este alimentat.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 800px) 1fr', gap: '50px' }}>

            {/* STANGA: VIDEO SI HUD */}
            <div>
              <div style={{ backgroundColor: '#000', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', aspectRatio: '4/3', border: '4px solid #34495e' }}>
                <img
                  src={`http://${robotIp}:81/stream`}
                  alt="Robot Feed"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'rotate(90deg) scaleY(-1)' }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: '#00ffcc', fontFamily: 'monospace' }}>
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderTop: '3px solid rgba(0, 255, 204, 0.7)', borderLeft: '3px solid rgba(0, 255, 204, 0.7)' }}></div>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderTop: '3px solid rgba(0, 255, 204, 0.7)', borderRight: '3px solid rgba(0, 255, 204, 0.7)' }}></div>
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '30px', height: '30px', borderBottom: '3px solid rgba(0, 255, 204, 0.7)', borderLeft: '3px solid rgba(0, 255, 204, 0.7)' }}></div>
                  <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '30px', height: '30px', borderBottom: '3px solid rgba(0, 255, 204, 0.7)', borderRight: '3px solid rgba(0, 255, 204, 0.7)' }}></div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '40px', height: '2px', backgroundColor: 'rgba(0, 255, 204, 0.5)', transform: 'translate(-50%, -50%)' }}></div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '2px', height: '40px', backgroundColor: 'rgba(0, 255, 204, 0.5)', transform: 'translate(-50%, -50%)' }}></div>
                  <div style={{ position: 'absolute', top: '40%', left: '50%', width: '80px', height: '1px', borderTop: '1px dashed rgba(0, 255, 204, 0.4)', transform: 'translate(-50%, 0)' }}></div>
                  <div style={{ position: 'absolute', top: '60%', left: '50%', width: '80px', height: '1px', borderTop: '1px dashed rgba(0, 255, 204, 0.4)', transform: 'translate(-50%, 0)' }}></div>

                  <div style={{ position: 'absolute', top: '35px', left: '35px', textShadow: '1px 1px 2px #000', fontSize: '14px', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: 'bold' }}>SYS_READY</span><br />TGT_IP: {robotIp}<br />LATENCY: {lastPing}ms
                  </div>
                  <div style={{ position: 'absolute', top: '35px', right: '35px', textShadow: '1px 1px 2px #000', fontSize: '14px', textAlign: 'right' }}>
                    MODE: {autoPilot ? 'AUTO' : 'MANUAL'}
                  </div>
                  <div style={{ position: 'absolute', bottom: '35px', right: '35px', backgroundColor: 'rgba(231, 76, 60, 0.9)', padding: '5px 12px', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 0 10px rgba(231,76,60,0.6)' }}>
                    REC ●
                  </div>
                </div>

               
                  {/* --- ALERTA DE OBSTACOL INTELIGENTA --- */}
                  {obstacleWarning && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(231, 76, 60, 0.85)', color: 'white', padding: '15px 30px',
                      borderRadius: '10px', fontSize: '24px', fontWeight: '900', letterSpacing: '2px',
                      border: '3px solid white', textShadow: '2px 2px 0px #000', zIndex: 10,
                      boxShadow: '0 0 30px rgba(231, 76, 60, 1)', textAlign: 'center'
                    }}>
                      {autoPilot ? '⚠️ OBSTACOL DETECTAT ⚠️' : '🛑 PERICOL COLIZIUNE 🛑'}<br />
                      <span style={{ fontSize: '14px', display: 'block', marginTop: '5px' }}>
                        {autoPilot ? 'RUTARE ALTERNATIVĂ...' : 'FRÂNARE AUTOMATĂ DE URGENȚĂ ACTIVATĂ'}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* DREAPTA: CONTROALE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* BUTONUL MASIV DE AUTOPILOT */}
              <button
                onClick={toggleAutoPilot}
                style={{ ...actionBtnStyle, padding: '20px', fontSize: '18px', backgroundColor: autoPilot ? '#e74c3c' : '#2980b9' }}
              >
                {autoPilot ? '🛑 DEZACTIVEAZĂ AUTOPILOT' : '🤖 ACTIVEAZĂ AUTOPILOT'}
              </button>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>✨ Acțiuni Speciale</h4>
                  <button onClick={handleCapture} style={{ padding: '8px 15px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    📸 CAPTURĂ FOTO
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <button onClick={() => triggerEmote(1)} style={{ ...actionBtnStyle, backgroundColor: '#2ecc71', fontSize: '13px', padding: '12px' }}>🎉 Victorie</button>
                  <button onClick={() => triggerEmote(2)} style={{ ...actionBtnStyle, backgroundColor: '#e67e22', fontSize: '13px', padding: '12px' }}>😢 Eșec</button>
                  <button onClick={() => triggerEmote(3)} style={{ ...actionBtnStyle, backgroundColor: '#3498db', fontSize: '13px', padding: '12px' }}>🌀 Radar 360</button>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>⚙️ Limitator Viteză: {Math.round(speedMultiplier * 100)}%</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ label: '🐢 Melc', val: 0.4, color: '#f39c12' }, { label: '🚗 Normal', val: 0.7, color: '#3498db' }, { label: '⚡ Sport', val: 1.0, color: '#e74c3c' }].map((mode) => (
                    <button key={mode.val} onClick={() => setSpeedMultiplier(mode.val)}
                      style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: speedMultiplier === mode.val ? mode.color : '#ecf0f1', color: speedMultiplier === mode.val ? 'white' : '#7f8c8d' }}
                    > {mode.label} </button>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
                  <Joystick size={200} sticky={false} baseColor="#f1f2f6" stickColor="#3498db" move={handleMove} stop={handleStop} />
                </div>
                <div style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '14px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontWeight: 'bold', color: '#2c3e50' }}>
                    {['W', 'A', 'S', 'D'].map(key => (<span key={key} style={{ padding: '3px 10px', backgroundColor: '#e2e8f0', borderRadius: '6px', border: '1px solid #cbd5e1' }}>{key}</span>))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onMouseDown={() => triggerAction('go')} onMouseUp={() => triggerAction('stop')} style={{ ...actionBtnStyle, padding: '12px' }}>📢 CLAXON</button>
                <button onClick={() => triggerAction('ledon')} style={{ ...actionBtnStyle, backgroundColor: '#f1c40f', color: '#333', padding: '12px' }}>💡 FLASH ON</button>
                <button onClick={() => triggerAction('ledoff')} style={{ ...actionBtnStyle, backgroundColor: '#7f8c8d', padding: '12px' }}>🔌 FLASH OFF</button>
                <button onClick={() => triggerAction('stop')} style={{ ...actionBtnStyle, backgroundColor: '#e74c3c', padding: '12px' }}>🛑 STOP</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = { border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center' };