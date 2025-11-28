// src/pages/FocusPage.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import CharacterAnimation from '../components/CharacterAnimation'; 

// *** 請確認這裡的檔名跟你的檔案一模一樣 ***
const BG_MUSIC_PATH = '/audio/01.mp3'; 
const ALERT_SOUND_PATH = '/audio/02.mp3';

const POMODORO_TIME = 25 * 60; 
const SHORT_BREAK_TIME = 5 * 60;  
const LONG_BREAK_TIME = 15 * 60;  

function FocusPage() {
  const [timerMode, setTimerMode] = useState('pomodoro'); 
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0); 
  const [volume, setVolume] = useState(30); // 音量狀態

  // 使用 useRef 來抓取 HTML 上的 audio 元素
  const audioRef = useRef(null);

  const alertSound = useMemo(() => {
    if (typeof window !== 'undefined') {
        return new Audio(ALERT_SOUND_PATH);
    }
    return null;
  }, []);

  // 1. 控制音樂播放/暫停
  useEffect(() => {
    if (!audioRef.current) return;

    if (isRunning) {
      // 嘗試播放，並捕捉錯誤 (常見錯誤：使用者還沒互動就播放)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("播放失敗:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isRunning]);

  // 2. 控制音量
  useEffect(() => {
    if (audioRef.current) {
      // HTML Audio 的音量是 0.0 到 1.0
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // 3. 計時器邏輯
  useEffect(() => {
    if (!isRunning || timeRemaining === 0) return;
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, timeRemaining]); 

  // 4. 時間到邏輯
  useEffect(() => {
    if (timeRemaining !== 0) return;
    setIsRunning(false); // 停止計時，這也會觸發音樂暫停
    
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
    // 重置時，如果需要音樂重頭播，可以加這行：
    // if(audioRef.current) audioRef.current.currentTime = 0;
  }

  return (
    <div className="relative w-auto -mx-6 h-[calc(100vh-130px)] overflow-hidden bg-gray-900 shadow-inner">
      
      <CharacterAnimation 
        isWorking={timerMode === 'pomodoro'}
        isMoving={isRunning && timerMode === 'pomodoro'} 
      />
      
      {/* *** 關鍵修改：使用 HTML <audio> 標籤 *** */}
      {/* 
          1. ref={audioRef}: 讓 React 可以控制它
          2. src={BG_MUSIC_PATH}: 檔案路徑
          3. loop: 循環播放
          4. onError: 如果找不到檔案，會在 Console 報錯
      */}
      <audio 
        ref={audioRef} 
        src={BG_MUSIC_PATH} 
        loop 
        onError={(e) => console.error("音樂檔案讀取失敗，請檢查路徑:", BG_MUSIC_PATH)}
      />

      {/* 計時器面板 */}
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

          <div className="w-full flex flex-col mt-1">
             <div className="flex items-center justify-between mb-3">
               <div className="text-xs text-gray-400 font-mono">
                 ROUND: <span className="text-white">{pomodoroCount}</span>
               </div>
               
               {/* 音量控制 */}
               <div className="flex items-center space-x-2 group">
                 <span className="text-xs text-gray-400">VOL</span>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={volume} 
                   onChange={(e) => setVolume(Number(e.target.value))}
                   className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                 />
               </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full transition-all
                  ${isRunning 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white text-black hover:bg-gray-200'}
                `}
              >
                {isRunning ? <span className="font-bold text-xs">||</span> : <span className="font-bold text-xs pl-0.5">▶</span>}
              </button>

              <button 
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <span className="text-lg leading-none transform -translate-y-0.5">↺</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusPage;