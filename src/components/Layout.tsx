import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Sidebar, SidebarToggle } from './Sidebar';
import {
  Search,
  Bell,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-bold">BlazingSocial</h1>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar />
        </aside>

        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-16" : "lg:w-80",
          isSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
        )}>
          <Sidebar isCollapsed={isCollapsed} />
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? (isCollapsed ? "lg:pl-16" : "lg:pl-80") : "lg:pl-0"
        )}>
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center space-x-4">
              <SidebarToggle isCollapsed={isCollapsed} onToggle={handleToggle} />
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
