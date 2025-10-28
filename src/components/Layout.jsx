// src/components/Layout.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="max-w-[600px] mx-auto h-screen font-sans bg-slate-50">
      
      <header 
        className="relative z-10 flex-shrink-0 bg-white text-center shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        <h1 className="text-xl font-bold text-slate-800">StuddY</h1>
      </header>

      {/* 
        主要內容區的 padding-bottom 必須大於 footer 的高度，
        我們的 footer 高度約為 py-3 (24px) + 文字高度 + safe-area，
        所以設定一個保守的 80px 是很安全的。
      */}
      <main 
        className="overflow-y-auto" 
        style={{ height: '100vh', paddingBottom: '80px' }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* ---- 底部導覽列 ---- */}
      <footer 
        className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto z-10 flex justify-around bg-white border-t border-gray-200"
        // 關鍵修改 1：我們只在這裡處理安全區域的 padding-bottom
        // Footer 的整體高度將由內部的 NavLink 決定
        style={{ paddingBottom: 'env(safe-area-inset-bottom)'}}
      >
        <CustomNavLink to="/" label="To-do" />
        <CustomNavLink to="/timeline" label="Time" />
        <CustomNavLink to="/focus" label="Focus" />
        <CustomNavLink to="/courses" label="Class" />
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
        ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-500'}`
      }
    >
      <span>{label}</span>
    </NavLink>
  );
};

export default Layout;