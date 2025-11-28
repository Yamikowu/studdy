// src/pages/TimelinePage.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { getWeekDays, formatDateKey, getDayName } from '../utils/dateHelpers.jsx';
import { getDummyTodos } from '../data/dummyTodos';

// 幫手函式：格式化時間為 HH:MM
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function FullTimelinePage() {
  const [todos] = useLocalStorageState('todos', getDummyTodos());
  // eslint-disable-next-line no-unused-vars
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = getWeekDays(currentDate);

  const dayTodos = useMemo(() => {
    const safeTodos = Array.isArray(todos) ? todos : [];
    const selectedDayKey = formatDateKey(selectedDate);
    return safeTodos
      .filter(todo => {
        if (!todo.time) return false;
        const todoDayKey = formatDateKey(new Date(todo.time));
        return todoDayKey === selectedDayKey;
      })
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [todos, selectedDate]);

  const timelineSegments = useMemo(() => {
    const anchorHours = [7, 12, 24];

    const anchors = anchorHours.map(hour => {
      const anchorTime = new Date(selectedDate);
      if (hour === 24) {
        anchorTime.setDate(anchorTime.getDate() + 1);
        anchorTime.setHours(0, 0, 0, 0);
      } else {
        anchorTime.setHours(hour, 0, 0, 0);
      }
      return {
        type: 'anchor',
        id: `anchor-${hour}`,
        time: anchorTime.toISOString(),
        // 我們在這裡直接存入要顯示的小時，避免後面複雜的計算
        displayHour: hour === 24 ? 0 : hour,
      };
    });

    const allItems = [
      ...dayTodos.map(todo => ({ ...todo, displayHour: new Date(todo.time).getHours() })),
      ...anchors
    ].sort((a, b) => new Date(a.time) - new Date(b.time));

    if (allItems.length === anchorHours.length && dayTodos.length === 0) {
      return allItems.map(item => ({ ...item, startTime: new Date(item.time) }));
    }

    const segments = [];
    let lastEndTime = null;

    allItems.forEach((item, index) => {
      const startTime = new Date(item.time);
      // const endTime = item.type === 'anchor' ? startTime : new Date(startTime.getTime() + 60 * 60 * 1000);
      const durationInMinutes = todos.duration || 60;
      const endTime = new Date(startTime.getTime() + durationInMinutes * 60 * 1000);

      if (lastEndTime && startTime > lastEndTime) {
        segments.push({ type: 'gap', startTime: lastEndTime, endTime: startTime, id: `gap-${index}` });
      }

      if (lastEndTime && startTime < lastEndTime && item.type !== 'anchor') {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment.type === 'group') {
          lastSegment.todos.push(item);
          lastSegment.endTime = new Date(Math.max(lastSegment.endTime, endTime));
          // Do not update lastEndTime here
          return;
        }
      }

      segments.push({
        type: item.type === 'anchor' ? 'anchor' : 'group',
        startTime: startTime,
        endTime: endTime,
        todos: item.type === 'anchor' ? [] : [item],
        id: item.id,
      });

      lastEndTime = new Date(Math.max(lastEndTime || 0, endTime));
    });



    // --- 這是您需要貼上的新程式碼 ---
    const finalSegments = [];
    segments.forEach(seg => {
      const lastSeg = finalSegments[finalSegments.length - 1];

      // 檢查是否與上一個已加入的 segment 時間重複
      if (lastSeg && formatTime(seg.startTime) === formatTime(lastSeg.startTime)) {
        // 時間重複了，我們要根據優先級決定保留哪一個
        // 優先級: group > anchor > gap

        // 如果當前的是 group，而上一個不是，那麼 group 勝出，替換掉上一個
        if (seg.type === 'group' && lastSeg.type !== 'group') {
          finalSegments.pop(); // 移除上一個
          finalSegments.push(seg); // 加入當前的 group
        }
        // 如果當前的是 anchor，而上一個是 gap，那麼 anchor 勝出，替換掉上一個
        else if (seg.type === 'anchor' && lastSeg.type === 'gap') {
          finalSegments.pop(); // 移除上一個
          finalSegments.push(seg); // 加入當前的 anchor
        }
        // 在所有其他情況下 (例如上一個是 group，或兩個都是 anchor)，我們保留上一個，忽略當前的
        return;
      }

      // 如果時間不重複，就直接加入
      finalSegments.push(seg);
    });

    // 最後再過濾一次，移除空的 group (通常是錨點被 group 取代後留下的)
    return finalSegments.filter(seg => !(seg.type === 'group' && seg.todos.length === 0));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTodos, selectedDate]);

  const categoryStyles = {
    quiz: 'bg-orange-100 border-orange-300 text-orange-800',
    hw: 'bg-blue-100 border-blue-300 text-blue-800',
    '未分類': 'bg-gray-100 border-gray-300 text-gray-700',
    'none': 'bg-gray-100 border-gray-300 text-gray-700',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-around items-center p-2 border-b-2 border-blue-400 mb-4">
        {weekDays.map(day => {
          const isSelected = formatDateKey(day) === formatDateKey(selectedDate);
          return (<button key={formatDateKey(day)} onClick={() => setSelectedDate(day)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}> <span className="text-sm">{getDayName(day)}</span> <span className="font-bold text-lg">{day.getDate()}</span> </button>);
        })}
      </div>

      <div className="flex-grow">
        {timelineSegments.map(segment => {
          if (segment.type === 'group' && segment.todos.length > 0) {
            return (
              <div key={segment.id} className="flex mb-2">
                <div className="flex-shrink-0 w-16 text-right pr-2 text-sm text-gray-500 pt-1">
                  {`${segment.startTime.getHours().toString().padStart(2, '0')}:00`}
                </div>
                <div className="flex-grow border-l-2 border-gray-300 pl-4 space-y-2">
                  {segment.todos.map(todo => {
                    const categoryKey = todo.category || '未分類';
                    const styleClass = categoryStyles[categoryKey];
                    return (
                      <Link key={todo.id} to={`/edit-todo/${todo.id}`} className={`block p-3 rounded-lg border ${styleClass} cursor-pointer hover:opacity-80`}>
                        <p className="font-semibold">{todo.title}</p>
                        {/* <p className="text-xs">{formatTime(new Date(todo.time))}</p> */}
                        <p className="text-xs">
                          {formatTime(new Date(todo.time))} - {formatTime(new Date(new Date(todo.time).getTime() + (todo.duration || 60) * 60 * 1000))}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (segment.type === 'anchor' || segment.type === 'gap') {
            // 【關鍵修改】：在這裡加入判斷邏輯
            const hourToShow = segment.type === 'anchor'
              ? (segment.displayHour ?? segment.startTime.getHours()) // 如果是錨點，顯示它自己的時間
              // gap: 如果目前起點不是整點就進位，整點則顯示當前小時
              : (segment.startTime.getMinutes() > 0 ? segment.startTime.getHours() + 1 : segment.startTime.getHours());

            // 使用 % 24 來確保 23 + 1 = 24 會顯示成 00:00
            const formattedHour = (hourToShow % 24).toString().padStart(2, '0');

            return (
              <div key={segment.id} className="flex items-center my-2">
                <div className={`flex-shrink-0 w-16 text-right pr-2 ${segment.type === 'anchor' ? 'text-md text-gray-700 font-bold' : 'text-xs text-gray-400'}`}>
                  {`${formattedHour}:00`}
                </div>
                <div className="flex-grow border-l-2 border-gray-300 pl-4">
                  <div className={`border-t-2 ${segment.type === 'anchor' ? 'border-solid border-gray-400' : 'border-dotted border-gray-300'}`}></div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* <Link to="/add-todo" className="fixed bottom-20 right-8 bg-red-500 hover:bg-red-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110">
          +
        </Link> */}
    </div>
  );
}
