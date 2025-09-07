import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Button } from './components/ui/button';
import { Bell, MessageCircle, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Login from './pages/Login/index';
import Dashboard from './pages/Dashboard/index';
import Users from './pages/Users/index';
import UserDetail from './pages/UserDetail/index';
import AddUser from './pages/AddUser/index';
import Settings from './pages/Settings/index';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout Component with Sidebar
const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { user, logout } = useAuth();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar 
        collapsible="icon" 
        userEmail={user?.email || "john.doe@example.com"}
        isSuperuser={user?.is_superuser || false}
      />
      <main className="flex-1">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          
          {/* Top Right Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Messages */}
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>
                      {user?.is_superuser ? "A" : user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* User Info */}
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.is_superuser ? 'Superuser' : 'User'}
                  </p>
                </div>
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - With Sidebar Layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Routes>
                <Route 
                  path="/dashboard" 
                  element={
                    <DashboardLayout title="Dashboard">
                      <Dashboard />
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <DashboardLayout title="Users">
                      <Users />
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/users/:userId" 
                  element={
                    <DashboardLayout title="User Details">
                      <UserDetail />
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/users/add" 
                  element={
                    <DashboardLayout title="Add New User">
                      <AddUser />
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <DashboardLayout title="Settings">
                      <Settings />
                    </DashboardLayout>
                  } 
                />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
