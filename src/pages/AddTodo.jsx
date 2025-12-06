// src/pages/AddTodoPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TodoForm from '../components/TodoForm';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

function AddTodoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 從 localStorage 讀取 courses 列表給下拉選單使用
  const [courses] = useLocalStorageState('courses', []);
  // 獲取 setTodos 這個「寫入」函式
  const [, setTodos] = useLocalStorageState('todos', []);

  // 處理新增邏輯
  const handleAddTodo = (formData) => {
    const newTodo = {
      id: Date.now(),
      ...formData,
      // 確保 courseId 是數字類型，如果它是空字串就設為 null
      courseId: formData.courseId ? parseInt(formData.courseId) : null,
    };

    // 2. 使用 setTodos 來更新 localStorage 中的 'todos' 列表
    setTodos(prevTodos => {
      const safePrevTodos = Array.isArray(prevTodos) ? prevTodos : [];
      return [...safePrevTodos, newTodo];
    });

    const backTo = location.state?.from || '/';
    navigate(backTo);
  };

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-3 ml-1">新增待辦</h2> */}
      <TodoForm
        onSubmit={handleAddTodo}
        courses={courses} // 傳入從 localStorage 讀取的 courses
      />
    </div>
  );
}

export default AddTodoPage;
