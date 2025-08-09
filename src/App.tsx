import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes with dashboard layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="friends" element={<div className="p-6"><h1 className="text-2xl font-bold">Friends</h1><p>Friends page content will go here.</p></div>} />
            <Route path="messages" element={<div className="p-6"><h1 className="text-2xl font-bold">Messages</h1><p>Messages page content will go here.</p></div>} />
            <Route path="notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1><p>Notifications page content will go here.</p></div>} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics page content will go here.</p></div>} />
            <Route path="events" element={<div className="p-6"><h1 className="text-2xl font-bold">Events</h1><p>Events page content will go here.</p></div>} />
            <Route path="saved" element={<div className="p-6"><h1 className="text-2xl font-bold">Saved</h1><p>Saved page content will go here.</p></div>} />
            <Route path="discover" element={<div className="p-6"><h1 className="text-2xl font-bold">Discover</h1><p>Discover page content will go here.</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page content will go here.</p></div>} />
            <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Help</h1><p>Help page content will go here.</p></div>} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
