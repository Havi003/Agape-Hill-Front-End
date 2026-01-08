import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { LoginScreen } from './components/school/LoginScreen';
import { BrandSidebar } from './components/school/BrandSidebar';
import { IdentityHeader } from './components/school/IdentityHeader';
import { Dashboard } from './components/school/Dashboard';
import { StudentRegistration, Student } from './components/school/StudentRegistration';
import { StudentList } from './components/school/StudentList';
import { StudentProfile } from './components/school/StudentProfile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Generate admission number (format: AHPS2024001)
  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    return `AHPS${year}${String(count).padStart(3, '0')}`;
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success('Welcome to Agape Hill Limited Management System');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setSelectedStudent(null);
    toast.info('You have been logged out');
  };

  const handleRegisterStudent = (studentData: Omit<Student, 'id' | 'admissionNumber' | 'registeredDate'>) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      admissionNumber: generateAdmissionNumber(),
      registeredDate: new Date().toISOString(),
      feeStatus: {
        totalBilled: 0,
        totalPaid: 0,
        balance: 0
      },
      ...studentData
    };

    setStudents([...students, newStudent]);
    
    toast.success(
      `Student ${newStudent.fullName} successfully added to Agape Hill Limited`,
      {
        description: `Admission Number: ${newStudent.admissionNumber}`
      }
    );

    // Navigate to student profile
    setSelectedStudent(newStudent);
    setCurrentView('profile');
  };

  const handleCloseProfile = () => {
    setSelectedStudent(null);
    setCurrentView('students');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSelectedStudent(null);
  };

  const handleUpdateFees = (studentId: string, feeUpdate: { totalBilled?: number; totalPaid?: number }) => {
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          const totalBilled = feeUpdate.totalBilled ?? student.feeStatus.totalBilled;
          const totalPaid = feeUpdate.totalPaid ?? student.feeStatus.totalPaid;
          const balance = totalBilled - totalPaid;
          
          const updatedStudent = {
            ...student,
            feeStatus: {
              totalBilled,
              totalPaid,
              balance
            }
          };
          
          // Update selected student if it's the one being updated
          if (selectedStudent?.id === studentId) {
            setSelectedStudent(updatedStudent);
          }
          
          return updatedStudent;
        }
        return student;
      })
    );
    
    toast.success('Fee status updated successfully');
  };

  const handleUpdateNextOfKin = (studentId: string, nextOfKin: Student['nextOfKin']) => {
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          const updatedStudent = {
            ...student,
            nextOfKin
          };
          
          // Update selected student if it's the one being updated
          if (selectedStudent?.id === studentId) {
            setSelectedStudent(updatedStudent);
          }
          
          return updatedStudent;
        }
        return student;
      })
    );
    
    toast.success('Next of kin information updated successfully');
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView('profile');
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Main application
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <BrandSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <IdentityHeader userName="Administrator" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentView === 'dashboard' && (
            <Dashboard students={students} onNavigate={handleNavigate} />
          )}

          {currentView === 'register' && (
            <StudentRegistration
              onRegister={handleRegisterStudent}
              nextAdmissionNumber={generateAdmissionNumber()}
            />
          )}

          {currentView === 'students' && (
            <StudentList
              students={students}
              onViewStudent={handleViewStudent}
            />
          )}

          {currentView === 'profile' && selectedStudent && (
            <StudentProfile
              student={selectedStudent}
              onClose={handleCloseProfile}
              onUpdateFees={handleUpdateFees}
              onUpdateNextOfKin={handleUpdateNextOfKin}
            />
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}