import { GraduationCap, Calendar, Hash, User, FileText, X, DollarSign, Users, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Student } from './StudentRegistration';
import { FeeStatusCards } from './FeeStatusCards';
import { FeeManagementDialog } from './FeeManagementDialog';
import { NextOfKinDialog } from './NextOfKinDialog';
import schoolLogo from '../../imports/school_logo.png';

// Import the new API functions
import { getNextofKinDetails } from '../../../services/StudentsApi'; 

// Define an interface for the backend's "body" structure
interface NextOfKinState {
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  address: string;
}

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
  onRefreshParentList?: () => void; // Optional fallback to tell the main list to refresh
}

export function StudentProfile({ student: initialStudent, onClose, onRefreshParentList }: StudentProfileProps) {
  // Use local state to make mutations immediate and reactive
  const [student, setStudent] = useState<Student>(initialStudent);
  
  // Track Next of Kin state separately using the exact structure from your backend payload
  const [nextOfKin, setNextOfKin] = useState<NextOfKinState>({
    name: 'Loading...',
    relationship: 'Loading...',
    phoneNumber: 'Loading...',
    email: 'Loading...',
    address: 'Loading...'
  });

  const [showFeeManagement, setShowFeeManagement] = useState(false);
  const [showNextOfKinEdit, setShowNextOfKinEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingKin, setIsLoadingKin] = useState(true);

  // Fetch the latest authentic kin details on mount
 useEffect(() => {
  let isMounted = true;

  console.log("✅ Student received in profile:", student);

  if (student?.id && student.id.includes('-')) {
    setIsLoadingKin(true);

    getNextofKinDetails(student.id)
      .then(body => {
        if (isMounted && body) {
          setNextOfKin(body);
        }
      })
      .catch(err => {
        console.error("❌ Could not fetch next of kin:", err);

        // fallback safely
        setNextOfKin({
          name: student.kinName || 'Not provided',
          relationship: student.kinRelationship || 'Not provided',
          phoneNumber: student.kinContact || 'Not provided',
          email: student.kinEmail || 'Not provided',
          address: student.kinAddress || 'Not provided',
        });
      })
      .finally(() => {
        if (isMounted) setIsLoadingKin(false);
      });

  } else {
    console.error("❌ Invalid student.id detected:", student?.id);

    setIsLoadingKin(false);
    setNextOfKin({
      name: student.kinName || 'Not provided',
      relationship: student.kinRelationship || 'Not provided',
      phoneNumber: student.kinContact || 'Not provided',
      email: student.kinEmail || 'Not provided',
      address: student.kinAddress || 'Not provided',
    });
  }

  return () => { isMounted = false; };
}, [student.id]);

  // Handles updating the kin payload back to the database
  const handleUpdateNextOfKin = async (studentId: string, kinDetails: NextOfKinState) => {
    try {
      setIsSubmitting(true);
      const updatedBody = await apiUpdateNextOfKin(studentId, kinDetails);
      
      // Directly replace state with the structured body returned
      setNextOfKin(updatedBody);
      setShowNextOfKinEdit(false);
      
      // Optionally sync main student object as well, map keys correctly
      setStudent(prev => ({
          ...prev,
          kinName: updatedBody.name,
          kinRelationship: updatedBody.relationship,
          kinContact: updatedBody.phoneNumber,
          kinEmail: updatedBody.email,
          kinAddress: updatedBody.address,
      }));

      if (onRefreshParentList) onRefreshParentList();
    } catch (error) {
      console.error("Failed to update Next of Kin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto opacity-100 transition-opacity relative">
        {(isSubmitting || isLoadingKin) && <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">Loading...</div>}
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
                <h2 className="mb-1 text-2xl font-bold text-slate-900">{student.fullName}</h2>
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
                <h3 className="text-blue-900 font-semibold">Agape Hill</h3>
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
                  <h4 className="text-blue-900 font-medium">Personal Information</h4>
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
                        {student.dateOfBirth && new Date(student.dateOfBirth).toLocaleDateString('en-US', {
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
                  <h4 className="text-blue-900 font-medium">System Information</h4>
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
                        {student.registeredDate && new Date(student.registeredDate).toLocaleDateString('en-US', {
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
                  <h4 className="text-blue-900 font-medium">Next of Kin Information</h4>
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
                  <p className="font-semibold">{nextOfKin.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-semibold">{nextOfKin.relationship || 'Not provided'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold">{nextOfKin.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    {/* Fixed mapping here */}
                    <p className="font-semibold">{nextOfKin.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    {/* Fixed mapping here */}
                    <p className="font-semibold">{nextOfKin.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Status Cards */}
          <div className="relative z-10 mb-6">
            <FeeStatusCards student={student} />
          </div>

          {/* Quick Actions Panel */}
          <div className="relative z-10 flex gap-3 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeeManagement(true)}
            >
              <DollarSign className="size-4 mr-2" />
              Manage Fees
            </Button>
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
          <div className="relative z-10 pt-6 mt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 italic">
              "Arise and Shine" - Agape Hill 
            </p>
          </div>
        </Card>
      </div>

      {/* Dialog Containers */}
      {showFeeManagement && (
        <FeeManagementDialog
          student={student}
          onClose={() => setShowFeeManagement(false)}
          onUpdateFees={handleUpdateFees}
        />
      )}

      {showNextOfKinEdit && (
        <NextOfKinDialog
          student={student}
          currentKin={nextOfKin} // Pass down the precise structured object
          onClose={() => setShowNextOfKinEdit(false)}
          onUpdateNextOfKin={handleUpdateNextOfKin}
        />
      )}
    </>
  );
}