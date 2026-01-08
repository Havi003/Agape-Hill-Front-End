import { useState } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Student } from './StudentRegistration';

interface FeeManagementDialogProps {
  student: Student;
  onClose: () => void;
  onUpdateFees: (studentId: string, feeUpdate: { totalBilled?: number; totalPaid?: number }) => void;
}

export function FeeManagementDialog({ student, onClose, onUpdateFees }: FeeManagementDialogProps) {
  const [billedAmount, setBilledAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  const handleAddBill = () => {
    const amount = parseFloat(billedAmount);
    if (amount && amount > 0) {
      const newBilled = student.feeStatus.totalBilled + amount;
      const newBalance = newBilled - student.feeStatus.totalPaid;
      
      onUpdateFees(student.id, { 
        totalBilled: newBilled
      });
      
      setBilledAmount('');
    }
  };

  const handleAddPayment = () => {
    const amount = parseFloat(paidAmount);
    if (amount && amount > 0) {
      const newPaid = student.feeStatus.totalPaid + amount;
      const newBalance = student.feeStatus.totalBilled - newPaid;
      
      onUpdateFees(student.id, { 
        totalPaid: newPaid
      });
      
      setPaidAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Fee Management</h2>
            <p className="text-gray-600">{student.fullName} - {student.admissionNumber}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Current Fee Status */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-blue-900 mb-3">Current Fee Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Billed</p>
              <p className="font-bold text-blue-900">
                Ksh. {student.feeStatus.totalBilled.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="font-bold text-green-600">
                Ksh. {student.feeStatus.totalPaid.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`font-bold ${student.feeStatus.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Ksh. {student.feeStatus.balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Add New Bill */}
        <div className="mb-6">
          <h3 className="mb-3">Add New Bill</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="billedAmount">Amount (Ksh)</Label>
              <Input
                id="billedAmount"
                type="number"
                value={billedAmount}
                onChange={(e) => setBilledAmount(e.target.value)}
                placeholder="Enter amount to bill"
                className="mt-2"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddBill}
                disabled={!billedAmount || parseFloat(billedAmount) <= 0}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="size-4 mr-2" />
                Add Bill
              </Button>
            </div>
          </div>
        </div>

        {/* Record Payment */}
        <div className="mb-6">
          <h3 className="mb-3">Record Payment</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="paidAmount">Amount (Ksh)</Label>
              <Input
                id="paidAmount"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="mt-2"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddPayment}
                disabled={!paidAmount || parseFloat(paidAmount) <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="size-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
