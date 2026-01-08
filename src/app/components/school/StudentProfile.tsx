import { GraduationCap, Calendar, Hash, User, FileText, X, DollarSign, Users, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Student } from './StudentRegistration';
import { FeeStatusCards } from './FeeStatusCards';
import { FeeManagementDialog } from './FeeManagementDialog';
import { NextOfKinDialog } from './NextOfKinDialog';

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
  onUpdateFees?: (studentId: string, feeUpdate: { totalBilled?: number; totalPaid?: number }) => void;
  onUpdateNextOfKin?: (studentId: string, nextOfKin: Student['nextOfKin']) => void;
}

export function StudentProfile({ student, onClose, onUpdateFees, onUpdateNextOfKin }: StudentProfileProps) {
  const [showFeeManagement, setShowFeeManagement] = useState(false);
  const [showNextOfKinEdit, setShowNextOfKinEdit] = useState(false);

  // Provide default values if nextOfKin is undefined
  const nextOfKin = student.nextOfKin || {
    name: 'Not provided',
    relationship: 'Not provided',
    phoneNumber: 'Not provided',
    email: 'Not provided',
    address: 'Not provided'
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 shadow-lg relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <GraduationCap className="size-96" />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between mb-8 pb-6 border-b-2 border-blue-900">
            <div className="flex items-center gap-4">
              <div className="size-20 bg-blue-900 rounded-full flex items-center justify-center">
                <User className="size-12 text-white" />
              </div>
              <div>
                <h2 className="mb-1">{student.fullName}</h2>
                <p className="text-lg text-gray-600">Admission No: {student.admissionNumber}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Official Document Header */}
          <div className="relative z-10 bg-blue-50 border-l-4 border-blue-900 p-4 mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="size-6 text-blue-900" />
              <div>
                <h3 className="text-blue-900">Agape Hill Limited</h3>
                <p className="text-sm text-gray-600">Official Student Digital File</p>
              </div>
            </div>
          </div>

          {/* Student Information Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="size-5 text-blue-900" />
                  <h4 className="text-blue-900">Personal Information</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold">{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-semibold">{student.studentGender}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold">
                        {new Date(student.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-5 text-blue-900" />
                  <h4 className="text-blue-900">System Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Admission Number</p>
                      <p className="font-semibold text-blue-900">{student.admissionNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">NEMIS Number</p>
                      <p className="font-semibold">{student.nemisNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="font-semibold">
                        {new Date(student.registeredDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next of Kin Information */}
          <div className="relative z-10 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-blue-900" />
                  <h4 className="text-blue-900">Next of Kin Information</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNextOfKinEdit(true)}
                  className="text-blue-900 hover:text-blue-700"
                >
                  <Edit className="size-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{nextOfKin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-semibold">{nextOfKin.relationship}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold">{nextOfKin.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{nextOfKin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{nextOfKin.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Status Cards */}
          <div className="relative z-10 mb-6">
            <FeeStatusCards student={student} />
          </div>

          {/* Fee Management Button */}
          <div className="relative z-10 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeeManagement(true)}
            >
              <DollarSign className="size-4 mr-2" />
              Manage Fees
            </Button>
          </div>

          {/* Next of Kin Edit Button */}
          <div className="relative z-10 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNextOfKinEdit(true)}
            >
              <Edit className="size-4 mr-2" />
              Edit Next of Kin
            </Button>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 italic">
              "Arise and Shine" - Agape Hill Limited
            </p>
          </div>
        </Card>
      </div>

      {/* Fee Management Dialog */}
      {showFeeManagement && onUpdateFees && (
        <FeeManagementDialog
          student={student}
          onClose={() => setShowFeeManagement(false)}
          onUpdateFees={onUpdateFees}
        />
      )}

      {/* Next of Kin Edit Dialog */}
      {showNextOfKinEdit && onUpdateNextOfKin && (
        <NextOfKinDialog
          student={student}
          onClose={() => setShowNextOfKinEdit(false)}
          onUpdateNextOfKin={onUpdateNextOfKin}
        />
      )}
    </>
  );
}