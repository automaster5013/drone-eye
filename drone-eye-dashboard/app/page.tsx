'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function DroneEyeDashboard() {
  const [activeMode, setActiveMode] = useState('Tactical HUD');
  const [activeSource, setActiveSource] = useState('live'); // 🚀 영상 소스 상태
  const [isMounted, setIsMounted] = useState(false);
  const [counts, setCounts] = useState({ hardhat: 0, no_hardhat: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const [telemetry, setTelemetry] = useState({
    alt: 124.5, spd: 45.2, bat: 98, pitch: 0.2, roll: -1.5,
  });

  const modes = ['Tactical HUD', 'Detection', 'Tracking', 'Pose', 'Segmentation'];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    setIsMounted(true);
    const initTime = new Date().toLocaleTimeString();
    setLogs([`[${initTime}] Core System Online.`, `[${initTime}] Initializing Neural Network...`]);

    const ws = new WebSocket('ws://localhost:8001/ws');
    ws.onopen = () => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ AI Server & GPU Linked.`]);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCounts({ hardhat: data.hardhat, no_hardhat: data.no_hardhat });
      setLogs(prev => {
        const newLog = `[${new Date().toLocaleTimeString()}] ${data.log}`;
        if (prev.length > 0 && prev[prev.length - 1].includes(data.log)) return prev;
        return [...prev, newLog].slice(-25);
      });
    };

    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        alt: +(prev.alt + (Math.random() - 0.5) * 2).toFixed(1),
        spd: +(prev.spd + (Math.random() - 0.5) * 3).toFixed(1),
        bat: prev.bat > 20 ? prev.bat - 0.01 : 98,
        pitch: +(Math.random() * 4 - 2).toFixed(1),
        roll: +(Math.random() * 6 - 3).toFixed(1),
      }));
    }, 100);

    return () => {
      if (ws.readyState === 1) ws.close();
      clearInterval(telemetryInterval);
    };
  }, []);

  const handleModeChange = async (selectedMode: string) => {
    setActiveMode(selectedMode);
    try {
      await fetch('http://localhost:8001/change_mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode }),
      });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Activated Module: ${selectedMode}`]);
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Module Shift Failed.`]);
    }
  };

  // 🚀 영상 소스 스왑 핸들러
  const handleSourceChange = async (source: string) => {
    setActiveSource(source);
    try {
      await fetch('http://localhost:8001/change_source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📡 Data Feed Rerouted: ${source.toUpperCase()}`]);
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Source Reroute Failed.`]);
    }
  };

  const isTargetAcquired = counts.no_hardhat > 0;
  const isHudMode = activeMode === 'Tactical HUD';

  return (
      <div className="min-h-screen bg-[#020202] text-cyan-400 p-4 sm:p-6 font-mono overflow-hidden select-none flex flex-col">
        <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .animate-scanline { animation: scanline 4s linear infinite; }
        .glass-panel { background: rgba(8, 145, 178, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(8, 145, 178, 0.2); }
      `}} />

        {/* 🚀 Header */}
        <header className="mb-4 flex items-center justify-between border-b-2 border-cyan-900/60 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
              DRONE-EYE :: NEXUS
            </h1>
            <p className="text-xs text-cyan-600 mt-1 uppercase tracking-[0.3em]">YOLO26m GPU-Accelerated Vision Core v3.0</p>
          </div>
          <div className="flex items-center space-x-6 text-xs tracking-widest font-bold">
            <div className="flex flex-col items-end">
              <span className="text-emerald-400">STATUS: OPTIMAL</span>
              <span className="text-cyan-600">RTX 5060 ENGAGED</span>
            </div>
          </div>
        </header>

        {/* 🚀 Main Grid Layout (새로운 3단 구조 개편) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          {/* LEFT PANEL: Data Feed & Telemetry */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <section className="glass-panel p-4 rounded-md shadow-lg shadow-cyan-900/10">
              <h2 className="text-sm font-bold text-cyan-300 mb-4 flex items-center gap-2 tracking-widest uppercase border-b border-cyan-900/50 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Data Source
              </h2>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleSourceChange('live')} className={`py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all duration-300 border rounded-sm flex justify-between items-center ${activeSource === 'live' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-black/50 text-cyan-800 border-cyan-900/50 hover:border-cyan-600 hover:text-cyan-500'}`}>
                  <span>Live Drone (RTSP)</span>
                  {activeSource === 'live' && <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>}
                </button>
                <button onClick={() => handleSourceChange('video')} className={`py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all duration-300 border rounded-sm flex justify-between items-center ${activeSource === 'video' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-black/50 text-cyan-800 border-cyan-900/50 hover:border-emerald-700 hover:text-emerald-500'}`}>
                  <span>Simulation (VOD)</span>
                  {activeSource === 'video' && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>}
                </button>
              </div>
              <p className="text-[9px] text-cyan-700 mt-4 leading-relaxed uppercase">
                * Switch between live PRISM feed and high-res test simulation instantly without core restart.
              </p>
            </section>

            <section className="glass-panel p-4 rounded-md flex-1">
              <h2 className="text-sm font-bold text-cyan-300 mb-4 tracking-widest uppercase border-b border-cyan-900/50 pb-2">Telemetry</h2>
              <div className="flex flex-col gap-4 text-xs tracking-wider">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">ALTITUDE</span>
                  <span className="font-bold">{telemetry.alt.toFixed(1)} M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">AIR SPEED</span>
                  <span className="font-bold">{telemetry.spd.toFixed(1)} KN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">PITCH</span>
                  <span className="font-bold">{telemetry.pitch > 0 ? '+' : ''}{telemetry.pitch.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">ROLL</span>
                  <span className="font-bold">{telemetry.roll > 0 ? '+' : ''}{telemetry.roll.toFixed(1)}°</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-cyan-700">POWER</span>
                    <span className="font-bold">{telemetry.bat.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${telemetry.bat}%` }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CENTER PANEL: Main Viewer */}
          <div className="lg:col-span-6 flex flex-col relative h-[400px] lg:h-auto">
            <div className={`relative bg-black rounded-lg border-2 w-full h-full ${isHudMode ? 'border-cyan-500/60 shadow-[0_0_40px_rgba(8,145,178,0.25)]' : 'border-slate-800 shadow-2xl'} flex items-center justify-center overflow-hidden group`}>

              <img src="http://localhost:8001/video_feed" alt="AI Stream" className="absolute w-full h-full object-cover" />

              {/* Tactical HUD Mode Effects */}
              {isHudMode && (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-[15%] bg-cyan-400/10 blur-[10px] animate-scanline pointer-events-none"></div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                      <div className="w-40 h-40 border border-cyan-400/50 rounded-full flex items-center justify-center relative">
                        <div className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]"></div>
                        <div className="absolute top-0 w-[1px] h-6 bg-cyan-400"></div>
                        <div className="absolute bottom-0 w-[1px] h-6 bg-cyan-400"></div>
                        <div className="absolute left-0 w-6 h-[1px] bg-cyan-400"></div>
                        <div className="absolute right-0 w-6 h-[1px] bg-cyan-400"></div>
                      </div>
                    </div>

                    {isTargetAcquired && (
                        <div className="absolute top-[20%] flex flex-col items-center pointer-events-none">
                          <span className="text-red-500 font-extrabold text-2xl tracking-[0.3em] animate-pulse border-y-2 border-red-500 bg-red-950/40 px-6 py-2 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.5)]">TARGET ACQUIRED</span>
                        </div>
                    )}

                    {/* 4 Corners */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-lg"></div>
                  </>
              )}

              {/* Educational Mode Overlays */}
              {!isHudMode && (
                  <>
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border-l-4 border-emerald-500 px-4 py-2 rounded-r-md text-sm text-white font-mono shadow-xl">
                      <span className="block text-[10px] text-emerald-400 mb-1 uppercase tracking-widest">Active Analysis</span>
                      {/* 🚀 [수정 4] UI 텍스트 변경 */}
                      Hardhat: {counts.hardhat} | NO-Hardhat: <span className={counts.no_hardhat > 0 ? "text-red-400 font-bold" : ""}>{counts.no_hardhat}</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm px-4 py-1.5 rounded-sm text-xs text-white font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                      {activeMode} MODE
                    </div>
                  </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: AI Modules & Terminal */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <section className="glass-panel p-4 rounded-md">
              <h2 className="text-sm font-bold text-cyan-300 mb-4 tracking-widest uppercase border-b border-cyan-900/50 pb-2">Neural Modules</h2>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleModeChange(modes[0])} className={`py-4 px-2 text-sm font-extrabold tracking-widest uppercase transition-all duration-300 border w-full rounded-sm ${ activeMode === modes[0] ? 'bg-gradient-to-r from-cyan-900/80 to-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.3)]' : 'bg-black/50 text-cyan-700 border-cyan-900/50 hover:border-cyan-500 hover:text-cyan-400' }`}>
                  ★ {modes[0]}
                </button>

                <div className="w-full h-[1px] bg-cyan-900/60 my-2"></div>

                <div className="grid grid-cols-2 gap-2">
                  {modes.slice(1).map((mode) => (
                      <button key={mode} onClick={() => handleModeChange(mode)} className={`py-3 px-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-200 border rounded-sm ${ activeMode === mode ? 'bg-blue-900/40 text-blue-300 border-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.4)]' : 'bg-black/50 text-slate-500 border-slate-800 hover:border-blue-800 hover:text-blue-400' }`}>
                        {mode}
                      </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 🚀 수정된 부분: 터미널 높이를 300px로 절대 고정 (h-[300px]) */}
            <section className="glass-panel p-4 rounded-md flex flex-col h-[300px]">
              <h2 className="text-sm font-bold text-cyan-300 mb-4 flex items-center justify-between tracking-widest uppercase border-b border-cyan-900/50 pb-2">
                <span>System Log</span>
                <span className="text-[9px] text-emerald-400 border border-emerald-400/50 px-1 rounded">LIVE</span>
              </h2>

              {/* 내부 스크롤(overflow-y-auto)이 이 영역 안에서만 작동하도록 제한 */}
              <div className="bg-black/90 flex-1 border border-cyan-900/40 p-3 font-mono text-[10px] overflow-y-auto rounded-sm scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                <div className="flex flex-col gap-2">
                  {isMounted ? (
                      logs.map((log, index) => (
                          <p key={index} className={`break-words ${log.includes('Failed') || log.includes('❌') ? 'text-red-500' : log.includes('✅') || log.includes('Switched') ? 'text-emerald-400' : log.includes('🔄') ? 'text-yellow-400' : 'text-cyan-500/80'}`}>
                            {log}
                          </p>
                      ))
                  ) : (
                      <p className="text-cyan-800 animate-pulse">Establishing uplink...</p>
                  )}
                  {/* 이 투명한 div가 항상 스크롤을 맨 아래로 당겨주는 역할을 합니다 */}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}