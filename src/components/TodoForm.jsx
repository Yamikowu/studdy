// src/components/TodoForm.jsx

import React, { useState, useEffect } from 'react';

// 課程列表從外部傳入，我們不再需要 dummyCourses 在這裡
// 並且，我們直接 export default 這個函式
export default function TodoForm({ existingTodo, onSubmit, courses = [] }) {
  const [formData, setFormData] = useState({
    title: existingTodo?.title || '',
    courseId: existingTodo?.courseId || '',
    category: existingTodo?.category || 'none',
    time: existingTodo?.time || '',
    duration: existingTodo?.duration || '', // <-- 新增 duration，單位是分鐘
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
        duration: existingTodo.duration || '',
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ color: 'var(--text-primary)' }}>
      <div
        className="p-4 border-2 border-dotted rounded-lg"
        style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)' }}
      >
        <label htmlFor="title" className="block text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>待辦名稱</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border-b-2 outline-none"
          style={{ borderColor: 'var(--panel-border)', backgroundColor: 'transparent' }}
          placeholder="Ex: 報告"
        />
      </div>
      <div
        className="p-4 border-2 border-dotted rounded-lg space-y-4"
        style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)' }}
      >
        <div>
          <label htmlFor="courseId" className="block text-md font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>課別 (可選)</label>
          <select
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md shadow-sm"
            style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)', color: 'var(--text-primary)' }}
          >
            <option value="">-- 未選擇 --</option>
            {courses.map(course => (<option key={course.id} value={course.id}>{course.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-md font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>類別</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md shadow-sm"
            style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)', color: 'var(--text-primary)' }}
          >
            <option value="none">未分類</option>
            <option value="hw">作業 (HW)</option>
            <option value="quiz">測驗 (Quiz)</option>
          </select>
        </div>
        <div>
          <label htmlFor="time" className="block text-md font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>執行時間 (可選)</label>
          <input
            type="datetime-local"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="p-2 border rounded-md shadow-sm"
            style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-md font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>持續時間 (分鐘, 可選)</label>
          <input
            type="number" // 類型設為 number，方便輸入數字
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="例如: 60"
            className="w-full p-2 border rounded-md shadow-sm"
            style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
      <div
        className="p-4 border-2 border-dotted rounded-lg"
        style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)' }}
      >
        <label className="block text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>◎ 備註</label>
        <ul className="space-y-2 mb-3">
          {(formData.subtasks || []).map(task => (
            <li key={task.id} className="flex items-center group">
              <input type="checkbox" checked={task.completed} onChange={() => handleSubtaskToggle(task.id)} className="h-5 w-5 rounded border-gray-300 text-[var(--accent)] focus:ring-0" />
              <span className={`ml-3 flex-grow ${task.completed ? 'line-through text-gray-400' : ''}`} style={{ color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>{task.text}</span>
              <button type="button" onClick={() => handleDeleteSubtask(task.id)} className="ml-2 text-gray-400 hover:text-[var(--danger-strong)] opacity-0 group-hover:opacity-100 transition-opacity">&#x2715;</button>
            </li>
          ))}
        </ul>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
            placeholder="新增子任務..."
            className="flex-grow w-full p-2 border rounded-md shadow-sm"
            style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="px-4 py-2 rounded-md"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', transition: 'background-color 0.2s ease' }}
          >
            ＋
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="font-bold py-2 px-8 rounded-lg fab fab-primary text-lg">Save</button>
      </div>
    </form>
  );
}
