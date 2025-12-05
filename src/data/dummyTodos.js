// src/data/dummyTodos.js
// 提供預設的 todo 資料，讓各頁面共用

const todayAt = (time = '12:00') => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const isSameDay = (date, todayKey) => date && date.toDateString() === todayKey;

export function ensureMealToday(todos) {
  const safeTodos = Array.isArray(todos) ? todos : [];
  const todayKey = new Date().toDateString();

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
    { id: 1, title: '完成作業系統 Ch3 複習', category: 'hw', courseId: 1 },
    { id: 2, title: '演算法作業 p.125', category: 'hw', courseId: 3 },
    { id: 3, title: 'Quiz 2 - 網路概論', category: 'quiz', courseId: 1 },
    { id: 4, title: '準備計算機概論小考', category: 'quiz', courseId: 2 },
    // 「吃飯」預設為今天的中午 12:00
    { id: 5, title: 'Lunch', category: null, time: todayAt('12:00'), duration: '60' },
  ];
  return ensureMealToday(base);
}
