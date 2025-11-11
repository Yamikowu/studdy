// src/pages/TimelinePage.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { getWeekDays, formatDateKey, getDayName } from '../utils/dateHelpers.jsx';

// 幫手函式：格式化時間為 HH:MM
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function FullTimelinePage() {
    const [todos] = useLocalStorageState('todos', []);
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
      const anchorHours = [0, 7, 12];
  
      const anchors = anchorHours.map(hour => {
        const anchorTime = new Date(selectedDate);
        anchorTime.setHours(hour, 0, 0, 0);
        return { type: 'anchor', id: `anchor-${hour}`, time: anchorTime.toISOString() };
      });
  
      const allItems = [...dayTodos, ...anchors].sort((a, b) => new Date(a.time) - new Date(b.time));
  
      if (allItems.length === anchorHours.length && dayTodos.length === 0) {
        return allItems.map(item => ({ ...item, startTime: new Date(item.time)}));
      }

      const segments = [];
      let lastEndTime = null;
  
      allItems.forEach((item, index) => {
        const startTime = new Date(item.time);
        const endTime = item.type === 'anchor' ? startTime : new Date(startTime.getTime() + 60 * 60 * 1000);
  
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
  
      const finalSegments = [];
      segments.forEach(seg => {
        const lastFinalSeg = finalSegments[finalSegments.length - 1];
        if ( (seg.type === 'anchor' || (seg.type === 'group' && seg.todos.length === 0)) && lastFinalSeg) {
          if (formatTime(seg.startTime) === formatTime(lastFinalSeg.startTime)) {
            return;
          }
          if (lastFinalSeg.type === 'group' && lastFinalSeg.todos.length > 0 && seg.startTime < lastFinalSeg.endTime) {
            return;
          }
        }
        finalSegments.push(seg);
      });
  
      return finalSegments;
  
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
            return ( <button key={formatDateKey(day)} onClick={() => setSelectedDate(day)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}> <span className="text-sm">{getDayName(day)}</span> <span className="font-bold text-lg">{day.getDate()}</span> </button> );
          })}
        </div>
  
        <div className="flex-grow">
          {timelineSegments.map(segment => {
            if (segment.type === 'group' && segment.todos.length > 0) {
              return (
                <div key={segment.id} className="flex mb-2">
                  <div className="flex-shrink-0 w-16 text-right pr-2 text-sm text-gray-500 pt-1">
                    {formatTime(segment.startTime)}
                  </div>
                  <div className="flex-grow border-l-2 border-gray-300 pl-4 space-y-2">
                    {segment.todos.map(todo => {
                      const categoryKey = todo.category || '未分類';
                      const styleClass = categoryStyles[categoryKey];
                      return (
                        <Link key={todo.id} to={`/edit-todo/${todo.id}`} className={`block p-3 rounded-lg border ${styleClass} cursor-pointer hover:opacity-80`}>
                          <p className="font-semibold">{todo.title}</p>
                          <p className="text-xs">{formatTime(new Date(todo.time))}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }
            if (segment.type === 'anchor' || segment.type === 'gap') {
              return (
                <div key={segment.id} className="flex items-center my-2">
                  <div className={`flex-shrink-0 w-16 text-right pr-2 ${segment.type === 'anchor' ? 'text-md text-gray-700 font-bold' : 'text-xs text-gray-400'}`}>
                    {formatTime(segment.startTime)}
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
        
        <Link to="/add-todo" className="fixed bottom-20 right-8 bg-red-500 hover:bg-red-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110">
          +
        </Link>
      </div>
    );
  }