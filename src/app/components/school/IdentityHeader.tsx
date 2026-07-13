import { Menu, User } from 'lucide-react';
import { Button } from '../ui/button';
// Step out of 'school' folder to grab 'figma' component
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from '../../imports/school_logo.png';

interface IdentityHeaderProps {
  userName: string;
  onMenuOpen: () => void;
}

export function IdentityHeader({ userName, onMenuOpen }: IdentityHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-gray-200 px-3 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuOpen}
            className="shrink-0 text-blue-900 hover:bg-blue-50 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
          {/* Swapped out blue circle wrapper for the crisp Figma version */}
          <div className="size-9 shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-900 p-0.5 sm:size-10">
            <ImageWithFallback 
              src={schoolLogo} 
              alt="Agape Hill Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight text-gray-900 sm:text-xl">Agape Hill</h2>
            <p className="hidden text-sm text-gray-600 sm:block">Management Portal</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full bg-blue-50 p-2 sm:rounded-lg sm:px-4 sm:py-2" aria-label={`Logged in as ${userName}`}>
          <User className="size-5 text-blue-900" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-600">Logged in as:</p>
            <p className="font-semibold text-blue-900">{userName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
