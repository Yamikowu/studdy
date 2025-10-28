// src/pages/TodoPage.jsx


import { Link } from 'react-router-dom';
import { useLocalStorageState } from '../hooks/useLocalStorageState';


const dummyTodos = [
  { id: 1, title: '完成作業系統 Ch3 複習', category: 'hw', courseId: 1 },
  { id: 2, title: '準備計算機概論小考', category: 'quiz', courseId: 2 },
  { id: 3, title: '演算法作業 p.125', category: 'hw', courseId: 3 },
  { id: 4, title: '記得去圖書館借書', category: null},
  { id: 5, title: 'Quiz 2 - 網路概論', category: 'quiz', courseId: 1 },
];

function TodoPage() {
  const [todos, setTodos] = useLocalStorageState('todos', dummyTodos);

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

                return (
                  // --- 3. 應用動態 class ---
                  // 之前的 className="bg-white ..."
                  // 現在加上我們的 styleClass
                  <li key={todo.id} className={`p-4 mb-2 rounded-lg shadow-sm flex items-center justify-between ${styleClass}`}>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-4 h-5 w-5 flex-shrink-0"
                        onChange={() => handleDeleteTodo(todo.id)}
                      />
                      <Link to={`/edit-todo/${todo.id}`} className="hover:opacity-75">
                        <span className="font-medium">{todo.title}</span>
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
        className="fixed bottom-20 right-4 bg-green-500 hover:bg-green-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110"
      >
        +
      </Link>
    </div>
  );
}

export default TodoPage;