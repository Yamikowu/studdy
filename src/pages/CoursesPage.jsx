// src/pages/CoursesPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingInputModal from '../components/FloatingInputModal';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { getDummyCourses } from '../data/dummyCourses';



function CoursesPage() {
  const [courses, setCourses] = useLocalStorageState('courses', getDummyCourses());
  const [todos] = useLocalStorageState('todos', []);
  const [expandedCourseIds, setExpandedCourseIds] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 1. 新增一個 state 來管理「刪除模式」
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // --- 定義顏色對照表 ---
  // 我們把類別名稱映射到對應的 Tailwind CSS class
  // 這樣不僅設定了背景色，也設定了對比度更好的文字顏色
  const categoryStyles = {
    quiz: 'bg-orange-100 text-orange-500',
    hw: 'bg-blue-100 text-blue-500',
    '未分類': 'bg-gray-200 text-gray-700',
    'none': 'bg-gray-200 text-gray-700',
  };

  const handleCourseClick = (courseId) => {
    // 在刪除模式下，點擊課程不應該觸發展開/收合
    if (isDeleteMode) return;
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

  // 2. 新增處理刪除課程的函式
  const handleDeleteCourse = (courseIdToDelete) => {
    // 彈出一個確認視窗，防止誤刪
    if (window.confirm('確定要刪除這個課程嗎？')) {
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseIdToDelete));

      // (進階可選) 您也可以在這裡順便更新 todos，將被刪除課程關聯的 todo 的 courseId 設為 null
      // eslint-disable-next-line no-undef
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.courseId === courseIdToDelete ? { ...todo, courseId: null } : todo
      ));
    }
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
            <li key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300">
              <div className="flex items-center">
                {/* 3. 條件渲染：只有在刪除模式下才顯示刪除按鈕 */}
                {isDeleteMode && (
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-4 bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    {/* 刪除圖示 (垃圾桶) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleCourseClick(course.id)}
                  // 當在刪除模式時，讓按鈕看起來被禁用
                  className={`w-full text-left p-4 flex justify-between items-center ${isDeleteMode ? 'cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl font-bold text-blue-600">{course.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-orange-500">{quizCount}</span>
                    <span className="text-lg font-bold text-gray-600">{hwCount}</span>
                  </div>
                </button>
              </div>

              {isExpanded && !isDeleteMode && (
                <div className="p-4 border-t-2 border-dotted border-blue-400">
                  <ul className="space-y-2">
                    {courseTodos.map(todo => {
                      // --- 2. 查詢顏色 ---
                      // 如果 todo.category 是 null，就用 '未分類' 作為 key
                      const styleClass = categoryStyles[todo.category || '未分類'];

                      // 【同樣的時間格式化邏輯】
                      let formattedTime = '';
                      if (todo.time) { // 我們讀取 todo.time
                        const date = new Date(todo.time);
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        formattedTime = `${month}/${day} ${hours}:${minutes}`;
                      }

                      return (
                        // --- 3. 應用動態 class ---
                        // 之前的 className="bg-gray-100 p-3 rounded-md"
                        // 現在用樣板字串和我們的 styleClass 來取代
                        <li key={todo.id} className={`p-3 rounded-md ${styleClass}`}>
                          <Link
                            to="/timeline"
                            state={{ courseId: course.id }}
                            className="block w-full"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium truncate">{todo.title}</span>
                              {/* 只有在時間存在時才顯示 */}
                              {formattedTime && (
                                <span className="text-sm font-mono ml-2 flex-shrink-0 opacity-80">
                                  {formattedTime}
                                </span>
                              )}
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
      {/* --- 按鈕區 --- */}
      <div className="fixed bottom-24 right-6 flex flex-col space-y-3">
        {/* 4. 新增的紅色刪除模式切換按鈕 */}
        <button
          onClick={() => setIsDeleteMode(prev => !prev)}
          // 根據是否處於刪除模式，改變按鈕顏色
          className={`
            font-bold w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg 
            transition-all duration-300 transform hover:scale-110
            ${isDeleteMode ? 'bg-yellow-400 text-black' : 'bg-red-500 hover:bg-red-600 text-white'}
          `}
        >
          {isDeleteMode ? 'ok' : ( // 根據模式顯示不同圖示
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>

        {/* ... (按鈕區：新增課程按鈕和 Modal 保持不變) */}

        <button
          onClick={() => setIsModalVisible(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110"
        >
          +
        </button>
      </div>
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
