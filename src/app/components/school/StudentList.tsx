import { useState, useEffect } from 'react';
import { Search, Eye, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Student } from './StudentRegistration'; 

interface StudentListProps {
  onViewStudent: (student: Student) => void;
  filterClass: string; 
}

export function StudentList({ onViewStudent, filterClass }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 1. Pagination Configuration States
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/students');
        const result = await response.json();

        if (response.ok && result.header.responseCode === "200") {
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
  }, [filterClass]);

  // 2. Reset back to page 1 instantly whenever search filters or side class views shift
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterClass]);

  // Filter based on search entries and specific parameters
  const targetStudents = students.filter(student => {
    const matchesClass = filterClass === 'all' || student.studentClass === filterClass;
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // 3. Compute Pagination Window Framework
  const totalPages = Math.max(1, Math.ceil(targetStudents.length / RECORDS_PER_PAGE));
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedStudents = targetStudents.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="size-12 text-blue-900 animate-spin mb-4" />
      <p className="text-gray-600">Retrieving {filterClass} records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="p-8 shadow-lg">
        {/* Header Block Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="size-7 text-blue-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">
                {filterClass === 'all' ? 'All Records' : `${filterClass} Directory`}
              </h2>
              <p className="text-gray-500 text-sm">Enrolled: {targetStudents.length} students</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder={`Search within ${filterClass}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {targetStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No student records found under this class tier.
          </div>
        ) : (
          <div className="space-y-4">
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
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-900">
                        {student.admissionNumber}
                      </td>
                      <td className="px-6 py-4 font-medium">{student.fullName}</td>
                      <td className="px-6 py-4">{student.studentGender}</td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={student.feeStatus && student.feeStatus.balance > 0 ? 'text-red-600' : 'text-green-600'}>
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

            {/* 4. PACING INTERACTIVE CONTROLS BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <div>
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(startIndex + RECORDS_PER_PAGE, targetStudents.length)}
                </span>{' '}
                of <span className="font-semibold">{targetStudents.length}</span> students
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="size-4 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-1 font-medium text-gray-900 px-2">
                  Page <span>{currentPage}</span> of <span>{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 disabled:opacity-40"
                >
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>

          </div>
        )}
      </Card>
    </div>
  );
}