// src/pages/CoursesPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingInputModal from '../components/FloatingInputModal';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

// ... (initialCourses 和 initialTodos 資料保持不變)
const initialCourses = [
  { id: 1, name: '作業系統' },
  { id: 2, name: '計算機概論' },
  { id: 3, name: '大數據模型' },
];



function CoursesPage() {
  const [courses, setCourses] = useLocalStorageState('courses', initialCourses);
  const [todos] = useLocalStorageState('todos', []);
  const [expandedCourseIds, setExpandedCourseIds] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- 1. 定義顏色對照表 ---
  // 我們把類別名稱映射到對應的 Tailwind CSS class
  // 這樣不僅設定了背景色，也設定了對比度更好的文字顏色
  const categoryStyles = {
    quiz: 'bg-orange-100 text-orange-500',
    hw: 'bg-blue-100 text-blue-500',
    '未分類': 'bg-gray-200 text-gray-700',
    'none': 'bg-gray-200 text-gray-700',
  };

  const handleCourseClick = (courseId) => {
    setExpandedCourseIds(currentIds => {
      if (currentIds.includes(courseId)) {
        return currentIds.filter(id => id !== courseId);
      } else {
        return [...currentIds, courseId];
      }
    });
  };

  const handleAddCourse = (courseName) => {
    const newCourse = { id: Date.now(), name: courseName };
    setCourses(prevCourses => [newCourse, ...prevCourses]);
    setIsModalVisible(false);
  };

  return (
    <div className="relative h-full pb-24">
      <ul className="space-y-4">
        {courses.map(course => {
          const courseTodos = todos.filter(todo => todo.courseId === course.id);
          const hwCount = courseTodos.filter(todo => todo.category === 'hw').length;
          const quizCount = courseTodos.filter(todo => todo.category === 'quiz').length;
          const isExpanded = expandedCourseIds.includes(course.id);

          return (
            <li key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* ... (課程標題按鈕部分保持不變) */}
              <button 
                onClick={() => handleCourseClick(course.id)}
                className="w-full text-left p-4 flex justify-between items-center"
              >
                <span className="text-xl font-bold text-blue-600">{course.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-orange-500">{quizCount}</span>
                  <span className="text-lg font-bold text-gray-600">{hwCount}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t-2 border-dotted border-blue-400">
                  <ul className="space-y-2">
                    {courseTodos.map(todo => {
                      // --- 2. 查詢顏色 ---
                      // 如果 todo.category 是 null，就用 '未分類' 作為 key
                      const styleClass = categoryStyles[todo.category || '未分類'];

                      return (
                        // --- 3. 應用動態 class ---
                        // 之前的 className="bg-gray-100 p-3 rounded-md"
                        // 現在用樣板字串和我們的 styleClass 來取代
                        <li key={todo.id} className={`p-3 rounded-md ${styleClass}`}>
                          <Link to={`/edit-todo/${todo.id}`} className="block w-full">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{todo.title}</span>
                              <span className="text-sm opacity-80">{todo.deadline}</span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {/* ... (新增待辦按鈕保持不變) */}
                  <div className="mt-4 flex justify-center">
                    <Link 
                      to="/add-todo"
                      className="w-10 h-10 rounded-full bg-green-500 text-white text-2xl flex items-center justify-center"
                    >
                      +
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {/* ... (新增課程按鈕和 Modal 保持不變) */}
       <button
        onClick={() => setIsModalVisible(true)}
        className="fixed bottom-20 right-4 bg-green-500 hover:bg-green-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform"
      >
        +
      </button>

      <FloatingInputModal
        isVisible={isModalVisible}
        title="新增課程"
        onSubmit={handleAddCourse}
        onCancel={() => setIsModalVisible(false)}
      />
    </div>
  );
}

export default CoursesPage;