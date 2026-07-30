'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function DroneEyeDashboard() {
  const [activeMode, setActiveMode] = useState('Detection');
  const [isMounted, setIsMounted] = useState(false);

  // 🚀 AI 서버로부터 받을 실시간 데이터 상태 관리
  const [counts, setCounts] = useState({ cars: 0, pedestrians: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  // ... 기존 코드 (상태 선언부) ...
  const modes = ['Detection', 'Tracking', 'Pose', 'Segmentation'];
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 🚀 새로 추가할 함수: 버튼 클릭 시 백엔드로 모드 변경 API 요청을 보냅니다
  const handleModeChange = async (selectedMode: string) => {
    setActiveMode(selectedMode);

    try {
      await fetch('http://localhost:8001/change_mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: selectedMode }),
      });
      // 로컬 터미널 UI에도 모드 변경을 기록
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 AI Mode Switched to ${selectedMode}`]);
    } catch (error) {
      console.error("Mode change failed:", error);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Failed to switch AI mode.`]);
    }
  };

  // 자동 스크롤 기능: 새 로그가 추가될 때마다 터미널 맨 아래로 스크롤
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    setIsMounted(true);

    // 초기 더미 로그 세팅
    const initTime = new Date().toLocaleTimeString();
    setLogs([
      `[${initTime}] System initializing...`,
      `[${initTime}] UI Component Mounted. Connecting to AI Server...`
    ]);

    // 🚀 WebSocket 연결 시도
    const ws = new WebSocket('ws://localhost:8001/ws');

    ws.onopen = () => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ WebSocket Connected to AI Backend.`]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentTime = new Date().toLocaleTimeString();

      // 카운팅 텍스트 업데이트
      setCounts({ cars: data.cars, pedestrians: data.pedestrians });

      // 터미널 로그 업데이트 (최대 20줄만 유지하여 메모리 최적화)
      setLogs(prevLogs => {
        const newLog = `[${currentTime}] ${data.log}`;
        // 이전 로그와 내용이 다를 때만 추가 (로그 폭탄 방지)
        if (prevLogs.length > 0 && prevLogs[prevLogs.length - 1].includes(data.log)) {
          return prevLogs;
        }
        const updatedLogs = [...prevLogs, newLog];
        return updatedLogs.slice(-20);
      });
    };

    ws.onerror = () => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ WebSocket Connection Error.`]);
    };

    // 컴포넌트 언마운트 시 WebSocket 안전하게 종료
    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  }, []);

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Drone-eye Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">Real-time AI Vision Analysis System</p>
          </div>
          <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
            <span className="text-sm text-green-400 font-medium">System Online (LG Gram Local)</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="relative bg-black rounded-xl border border-slate-800 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
              {/* 실시간 mediamtx WebRTC 영상 플레이어 */}
              {/*<iframe*/}
              {/*    src="http://localhost:8889/drone-eye"*/}
              {/*    className="w-full h-full object-cover"*/}
              {/*    allow="autoplay; fullscreen"*/}
              {/*></iframe>*/}

              {/* 🚀 변경된 코드: Python AI 서버가 쏴주는 실시간 분석 결과 영상 */}
              <img
                  src="http://localhost:8001/video_feed"
                  alt="AI Vision Stream"
                  className="w-full h-full object-cover"
              />

              {/* 🚀 AI 분석 카운트 메타데이터 연동 */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-lg text-sm text-green-400 font-mono shadow-lg">
                <span className="block font-bold text-white mb-1">Live Analytics</span>
                [Current Count: Cars {counts.cars}, Pedestrians {counts.pedestrians}]
              </div>

              <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-white font-bold tracking-wider uppercase">
                {activeMode} MODE
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <section className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                AI Processing Mode
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {modes.map((mode) => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeMode === mode
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-500'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent'
                        }`}
                    >
                      {mode}
                    </button>
                ))}
              </div>
            </section>

            <section className="bg-[#0a0a0a] p-5 rounded-xl border border-slate-800 shadow-xl flex-1 flex flex-col min-h-[300px] max-h-[400px]">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                System Terminal
              </h2>
              <div className="bg-black flex-1 rounded border border-slate-800 p-4 font-mono text-xs overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {isMounted ? (
                      logs.map((log, index) => (
                          <p key={index} className={log.includes('Error') || log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-cyan-400'}>
                            {log}
                          </p>
                      ))
                  ) : (
                      <p className="text-slate-500">Loading terminal logs...</p>
                  )}
                  {/* 자동 스크롤을 위한 빈 div */}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}