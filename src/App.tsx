import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import './index.css';
import Layout from './components/layout';
import WithoutAuth from './components/PublicRoute';
import WithAuth from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithAuth><Layout /></WithAuth>} >
          <Route index element={<Users  />} />
          <Route path="users/create" element={<CreateUser />} />
        </Route>


        <Route path="/login" element={<WithoutAuth><Login /></WithoutAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
