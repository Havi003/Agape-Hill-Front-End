import { useState, useEffect } from 'react';
import { Search, Eye, Users, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
// This import will now work because we exported 'Student' in StudentRegistration.tsx
import { Student } from './StudentRegistration'; 

interface StudentListProps {
  onViewStudent: (student: Student) => void;
}

export function StudentList({ onViewStudent }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/students');
        const result = await response.json();

        if (response.ok && result.header.responseCode === "200") {
          // Access the 'body' from your WsResponse wrapper
          setStudents(result.body || []);
        } else {
          setError(result.header.message || "Failed to load students");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="size-12 text-blue-900 animate-spin mb-4" />
      <p className="text-gray-600">Retrieving student records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="size-7 text-blue-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">All Students</h2>
              <p className="text-gray-600">Total: {students.length} students registered</p>
            </div>
          </div>
          
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search by name or admission no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b-2 border-blue-900">
              <tr>
                <th className="px-6 py-4 text-left text-blue-900 font-bold">Admission No.</th>
                <th className="px-6 py-4 text-left text-blue-900 font-bold">Full Name</th>
                <th className="px-6 py-4 text-left text-blue-900 font-bold">Gender</th>
                <th className="px-6 py-4 text-left text-blue-900 font-bold">Fee Balance</th>
                <th className="px-6 py-4 text-center text-blue-900 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-blue-900">
                    {student.admissionNumber}
                  </td>
                  <td className="px-6 py-4 font-medium">{student.fullName}</td>
                  <td className="px-6 py-4">{student.gender}</td>
                  <td className="px-6 py-4 font-semibold">
                    <span className={student.feeStatus?.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                      Ksh. {student.feeStatus?.balance?.toLocaleString() || '0.00'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="outline" size="sm" onClick={() => onViewStudent(student)}>
                      <Eye className="size-4 mr-2" /> View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}