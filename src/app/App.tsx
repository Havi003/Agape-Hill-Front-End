import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { LoginScreen } from './components/school/LoginScreen';
import { BrandSidebar } from './components/school/BrandSidebar';
import { IdentityHeader } from './components/school/IdentityHeader';
import { Dashboard } from './components/school/Dashboard';
import { StudentRegistration, Student } from './components/school/StudentRegistration';
import { StudentList } from './components/school/StudentList';
import { StudentProfile } from './components/school/StudentProfile';
import { EventsManager } from './components/school/EventsManager';

export default function App() {
  // 1. Initialize auth state directly from localStorage so reloads don't break it
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ahps_authenticated') === 'true';
  });

  // 2. Initialize currentView from localStorage so reloads keep you on the same page
  const [currentView, setCurrentView] = useState<string>(() => {
    return localStorage.getItem('ahps_current_view') || 'dashboard';
  });

  // 3. Initialize students from localStorage so you don't lose data on reload
  const [students, setStudents] = useState<Student[]>(() => {
    const savedStudents = localStorage.getItem('ahps_students');
    return savedStudents ? JSON.parse(savedStudents) : [];
  });

  // 4. Initialize selectedStudent from localStorage so profile view survives reloads
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    const savedStudent = localStorage.getItem('ahps_selected_student');
    return savedStudent ? JSON.parse(savedStudent) : null;
  });

  // Helper to safely update and persist the students array
  const saveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem('ahps_students', JSON.stringify(newStudents));
  };

  // Helper to safely update and persist the active view
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('ahps_current_view', view);
    setSelectedStudent(null);
    localStorage.removeItem('ahps_selected_student');
  };

  // Generate admission number (format: AHPS2026001)
  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    return `AHPS${year}${String(count).padStart(3, '0')}`;
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ahps_authenticated', 'true');
    toast.success('Welcome to Agape Hill Management System');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setSelectedStudent(null);
    
    // Clear out session state from localStorage
    localStorage.removeItem('ahps_authenticated');
    localStorage.removeItem('ahps_current_view');
    localStorage.removeItem('ahps_selected_student');
    localStorage.removeItem('ahps_last_class_view');
    
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

    const updatedStudents = [...students, newStudent];
    saveStudents(updatedStudents);
    
    toast.success(
      `Student ${newStudent.fullName} successfully added to Agape Hill`,
      {
        description: `Admission Number: ${newStudent.admissionNumber}`
      }
    );

    // Save profile context and navigate to the profile directly
    setSelectedStudent(newStudent);
    localStorage.setItem('ahps_selected_student', JSON.stringify(newStudent));
    setCurrentView('profile');
    localStorage.setItem('ahps_current_view', 'profile');
  };

  // UX Fix: Returns to the specific class tier view instead of a generic fallback
  const handleCloseProfile = () => {
    setSelectedStudent(null);
    localStorage.removeItem('ahps_selected_student');
    
    const returnView = localStorage.getItem('ahps_last_class_view') || 'students-Grade 1';
    setCurrentView(returnView);
    localStorage.setItem('ahps_current_view', returnView);
  };

  const handleUpdateFees = (studentId: string, feeUpdate: { totalBilled?: number; totalPaid?: number }) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const totalBilled = feeUpdate.totalBilled ?? student.feeStatus.totalBilled;
        const totalPaid = feeUpdate.totalPaid ?? student.feeStatus.totalPaid;
        const balance = totalBilled - totalPaid;
        
        const updatedStudent = {
          ...student,
          feeStatus: { totalBilled, totalPaid, balance }
        };
        
        if (selectedStudent?.id === studentId) {
          setSelectedStudent(updatedStudent);
          localStorage.setItem('ahps_selected_student', JSON.stringify(updatedStudent));
        }
        
        return updatedStudent;
      }
      return student;
    });

    saveStudents(updatedStudents);
    toast.success('Fee status updated successfully');
  };

  const handleUpdateNextOfKin = (studentId: string, nextOfKin: Student['nextOfKin']) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student, nextOfKin };
        
        if (selectedStudent?.id === studentId) {
          setSelectedStudent(updatedStudent);
          localStorage.setItem('ahps_selected_student', JSON.stringify(updatedStudent));
        }
        
        return updatedStudent;
      }
      return student;
    });

    saveStudents(updatedStudents);
    toast.success('Next of kin information updated successfully');
  };

  const handleViewStudent = (student: Student) => {
    // Before switching to profile view, remember what sub-class view we were currently browsing
    if (currentView.startsWith('students-')) {
      localStorage.setItem('ahps_last_class_view', currentView);
    }
    
    setSelectedStudent(student);
    localStorage.setItem('ahps_selected_student', JSON.stringify(student));
    setCurrentView('profile');
    localStorage.setItem('ahps_current_view', 'profile');
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Dropdown choices flow right through here */}
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

          {/* New Architectural Pattern: Captures any view starting with "students-" */}
          {currentView.startsWith('students-') && (
            <StudentList
              onViewStudent={handleViewStudent}
              filterClass={currentView.replace('students-', '')} 
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

        {currentView === 'events' && (
           <EventsManager />
        )}
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}