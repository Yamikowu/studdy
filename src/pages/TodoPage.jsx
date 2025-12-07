/* eslint-disable no-unused-vars */
// src/pages/TodoPage.jsx


import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { getDummyTodos, ensureMealToday } from '../data/dummyTodos';
import { getCategoryClass } from '../theme/categoryClasses';

function TodoPage() {
  const [todos, setTodos] = useLocalStorageState('todos', getDummyTodos());
  const location = useLocation();

  // 確保初始載入/刷新時，吃飯與預設資料到位
  useEffect(() => {
    setTodos(current => ensureMealToday(current || getDummyTodos()));
  }, [setTodos]);

  // 【關鍵修改 1】：統一分組邏輯
  const groupedTodos = (Array.isArray(todos) ? todos : []).reduce((groups, todo) => {
    // 如果 category 是 'none', null, 或 undefined，我們都把它當作 '未分類'
    const categoryKey = (todo.category === 'none' || !todo.category) ? '未分類' : todo.category;

    if (!groups[categoryKey]) {
      groups[categoryKey] = [];
    }
    groups[categoryKey].push(todo);
    return groups;
  }, { 'quiz': [], 'hw': [], '未分類': [] }); // 初始值保持不變

  // 定義顯示順序和標題
  const categoryOrder = ['quiz', 'hw', '未分類'];
  const categoryNames = {
    quiz: 'Quiz',
    hw: 'HW',
    '未分類': '未分類'
  };

  const handleDeleteTodo = (idToDelete) => {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== idToDelete));
  };




  return (
    <div className="relative h-full pb-24">
      {categoryOrder.map(category => (
        groupedTodos[category].length > 0 && (
          <div key={category} className="mb-6">
            <h2
              className="text-xl font-bold pb-2 mb-3"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--panel-border)' }}
            >
              {categoryNames[category]}
            </h2>
            <ul>
              {groupedTodos[category].map(todo => {
                const categoryClass = getCategoryClass(todo.category);

                // 【可選但推薦】：格式化時間
                // 原始時間格式可能是 "2025-11-12T10:30"
                // 我們可以把它變得更易讀，例如 "11/12 10:30"
                let formattedTime = '';
                let durationText = '';
                let formattedDeadline = '';
                if (todo.id === 5) {
                  // 吃飯這筆永遠顯示當天日期，時間沿用原本設定
                  const today = new Date();
                  const baseTime = todo.time ? new Date(todo.time) : null;
                  const month = today.getMonth() + 1;
                  const day = today.getDate();
                  const hours = baseTime ? baseTime.getHours().toString().padStart(2, '0') : '00';
                  const minutes = baseTime ? baseTime.getMinutes().toString().padStart(2, '0') : '00';
                  formattedTime = `${month}/${day} ${hours}:${minutes}`;
                } else if (todo.time) {
                  const date = new Date(todo.time);
                  const month = date.getMonth() + 1; // getMonth() 是從 0 開始的
                  const day = date.getDate();

                  if (todo.allDay) {
                    formattedTime = `${month}/${day} 整日`;
                  } else {
                    // 用 toLocaleString 可以得到不錯的本地化格式，但我們也可以手動組合
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    formattedTime = `${month}/${day} ${hours}:${minutes}`;
                  }
                }
                if (todo.deadline) {
                  const date = new Date(todo.deadline);
                  const month = date.getMonth() + 1;
                  const day = date.getDate();
                  if (todo.deadlineAllDay) {
                    formattedDeadline = `${month}/${day} 整日`;
                  } else {
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    formattedDeadline = `${month}/${day} ${hours}:${minutes}`;
                  }
                }


                return (
                  // --- 3. 應用動態 class ---
                  // 之前的 className="bg-white ..."
                  // 現在加上我們的 styleClass
                  <li key={todo.id} className={`p-4 mb-3 rounded-xl flex items-center justify-between ${categoryClass}`}>
                    {/* 
                        這個 div 是 checkbox 和 Link 的容器，
                        我們讓它佔滿除了右側按鈕之外的所有空間
                      */}
                    <div className="flex items-center flex-grow min-w-0"> {/* min-w-0 確保在空間不足時可以正確縮小 */}
                      <input
                        type="checkbox"
                        className="mr-4 h-5 w-5 flex-shrink-0"
                        onChange={() => handleDeleteTodo(todo.id)}
                      />
                      <Link
                        to={`/edit-todo/${todo.id}`}
                        state={{ from: location.pathname + location.search }}
                        className="hover:opacity-75 flex-grow min-w-0"
                      >
                        <div className="flex justify-between items-center w-full">
                          {/* 
                              標題部分加上 truncate，如果文字太長會顯示 ...
                              min-w-0 是配合 flexbox 讓 truncate 生效的關鍵
                            */}
                          <span className="font-medium truncate">{todo.title}</span>

                          {/* 
                              【關鍵新增】：顯示時間的 span
                              只有在 todo.time 存在時才渲染
                              flex-shrink-0 確保時間不會被壓縮
                            */}
                          {formattedTime && (
                            <span className="text-sm font-mono ml-4 flex-shrink-0 flex items-center space-x-3 ">
                              <span>{formattedTime}</span>
                              {formattedDeadline && (
                                <span className="text-red-500"> {formattedDeadline}</span>
                              )}
                            </span>
                          )}
                          {!formattedTime && formattedDeadline && (
                            <span className="text-sm font-mono ml-4 flex-shrink-0 flex items-center space-x-3 ">
                              <span className="text-red-500">{formattedDeadline}</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )
      ))}

      <Link
        to="/add-todo"
        className="fixed bottom-24 right-6 font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl fab fab-primary"
      >
        +
      </Link>
    </div>
  );
}

export default TodoPage;
