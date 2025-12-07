// src/components/Layout.jsx

import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { getDummyTodos, ensureMealToday } from '../data/dummyTodos';
import { getDummyCourses } from '../data/dummyCourses';

const getThemeFromTime = () => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 17 ? 'light' : 'dark';
};

function Layout() {
  const [theme, setTheme] = useState(getThemeFromTime());

  // --- 【關鍵新增 1】：建立重置函式 ---
  const handleResetData = () => {
    // 跳出一個確認視窗，確保使用者不是誤觸
    if (window.confirm('您確定要重置所有資料嗎？所有課程和待辦事項都將恢復到初始狀態。請跳到To-do頁面進行重置，操作將無法復原！')) {

      // 清除我們儲存在 localStorage 的所有資料
      window.localStorage.removeItem('todos');
      window.localStorage.removeItem('courses');

      // // 提示使用者操作成功
      // alert('資料已重置！');

      // 重新載入整個應用程式，來讀取初始的假資料
      window.location.reload();
    }
    
    
  };
  // 確保「吃飯」每日自動回到今天（不管先進哪一頁）
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('todos');
      const parsedTodos = stored ? JSON.parse(stored) : getDummyTodos();
      const normalized = ensureMealToday(parsedTodos);
      window.localStorage.setItem('todos', JSON.stringify(normalized));

      const storedCourses = window.localStorage.getItem('courses');
      if (!storedCourses) {
        window.localStorage.setItem('courses', JSON.stringify(getDummyCourses()));
      }
    } catch (error) {
      console.error('Failed to normalize todos', error);
    }
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const next = getThemeFromTime();
      setTheme(prev => (prev === next ? prev : next));
    };

    syncTheme();
    const timer = setInterval(syncTheme, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div
      className="max-w-[600px] mx-auto min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text-primary)' }}
    >

      <header
        className="relative z-10 flex-shrink-0 text-center shadow-sm surface-card surface-static"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* --- 【關鍵新增 2】：重置按鈕 --- */}
        <button
          onClick={handleResetData}
          className="mt-1 text-xl font-bold transition-colors hover:opacity-80 active:opacity-100"
          style={{ color: 'var(--text-primary)' }}
          title="重置 App 資料" // 滑鼠移上去時會顯示提示
        >
          STUDDY · {theme === 'light' ? 'Morning' : 'Night'}
        </button>
      </header>

      {/* 
        主要內容區的 padding-bottom 必須大於 footer 的高度，
        我們的 footer 高度約為 py-3 (24px) + 文字高度 + safe-area，
        所以設定一個保守的 80px 是很安全的。
      */}
      <main
        className="flex-1 overflow-y-auto w-full"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* ---- 底部導覽列 ---- */}
      <footer
        className="fixed bottom-0 left-0 right-0 max-w-[600px] w-full mx-auto z-10 flex justify-around border-t surface-card surface-static"
        // 關鍵修改 1：我們只在這裡處理安全區域的 padding-bottom
        // Footer 的整體高度將由內部的 NavLink 決定
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)'
        }}
      >
        <CustomNavLink to="/courses" label="Class" />
        <CustomNavLink to="/" label="To-do" />
        <CustomNavLink to="/timeline" label="Time" />
        <CustomNavLink to="/focus" label="Focus" />
      </footer>

    </div>
  );
}

const CustomNavLink = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      // ==== 關鍵修改 2：全新的置中和高度控制策略 ====
      // 移除 flex-col 和 justify-center
      // flex: 讓它成為一個 flex 容器
      // items-center: 【垂直置中】這會讓內部的 <span> 在交叉軸（垂直方向）上置中
      // justify-center: 【水平置中】這會讓內部的 <span> 在主軸（水平方向）上置中
      // py-3: 【高度控制】我們給按鈕一個 12px 的上下內邊距，這決定了 footer 的高度，讓它更纖細
      className={({ isActive }) =>
        `flex-1 flex items-center justify-center py-3 text-sm transition-colors duration-200
        ${isActive ? 'font-semibold' : ''}`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
        borderTop: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`
      })}
    >
      <span>{label}</span>
    </NavLink>
  );
};

export default Layout;
