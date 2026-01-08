import { useEffect, useState } from 'react';
import { Users, UserPlus, GraduationCap, TrendingUp, Search } from 'lucide-react';
import { Card } from '../ui/card';

// Define the structure of your backend "body"
interface DashboardStatsData {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  registationsThiMonth: number; // Matches the typo in your backend JSON
  malePercentage: number;
  femalePercentage: number;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/students/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data.body);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-blue-900 font-semibold">Loading Dashboard...</div>;

  const stats = [
    { title: 'Total Students', value: statsData?.totalStudents || 0, icon: Users, color: 'bg-blue-500', description: 'Registered in the system' },
    { title: 'Male Students', value: statsData?.maleStudents || 0, icon: Users, color: 'bg-green-500', description: `${statsData?.malePercentage.toFixed(1)}% of total` },
    { title: 'Female Students', value: statsData?.femaleStudents || 0, icon: Users, color: 'bg-purple-500', description: `${statsData?.femalePercentage.toFixed(1)}% of total` },
    { title: 'This Month', value: statsData?.registationsThiMonth || 0, icon: TrendingUp, color: 'bg-orange-500', description: 'New registrations' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* Welcome Banner */}
      <Card className="p-8 bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="size-16 bg-white/20 rounded-full flex items-center justify-center">
            <GraduationCap className="size-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome to Agape Hill Limited</h1>
            <p className="text-blue-100">Management System Dashboard</p>
          </div>
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className={`size-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="size-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="font-semibold text-gray-700 mb-1">{stat.title}</p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </Card>
          );
        })}
      </div>

      {/* RE-INSERTED: Recent Registrations and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Registrations Section */}
        <Card className="lg:col-span-2 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-bold mb-4 self-start">Recent Registrations</h2>
          <div className="text-center py-8">
            <Users className="size-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students registered yet</p>
          </div>
        </Card>

        {/* Quick Actions Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {/* Register Student Button */}
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

            {/* RESTORED: View All Students Button */}
            <button
              onClick={() => onNavigate('students')}
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
          "Arise and Shine" - Agape Hill Limited
        </p>
      </Card>
    </div>
  );
}