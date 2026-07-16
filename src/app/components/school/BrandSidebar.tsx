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
  Calendar,
  WalletCards,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from '../../imports/school_logo.png';

interface BrandSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const CLASSES = [
  'PP1', 'PP2', 
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
];

export function BrandSidebar({ currentView, onNavigate, onLogout, isMobileOpen, onMobileClose }: BrandSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [isFeesOpen, setIsFeesOpen] = useState(() => currentView.startsWith('fees-'));

  const feeItems = [
    ['fees-dashboard', 'Dashboard'], ['fees-years', 'Calendar'],
    ['fees-structures', 'Fee Structures'], ['fees-options', 'Optional Fees'],
    ['fees-billing', 'Generate Bills'], ['fees-statements', 'Student Statements'], ['fees-payments', 'Payments Ledger']
  ];

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

  const navigateAndClose = (view: string) => {
    onNavigate(view);
    onMobileClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] transition-opacity md:hidden ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col bg-gradient-to-b from-blue-950 to-blue-800 text-white shadow-2xl transition-[transform,width] duration-300 md:relative md:z-auto md:translate-x-0 md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
      {/* Header with Logo */}
      <div className="border-b border-blue-700 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'md:hidden' : ''}`}>
              <div className="size-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-900 p-0.5">
                <ImageWithFallback 
                  src={schoolLogo} 
                  alt="Agape Hill Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="ml-auto text-white hover:bg-blue-700 md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) setIsClassesOpen(false);
            }}
            className="ml-auto hidden text-white hover:bg-blue-700 md:inline-flex"
          >
            {isCollapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </Button>
        </div>
        
        <div className={isCollapsed ? 'md:hidden' : ''}>
            <h2 className="font-bold text-xl tracking-tight">Agape Hill</h2>
            <p className="text-sm text-blue-200 mt-1">Management System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateAndClose(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                currentView === item.id
                  ? 'bg-blue-700 border-l-4 border-white'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <Icon className="size-5 flex-shrink-0" />
              <span className={`font-medium ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
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
            <span className={`font-medium ${isCollapsed ? 'md:hidden' : ''}`}>All Students</span>
          </div>
          <span className={isCollapsed ? 'md:hidden' : ''}>
            {isClassesOpen ? <ChevronDown className="size-4 text-blue-200" /> : <ChevronRight className="size-4 text-blue-200" />}
          </span>
        </button>

        {/* Accordion Dropdown Submenu */}
        {isClassesOpen && (
          <div className={`bg-blue-950/40 py-1 transition-all ${isCollapsed ? 'md:hidden' : ''}`}>
            {CLASSES.map((className) => {
              const targetView = `students-${className}`;
              const isSelected = currentView === targetView;
              return (
                <button
                  key={className}
                  onClick={() => navigateAndClose(targetView)}
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

        <button onClick={() => { setIsFeesOpen(!isFeesOpen); if (!isFeesOpen) onNavigate('fees-dashboard'); }} className={`mt-2 flex w-full items-center justify-between px-6 py-3 transition-colors ${currentView.startsWith('fees-') ? 'border-l-4 border-emerald-300 bg-blue-700/40' : 'hover:bg-blue-700/50'}`}>
          <div className="flex items-center gap-3"><WalletCards className="size-5 shrink-0" /><span className={`font-medium ${isCollapsed ? 'md:hidden' : ''}`}>Fee Management</span></div>
          <span className={isCollapsed ? 'md:hidden' : ''}>{isFeesOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</span>
        </button>
        {isFeesOpen && <div className={`bg-blue-950/40 py-1 ${isCollapsed ? 'md:hidden' : ''}`}>{feeItems.map(([id,label]) => <button key={id} onClick={() => navigateAndClose(id)} className={`flex w-full items-center gap-2 py-2 pl-12 pr-5 text-left text-sm ${currentView === id ? 'bg-blue-800/70 font-bold text-white' : 'text-blue-200 hover:bg-blue-700/30 hover:text-white'}`}><CreditCard className="size-3.5 shrink-0" />{label}</button>)}</div>}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-blue-700 p-5 md:p-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogOut className="size-5 flex-shrink-0" />
          <span className={`font-medium ${isCollapsed ? 'md:hidden' : ''}`}>Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
}
