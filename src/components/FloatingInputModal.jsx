
import React, { useState } from 'react';

// 這個元件接收三個 props:
// - isVisible: 一個布林值，決定這個 Modal 是否顯示
// - title: 顯示在 Modal 頂部的標題文字
// - onSubmit: 一個函式，當使用者點擊「完成」時，會呼叫這個函式並把輸入的文字傳給它
// - onCancel: 一個函式，當使用者點擊背景或取消時呼叫
function FloatingInputModal({ isVisible, title, onSubmit, onCancel }) {
  const [inputValue, setInputValue] = useState('');

  // 如果 isVisible 是 false，就直接回傳 null，什麼都不渲染
  if (!isVisible) {
    return null;
  }

  const handleSubmit = () => {
    // 檢查輸入值不是空的
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue(''); // 清空輸入框
    }
  };

  return (
    // 最外層是半透明背景
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel} // 點擊背景也會觸發取消
    >
      {/* 這是 Modal 的主體，用 onClick={e => e.stopPropagation()} 来防止點擊它時觸發背景的 onCancel */}
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-2 mb-4"
          placeholder="請輸入課程名稱..."
          autoFocus // 讓 Modal 出現時，輸入框自動獲得焦點
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingInputModal;