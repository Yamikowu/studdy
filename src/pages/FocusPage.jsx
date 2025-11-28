// src/pages/FocusPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CharacterAnimation from '../components/CharacterAnimation'; 
// *** 移除 lucide-react 的引用，改用純文字符號 ***

const POMODORO_TIME = 25 * 60; 
const SHORT_BREAK_TIME = 5 * 60;  
const LONG_BREAK_TIME = 15 * 60;  

const BG_MUSIC_PATH = '/audio/01.mp3';
const ALERT_SOUND_PATH = '/audio/02.mp3';

function FocusPage() {
  const [timerMode, setTimerMode] = useState('pomodoro'); 
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0); 
  
  const alertSound = useMemo(() => {
    if (typeof window !== 'undefined') {
        return new Audio(ALERT_SOUND_PATH);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isRunning || timeRemaining === 0) return;
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, timeRemaining]); 

  useEffect(() => {
    if (timeRemaining !== 0) return;
    setIsRunning(false);
    if(alertSound) alertSound.play().catch(e => console.log(e));
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([300, 100, 300, 100, 300]); 
    }
    let nextMode = 'pomodoro';
    let nextTime = POMODORO_TIME;
    let newCount = pomodoroCount;
    if (timerMode === 'pomodoro') {
      newCount += 1; 
      setPomodoroCount(newCount);
      if (newCount % 4 === 0) {
        nextMode = 'longBreak';
        nextTime = LONG_BREAK_TIME;
      } else {
        nextMode = 'shortBreak';
        nextTime = SHORT_BREAK_TIME;
      }
    } else {
      nextMode = 'pomodoro';
      nextTime = POMODORO_TIME;
    }
    setTimerMode(nextMode);
    setTimeRemaining(nextTime);
  }, [timeRemaining, timerMode, pomodoroCount, alertSound]); 

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
  }

  const handleReset = () => {
    setIsRunning(false);
    setTimerMode('pomodoro');
    setTimeRemaining(POMODORO_TIME);
    setPomodoroCount(0);
  }

  return (
    // 使用 -mx-6 消除白邊 (假設父層 padding 是 p-4 或 p-6)
    <div 
      className="relative w-auto -mx-6 h-[calc(100vh-130px)] overflow-hidden bg-gray-900 shadow-inner"
    >
      
      <CharacterAnimation 
        isWorking={timerMode === 'pomodoro'}
        isMoving={isRunning && timerMode === 'pomodoro'} 
      />
      
      {/* 毛玻璃計時器面板 */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="
            backdrop-blur-md bg-black/30 border border-white/20 
            text-white p-5 rounded-2xl shadow-xl
            flex flex-col items-start min-w-[180px]
            transition-all duration-300 hover:bg-black/40
        ">
          
          <div className="flex items-center space-x-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
            <h3 className="text-xs font-bold tracking-widest text-gray-300 uppercase">
              {getModeTitle()}
            </h3>
          </div>

          <div className="text-6xl font-mono font-bold tracking-tighter text-white drop-shadow-lg mb-2">
            {displayTime}
          </div>

          <div className="w-full flex items-center justify-between mt-1">
            <div className="text-xs text-gray-400 font-mono">
              ROUND: <span className="text-white">{pomodoroCount}</span>
            </div>

            <div className="flex space-x-2">
              {/* 開始/暫停按鈕 */}
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full transition-all
                  ${isRunning 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white text-black hover:bg-gray-200'}
                `}
              >
                {/* 改用純文字符號 */}
                {isRunning ? (
                  <span className="font-bold text-xs">||</span> 
                ) : (
                  <span className="font-bold text-xs pl-0.5">▶</span>
                )}
              </button>

              {/* 重置按鈕 */}
              <button 
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Reset"
              >
                <span className="text-lg leading-none transform -translate-y-0.5">↺</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <audio src={BG_MUSIC_PATH} loop />
    </div>
  );
}

export default FocusPage;