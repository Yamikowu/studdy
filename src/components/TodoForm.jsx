// src/components/TodoForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 課程列表從外部傳入，我們不再需要 dummyCourses 在這裡
// 並且，我們直接 export default 這個函式
export default function TodoForm({ existingTodo, onSubmit, courses = [] }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: existingTodo?.title || '',
    courseId: existingTodo?.courseId || '',
    category: existingTodo?.category || 'none',
    time: existingTodo?.time || '',
    subtasks: existingTodo?.subtasks || [],
  });
  
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // 這個 useEffect 非常重要，它確保了當我們從「新增模式」切換到「編輯模式」時，
  // 表單能夠正確地載入舊資料
  useEffect(() => {
    // 只有在 existingTodo 確實存在時，才用它的資料覆蓋表單
    if (existingTodo) {
      setFormData({
        title: existingTodo.title || '',
        courseId: existingTodo.courseId || '',
        category: existingTodo.category || 'none',
        time: existingTodo.time || '',
        subtasks: existingTodo.subtasks || [],
      });
    }
  }, [existingTodo]); // 依賴項是 existingTodo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return;
    const newSubtask = { id: Date.now(), text: newSubtaskText.trim(), completed: false };
    setFormData(prevData => ({ ...prevData, subtasks: [...(prevData.subtasks || []), newSubtask] }));
    setNewSubtaskText('');
  };

  const handleSubtaskToggle = (subtaskId) => {
    setFormData(prevData => ({ ...prevData, subtasks: prevData.subtasks.map(task => task.id === subtaskId ? { ...task, completed: !task.completed } : task) }));
  };

  const handleDeleteSubtask = (subtaskId) => {
    setFormData(prevData => ({ ...prevData, subtasks: prevData.subtasks.filter(task => task.id !== subtaskId) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('請至少填寫待辦名稱！');
      return;
    }
    onSubmit(formData);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 border-2 border-dotted border-blue-400 rounded-lg">
        <label htmlFor="title" className="block text-lg font-bold text-blue-700 mb-2">待辦名稱</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none" placeholder="Ex: 報告"/>
      </div>
      <div className="p-4 border-2 border-dotted border-blue-400 rounded-lg space-y-4">
        <div>
          <label htmlFor="courseId" className="block text-md font-semibold text-gray-700 mb-2">課別 (可選)</label>
          <select id="courseId" name="courseId" value={formData.courseId} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-md shadow-sm">
            <option value="">-- 未選擇 --</option>
            {courses.map(course => (<option key={course.id} value={course.id}>{course.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-md font-semibold text-gray-700 mb-2">類別</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-md shadow-sm">
            <option value="none">未分類</option>
            <option value="hw">作業 (HW)</option>
            <option value="quiz">測驗 (Quiz)</option>
          </select>
        </div>
        <div>
          <label htmlFor="time" className="block text-md font-semibold text-gray-700 mb-2">時間 (可選)</label>
          <input type="datetime-local" id="time" name="time" value={formData.time} onChange={handleChange} className=" p-2 border border-gray-200 rounded-md shadow-sm"/>
        </div>
      </div>
      <div className="p-4 border-2 border-dotted border-blue-400 rounded-lg">
        <label className="block text-lg font-bold text-blue-700 mb-2">◎ 備註</label>
        <ul className="space-y-2 mb-3">
          {(formData.subtasks || []).map(task => (
            <li key={task.id} className="flex items-center group">
              <input type="checkbox" checked={task.completed} onChange={() => handleSubtaskToggle(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
              <span className={`ml-3 flex-grow ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
              <button type="button" onClick={() => handleDeleteSubtask(task.id)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&#x2715;</button>
            </li>
          ))}
        </ul>
        <div className="flex space-x-2">
          <input type="text" value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }} placeholder="新增子任務..." className="flex-grow w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
          <button type="button" onClick={handleAddSubtask} className="px-4 py-2 bg-slate-300 text-gray-700 rounded-md hover:bg-gray-300">＋</button>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-red-500 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-red-600 transition-colors">Save!</button>
      </div>
    </form>
  );
}