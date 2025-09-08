import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import './index.css';
import Layout from './components/layout';
import WithoutAuth from './components/PublicRoute';
import WithAuth from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithAuth><Layout /></WithAuth>} >
          <Route index element={<UsersPage  />} />
        </Route>


        <Route path="/login" element={<WithoutAuth><LoginPage /></WithoutAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
