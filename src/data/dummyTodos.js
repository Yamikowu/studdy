// src/data/dummyTodos.js
// 提供預設的 todo 資料，讓各頁面共用

const todayAt = (time = '12:00') => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export function getDummyTodos() {
  return [
    { id: 1, title: '完成作業系統 Ch3 複習', category: 'hw', courseId: 1 },
    { id: 2, title: '演算法作業 p.125', category: 'hw', courseId: 3 },
    { id: 3, title: 'Quiz 2 - 網路概論', category: 'quiz', courseId: 1 },
    { id: 4, title: '準備計算機概論小考', category: 'quiz', courseId: 2 },
    // 「吃飯」永遠設定為今天的中午 12:00
    { id: 5, title: 'Lunch', category: null, time: todayAt('12:00'), duration: '60' },
  ];
}
