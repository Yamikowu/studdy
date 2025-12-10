
// 取得今天所在的星期，從星期一到星期日
export function getWeekDays(date) {
  const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const weekStart = new Date(date);
  // 計算星期一的日期
  weekStart.setDate(date.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    week.push(day);
  }
  return week;
}

// 格式化日期，用於比較 (例如 '2025-11-12')
export function formatDateKey(date) {
  // 使用當地時區計算日期，避免 toISOString() 因時差導致跨日
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 取得星期幾的中文縮寫
export function getDayName(date) {
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  return dayNames[date.getDay()];
}
