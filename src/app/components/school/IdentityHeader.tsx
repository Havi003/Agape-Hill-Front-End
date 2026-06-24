import { User } from 'lucide-react';
// Step out of 'school' folder to grab 'figma' component
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from '../../imports/school_logo.png';

interface IdentityHeaderProps {
  userName: string;
}

export function IdentityHeader({ userName }: IdentityHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Swapped out blue circle wrapper for the crisp Figma version */}
          <div className="size-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-900 p-0.5">
            <ImageWithFallback 
              src={schoolLogo} 
              alt="Agape Hill Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Agape Hill </h2>
            <p className="text-sm text-gray-600">Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <User className="size-5 text-blue-900" />
          <div>
            <p className="text-xs text-gray-600">Logged in as:</p>
            <p className="font-semibold text-blue-900">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}