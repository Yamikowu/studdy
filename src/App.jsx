import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TodoPage from './pages/TodoPage';
import TimelinePage from './pages/TimelinePage';
import FocusPage from './pages/FocusPage';
import CoursesPage from './pages/CoursesPage';

import AddTodoPage from './pages/AddTodo';
import EditTodoPage from './pages/EditTodo';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 告訴路由，所有頁面都使用 Layout 這個外殼元件 */}
        <Route path="/" element={<Layout />}>
          {/* path="/" 的首頁內容是 TodoPage */}
          <Route index element={<TodoPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="focus" element={<FocusPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="add-todo" element={<AddTodoPage />} /> 
          {/* :todoId 是一個佔位符，它可以匹配任何字串，例如 /edit-todo/1, /edit-todo/abc */}
          <Route path="edit-todo/:todoId" element={<EditTodoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
