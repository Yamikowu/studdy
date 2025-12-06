// src/pages/FocusPage.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import CharacterAnimation from '../components/CharacterAnimation';

const POMODORO_MUSIC_PATH = '/audio/01.mp3';
const BREAK_MUSIC_PATH = '/audio/02.mp3';
const ALERT_SOUND_PATH = '/audio/03.mp3';

const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_SHORT_BREAK_TIME = 5;
const DEFAULT_LONG_BREAK_TIME = 15;

function FocusPage() {
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_POMODORO_TIME * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [volume, setVolume] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  
  const [pomodoroMinutes, setPomodoroMinutes] = useState(DEFAULT_POMODORO_TIME);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULT_SHORT_BREAK_TIME);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULT_LONG_BREAK_TIME);

  const audioRef = useRef(null);

  const alertSound = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(ALERT_SOUND_PATH);
      audio.addEventListener('ended', () => setIsRunning(true));
      return audio;
    }
    return null;
  }, []);

  // 應用設定
  const handleApplySettings = () => {
    setTimeRemaining(pomodoroMinutes * 60);
    setTimerMode('pomodoro');
    setIsRunning(false);
    setPomodoroCount(0);
    setShowSettings(false);
  };

  // 音樂播放控制
  useEffect(() => {
    if (!audioRef.current) return;

    const musicPath = timerMode === 'pomodoro' ? POMODORO_MUSIC_PATH : BREAK_MUSIC_PATH;
    
    if (audioRef.current.src !== window.location.origin + musicPath) {
      audioRef.current.src = musicPath;
      audioRef.current.load();
    }

    if (isRunning) {
      audioRef.current.play().catch(error => console.error("播放失敗:", error));
    } else {
      audioRef.current.pause();
    }
  }, [isRunning, timerMode]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // 計時器
  useEffect(() => {
    if (!isRunning || timeRemaining === 0) return;
    const intervalId = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, timeRemaining]);

  // 時間到處理
  useEffect(() => {
    if (timeRemaining !== 0) return;
    
    setIsRunning(false);
    
    if (alertSound) alertSound.play().catch(e => console.log(e));
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([300, 100, 300, 100, 300]);
    }
    
    let nextMode = 'pomodoro';
    let nextTime = pomodoroMinutes * 60;
    let newCount = pomodoroCount;

    if (timerMode === 'pomodoro') {
      newCount += 1;
      setPomodoroCount(newCount);
      if (newCount % 4 === 0) {
        nextMode = 'longBreak';
        nextTime = longBreakMinutes * 60;
      } else {
        nextMode = 'shortBreak';
        nextTime = shortBreakMinutes * 60;
      }
    } else {
      nextMode = 'pomodoro';
      nextTime = pomodoroMinutes * 60;
    }
    
    setTimerMode(nextMode);
    setTimeRemaining(nextTime);
  }, [timeRemaining, timerMode, pomodoroCount, alertSound, pomodoroMinutes, shortBreakMinutes, longBreakMinutes]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getModeTitle = () => {
    switch(timerMode) {
      case 'pomodoro': return 'FOCUS TIME';
      case 'shortBreak': return 'SHORT BREAK';
      case 'longBreak': return 'LONG BREAK';
      default: return 'FOCUS';
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimerMode('pomodoro');
    setTimeRemaining(pomodoroMinutes * 60);
    setPomodoroCount(0);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden flex flex-col">
      
      {/* 背景動畫 */}
      <div className="flex-1 relative overflow-hidden">
        <CharacterAnimation 
          isWorking={timerMode === 'pomodoro'}
          isMoving={isRunning && timerMode === 'pomodoro'} 
        />
      </div>
      
      <audio ref={audioRef} loop onError={(e) => console.error("音樂檔案讀取失敗")} />

      {/* 設定面板 */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">時間設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  專注時間 (分鐘)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="120"
                  value={pomodoroMinutes}
                  onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  短休息 (分鐘)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  長休息 (分鐘)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleApplySettings}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                套用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 控制面板 */}
      <div className="flex-shrink-0 backdrop-blur-2xl bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent">
        <div className="w-full px-4 pt-3 pb-4">
          
          {/* 狀態列 */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isRunning 
                ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' 
                : 'bg-amber-400 shadow-lg shadow-amber-400/50'
            }`} />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
              {getModeTitle()}
            </span>
            <span className="text-[10px] text-white/30">· 第 {pomodoroCount} 輪</span>
          </div>

          {/* 時間 */}
          <div className="text-center mb-3">
            <div className="text-5xl font-extralight tracking-tighter text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {displayTime}
            </div>
          </div>

          {/* 按鈕 */}
          <div className="flex items-center justify-center space-x-3 mb-3">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 shadow-xl
                ${isRunning 
                  ? 'bg-white/20 hover:bg-white/30 active:bg-white/35 text-white border-2 border-white/20' 
                  : 'bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-200 shadow-white/20'
                }`}
            >
              {isRunning ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button 
              onClick={handleReset}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white/60 hover:text-white transition-all border border-white/10"
              title="重置"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button 
              onClick={() => setShowSettings(true)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white/60 hover:text-white transition-all border border-white/10"
              title="設定"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* 音量 */}
          <div className="flex items-center space-x-3 max-w-sm mx-auto">
            <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <div className="flex-1 relative h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-white/40 to-white/60 transition-all duration-150 rounded-full"
                style={{ width: `${volume}%` }}
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-white/40 font-mono w-8 text-right flex-shrink-0 tabular-nums">{volume}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FocusPage;