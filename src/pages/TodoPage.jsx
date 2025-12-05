// src/pages/TodoPage.jsx


import { useEffect } from 'react';
import { Link, UNSAFE_getTurboStreamSingleFetchDataStrategy } from 'react-router-dom';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { getDummyTodos, ensureMealToday } from '../data/dummyTodos';

function TodoPage() {
  const [todos, setTodos] = useLocalStorageState('todos', getDummyTodos());

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

  // --- 1. 定義顏色對照表 (和 CoursesPage 一樣) ---
  const categoryStyles = {
    quiz: 'bg-orange-100 text-orange-500',
    hw: 'bg-blue-100 text-blue-500',
    '未分類': 'bg-gray-200 text-gray-700',
    'none': 'bg-gray-200 text-gray-700',
  };

  const handleDeleteTodo = (idToDelete) => {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== idToDelete));
  };




  return (
    <div className="relative h-full pb-24">
      {categoryOrder.map(category => (
        groupedTodos[category].length > 0 && (
          <div key={category} className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
              {categoryNames[category]}
            </h2>
            <ul>
              {groupedTodos[category].map(todo => {
                // --- 2. 查詢顏色 ---
                const styleClass = categoryStyles[todo.category || '未分類'];

                // 【可選但推薦】：格式化時間
                // 原始時間格式可能是 "2025-11-12T10:30"
                // 我們可以把它變得更易讀，例如 "11/12 10:30"
                let formattedTime = '';
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
                  // 用 toLocaleString 可以得到不錯的本地化格式，但我們也可以手動組合
                  const month = date.getMonth() + 1; // getMonth() 是從 0 開始的
                  const day = date.getDate();
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  formattedTime = `${month}/${day} ${hours}:${minutes}`;
                }


                return (
                  // --- 3. 應用動態 class ---
                  // 之前的 className="bg-white ..."
                  // 現在加上我們的 styleClass
                  <li key={todo.id} className={`p-4 mb-2 rounded-lg shadow-sm flex items-center justify-between ${styleClass}`}>
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
                      <Link to={`/edit-todo/${todo.id}`} className="hover:opacity-75 flex-grow min-w-0">
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
                            <span className="text-sm font-mono ml-4 flex-shrink-0">
                              {formattedTime}
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
        className="fixed bottom-24 right-6 bg-green-500 hover:bg-green-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110"
      >
        +
      </Link>
    </div>
  );
}

export default TodoPage;
