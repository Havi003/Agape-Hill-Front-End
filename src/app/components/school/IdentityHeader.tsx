import { GraduationCap, User } from 'lucide-react';

interface IdentityHeaderProps {
  userName: string;
}

export function IdentityHeader({ userName }: IdentityHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-900 rounded-full flex items-center justify-center">
            <GraduationCap className="size-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Agape Hill Limited</h2>
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