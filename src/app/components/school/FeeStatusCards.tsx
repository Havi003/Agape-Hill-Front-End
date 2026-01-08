import { FileText, CreditCard, Wallet } from 'lucide-react';
import { Student } from './StudentRegistration';

interface FeeStatusCardsProps {
  student: Student;
  onViewDetails?: () => void;
  onViewRequests?: () => void;
}

export function FeeStatusCards({ 
  student,
  onViewDetails,
  onViewRequests 
}: FeeStatusCardsProps) {
  const { totalBilled, totalPaid, balance } = student.feeStatus;
  
  const formatCurrency = (amount: number) => {
    return `Ksh. ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Billed */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="size-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="size-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1">TOTAL BILLED:</p>
            <p className="font-bold text-white mb-3 break-words">
              {formatCurrency(totalBilled)}
            </p>
            <button
              onClick={onViewDetails}
              className="text-sm text-blue-100 hover:text-white font-medium underline inline-flex items-center gap-1"
            >
              View Details
              <span className="text-xs">⊕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Total Paid */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="size-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard className="size-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1">TOTAL PAID:</p>
            <p className="font-bold text-white mb-3 break-words">
              {formatCurrency(totalPaid)}
            </p>
            <button
              onClick={onViewRequests}
              className="text-sm text-blue-100 hover:text-white font-medium underline inline-flex items-center gap-1"
            >
              View Requests
              <span className="text-xs">⊕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="size-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wallet className="size-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1">BALANCE:</p>
            <p className="font-bold text-white mb-3 break-words">
              {formatCurrency(balance)}
            </p>
            <button
              onClick={onViewRequests}
              className="text-sm text-blue-100 hover:text-white font-medium underline inline-flex items-center gap-1"
            >
              View Requests
              <span className="text-xs">⊕</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}