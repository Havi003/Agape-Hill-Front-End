import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Menu, 
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Calendar // 👈 Added this import
} from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from '../../imports/school_logo.png';

interface BrandSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const CLASSES = [
  'PP1', 'PP2', 
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
];

export function BrandSidebar({ currentView, onNavigate, onLogout }: BrandSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClassesOpen, setIsClassesOpen] = useState(false);

  // 👈 Added School Events to the main static menu items array
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register Student', icon: UserPlus },
    { id: 'events', label: 'School Events', icon: Calendar }, 
  ];

  const handleStudentsClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setIsClassesOpen(true);
    } else {
      setIsClassesOpen(!isClassesOpen);
    }
    onNavigate('students-all');
  };

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
              <div className="size-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-900 p-0.5">
                <ImageWithFallback 
                  src={schoolLogo} 
                  alt="Agape Hill Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) setIsClassesOpen(false);
            }}
            className="text-white hover:bg-blue-700 ml-auto"
          >
            {isCollapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </Button>
        </div>
        
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-xl tracking-tight">Agape Hill</h2>
            <p className="text-sm text-blue-200 mt-1">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
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

        {/* Accordion Trigger for All Students */}
        <button
          onClick={handleStudentsClick}
          className={`w-full flex items-center justify-between px-6 py-3 transition-colors ${
            currentView.startsWith('students')
              ? 'bg-blue-700/40 border-l-4 border-blue-300'
              : 'hover:bg-blue-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="size-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">All Students</span>}
          </div>
          {!isCollapsed && (
            isClassesOpen ? <ChevronDown className="size-4 text-blue-200" /> : <ChevronRight className="size-4 text-blue-200" />
          )}
        </button>

        {/* Accordion Dropdown Submenu */}
        {!isCollapsed && isClassesOpen && (
          <div className="bg-blue-950/40 py-1 transition-all">
            {CLASSES.map((className) => {
              const targetView = `students-${className}`;
              const isSelected = currentView === targetView;
              return (
                <button
                  key={className}
                  onClick={() => onNavigate(targetView)}
                  className={`w-full flex items-center gap-2 pl-12 pr-6 py-2 text-sm transition-colors ${
                    isSelected 
                      ? 'text-white font-bold bg-blue-800/60' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-700/30'
                  }`}
                >
                  <GraduationCap className={`size-4 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  <span>{className}</span>
                </button>
              );
            })}
          </div>
        )}
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