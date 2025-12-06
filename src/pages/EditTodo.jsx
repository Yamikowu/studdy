// src/pages/EditTodoPage.jsx

import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import TodoForm from '../components/TodoForm';
import { useLocalStorageState } from '../hooks/useLocalStorageState'; // 1. 引入 Hook

function EditTodoPage() {
  const { todoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 2. 直接從 localStorage 讀取 courses 和 todos 列表
  const [courses] = useLocalStorageState('courses', []);
  const [todos, setTodos] = useLocalStorageState('todos', []);

  // 3. 從 localStorage 讀取出來的完整 todos 列表中，尋找我們要編輯的項目
  //    這裡我們用 Array.isArray 來確保 todos 是一個陣列，增加健壯性
  const todoToEdit = Array.isArray(todos) ? todos.find(todo => todo.id == todoId) : undefined;

  // 4. 【關鍵修改】處理編輯邏輯：更新 localStorage 中的 todos 列表
  const handleEditTodo = (formData) => {
    // 把從 URL 來的 id (字串) 轉成數字，和表單資料組合起來
    const updatedTodo = {
      id: parseInt(todoId),
      ...formData,
      // 同樣，確保 courseId 是數字或 null
      courseId: formData.courseId ? parseInt(formData.courseId) : null,
      deadline: formData.deadline || '',
    };

    // 使用 setTodos 來更新 localStorage
    setTodos(currentTodos => {
      // 確保 currentTodos 是個陣列
      const safeCurrentTodos = Array.isArray(currentTodos) ? currentTodos : [];
      // 用 .map 遍歷整個陣列，找到 ID 相同的那一項，用我們的 updatedTodo 替換它
      // 其他項則保持原樣
      return safeCurrentTodos.map(todo =>
        todo.id == todoId ? updatedTodo : todo
      );
    });

    const backTo = location.state?.from || '/';
    navigate(backTo);
  };

  // 如果找不到對應的 todo (例如使用者手動輸入錯誤的 URL)，就顯示提示
  if (!todoToEdit) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>正在載入待辦事項...</p>
        <p>如果長時間沒有反應，可能是該項目已被刪除。</p>
      </div>
    );
  }

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-6">編輯待辦事項</h2> */}
      <TodoForm
        onSubmit={handleEditTodo}
        courses={courses} // 把從 localStorage 讀到的 courses 傳給表單
        existingTodo={todoToEdit} // 把從 localStorage 找到的舊資料傳給表單
      />
    </div>
  );
}

export default EditTodoPage;
