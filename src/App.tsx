import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import './index.css';
import Layout from './components/Layout.tsx';
import WithoutAuth from './components/PublicRoute';
import WithAuth from './components/ProtectedRoute';
import UserDetails from './pages/UserDetails';
import UserDashboard from './pages/UserDashboard';
import AddPerson from './pages/AddPerson/index.tsx';
import Contact from './pages/Contact';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithAuth><Layout /></WithAuth>} >
          <Route index element={<Users  />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="add-person" element={<AddPerson />} />
          <Route path="contacts/:id" element={<Contact />} />
        </Route>
        <Route path="/login" element={<WithoutAuth><Login /></WithoutAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
