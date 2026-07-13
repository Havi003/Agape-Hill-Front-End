// src/components/school/FeesManager.tsx
import { useState } from 'react';
import { Wallet, Settings, Users, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { FeeStructureForm } from './FeeStructureForm';
import { StudentFeeLedger } from './StudentFeeLedger';

export function FeesManager() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'configure'>('ledger');

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      
      {/* Header Controls Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Wallet className="size-7 text-emerald-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Fee Management</h1>
            <p className="text-gray-500 text-sm">Configure billing structures, execute term rollovers, and issue statements.</p>
          </div>
        </div>

        {/* Tab View Switcher Controls */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'ledger' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="size-4" /> Manage Student Fees
          </button>
          <button
            onClick={() => setActiveTab('configure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'configure' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="size-4" /> Configure Structure
          </button>
        </div>
      </div>

      {/* Render Selected Module Content */}
      {activeTab === 'ledger' ? <StudentFeeLedger /> : <FeeStructureForm />}
    </div>
  );
}