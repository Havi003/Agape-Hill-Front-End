import { useEffect, useState } from 'react';
import { Users, UserPlus, GraduationCap, TrendingUp, Search, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from '../../imports/school_logo.png';
import { apiUrl } from '../../../config/api';

// Your existing stats interface
interface DashboardStatsData {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  registrationsThisMonth: number;
  malePercentage: number;
  femalePercentage: number;
}

// Student response structure matching your backend
interface StudentItem {
  id: string;
  fullName: string;
  admissionNumber: string;
  studentGender: string;
  registeredDate: string;
  studentClass?: string;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [recentStudents, setRecentStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Fire off both API requests concurrently
      Promise.all([
        fetch(apiUrl('/students/dashboard-stats')).then((res) => res.json()),
        fetch(apiUrl('/students')).then((res) => res.json())
      ])
        .then(([statsRes, studentsRes]) => {
          setStatsData(statsRes.body);
          
          // Extract array from standard backend .body envelope
          const allStudents: StudentItem[] = studentsRes.body || [];
          
          // SORTING LOGIC: High-precision sort by exact Date and Time
          const sortedStudents = [...allStudents].sort((a, b) => {
            const timeA = a.registeredDate ? new Date(a.registeredDate).getTime() : 0;
            const timeB = b.registeredDate ? new Date(b.registeredDate).getTime() : 0;
            
            // 1. Sort by precise time (Newest millisecond timestamp first)
            if (timeB !== timeA) {
              return timeB - timeA;
            }
            
            // 2. Fallback constraint: If exact same millisecond, sort alphabetically by name
            return a.fullName.localeCompare(b.fullName);
          });
          
          // Take the 3 most recently added students from the sorted array
          setRecentStudents(sortedStudents.slice(0, 3));
          
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load dashboard data strings", err);
          setLoading(false);
        });
    }, []);

  if (loading) return <div className="p-10 text-center text-blue-900 font-semibold">Loading Dashboard...</div>;

  const stats = [
    { title: 'Total Students', value: statsData?.totalStudents || 0, icon: Users, color: 'bg-blue-500', description: 'Registered in the system' },
    { title: 'Male Students', value: statsData?.maleStudents || 0, icon: Users, color: 'bg-green-500', description: `${statsData?.malePercentage?.toFixed(1) ?? '0.0'}% of total` },
    { title: 'Female Students', value: statsData?.femaleStudents || 0, icon: Users, color: 'bg-purple-500', description: `${statsData?.femalePercentage?.toFixed(1) ?? '0.0'}% of total` },
    { title: 'This Month', value: statsData?.registrationsThisMonth || 0, icon: TrendingUp, color: 'bg-orange-500', description: 'New registrations' }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8 sm:p-2 lg:p-4">
      {/* Welcome Banner */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white p-0.5 sm:size-16">
            <ImageWithFallback src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="mb-1 text-xl font-bold leading-tight sm:text-2xl">Welcome to Agape Hill</h1>
            <p className="text-sm text-blue-100 sm:text-base">Management System Dashboard</p>
          </div>
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 transition-shadow hover:shadow-md sm:p-6">
              <div className={`size-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="size-6 text-white" />
              </div>
              <h3 className="mb-1 text-2xl font-bold sm:text-3xl">{stat.value}</h3>
              <p className="mb-1 text-sm font-semibold text-gray-700 sm:text-base">{stat.title}</p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Data Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DYNAMICALLY FIXED: Recent Registrations Section */}
        <Card className="flex min-h-[300px] flex-col justify-between p-4 sm:p-6 lg:col-span-2">
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-900">Recent Registrations</h2>
            
            {recentStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="size-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students registered yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-900">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{student.fullName}</p>
                        <p className="break-all text-xs text-gray-500 sm:text-sm">{student.admissionNumber} • {student.studentGender}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400 sm:px-3 sm:text-sm">
                      <Calendar className="size-3.5" />
                      <span>
                        {student.registeredDate && new Date(student.registeredDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentStudents.length > 0 && (
            <button 
              onClick={() => onNavigate('students-all')}
              className="mt-4 text-sm font-semibold text-blue-950 hover:text-blue-700 transition-colors text-left border-t pt-4"
            >
              View all registered profiles →
            </button>
          )}
        </Card>

        {/* Quick Actions Section */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group"
            >
              <div className="size-12 bg-blue-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserPlus className="size-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900">Register Student</p>
                <p className="text-sm text-gray-600">Add new student</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('students-all')}
              className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left group"
            >
              <div className="size-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="size-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-900">View All Students</p>
                <p className="text-sm text-gray-600">Browse student list</p>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* School Motto Section */}
      <Card className="p-6 bg-blue-50 border-l-4 border-blue-900 shadow-sm">
        <p className="text-center text-lg italic text-blue-900 font-medium">
          "Arise and Shine" - Agape Hill 
        </p>
      </Card>
    </div>
  );
}
