import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Menu, 
  X,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';

interface BrandSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function BrandSidebar({ currentView, onNavigate, onLogout }: BrandSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register Student', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
  ];

  return (
    <div
      className={`h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } flex flex-col`}
    >
      {/* Header with Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="size-12 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="size-7 text-blue-900" />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-blue-700 ml-auto"
          >
            {isCollapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </Button>
        </div>
        
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-xl tracking-tight">
              Agape Hill Limited
            </h2>
            <p className="text-sm text-blue-200 mt-1">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                currentView === item.id
                  ? 'bg-blue-700 border-l-4 border-white'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <Icon className="size-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogOut className="size-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}