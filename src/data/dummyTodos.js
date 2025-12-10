// src/data/dummyTodos.js
// 提供預設的 todo 資料，讓各頁面共用

const SKIP_LUNCH_KEY = 'skipLunchDate';

const todayAt = (time = '12:00') => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const getSkipLunchDate = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SKIP_LUNCH_KEY);
};

export const setSkipLunchDate = (dateString) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SKIP_LUNCH_KEY, dateString);
  } catch (e) {
    console.error('Failed to set skip lunch date', e);
  }
};

const clearSkipLunchDate = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SKIP_LUNCH_KEY);
  } catch (e) {
    console.error('Failed to clear skip lunch date', e);
  }
};

const isSameDay = (date, todayKey) => date && date.toDateString() === todayKey;

export function ensureMealToday(todos) {
  const safeTodos = Array.isArray(todos) ? todos : [];
  const todayKey = new Date().toDateString();
  const skipDate = getSkipLunchDate();

  // 若已經跨日，清掉舊的 skip 標記
  if (skipDate && skipDate !== todayKey) {
    clearSkipLunchDate();
  }

  const mealIndex = safeTodos.findIndex(t => t.id === 5);
  const buildMealTime = (baseTime) => {
    const base = baseTime ? new Date(baseTime) : null;
    const hours = base ? base.getHours() : 12;
    const minutes = base ? base.getMinutes() : 0;
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString();
  };

  // 若沒有吃飯這筆，補上一筆今天的 12:00
  if (mealIndex === -1) {
    // 如果使用者今天手動完成/刪掉了 Lunch，就不要再自動補回來
    if (skipDate && skipDate === todayKey) {
      return safeTodos;
    }

    return [
      ...safeTodos,
      { id: 5, title: 'Lunch', category: null, time: todayAt('12:00'), duration: '60' },
    ];
  }

  const meal = safeTodos[mealIndex];
  const mealDate = meal.time ? new Date(meal.time) : null;
  if (isSameDay(mealDate, todayKey)) {
    return safeTodos; // 已是今天，直接返回
  }

  const nextTodos = safeTodos.slice();
  nextTodos[mealIndex] = { ...meal, time: buildMealTime(meal.time) };
  return nextTodos;
}

export function getDummyTodos() {
  const base = [
    { id: 1, title: 'LLM海報', category: 'hw', courseId: 3 },
    { id: 2, title: '計概期末報告', category: 'hw', courseId: 1 ,time:'2025-12-11',deadline: '2025-12-11',allDay:true, deadlineAllDay: true},
    { id: 3, title: '作業系統', category: 'quiz', courseId: 2 },
    { id: 4, title: '計概小考', category: 'quiz', courseId: 1 },
    // 「吃飯」預設為今天的中午 12:00
    { id: 5, title: 'Lunch', category: null, time: todayAt('12:00'), duration: '60' },
  ];
  return ensureMealToday(base);
}
