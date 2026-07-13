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
      <Card className="p-4 shadow-sm sm:p-6 lg:p-8 lg:shadow-lg">
        {/* Header Block Section */}
        <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:mb-6 sm:flex-row sm:items-center sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:size-12">
              <Users className="size-6 text-blue-900 sm:size-7" />
            </div>
            <div>
              <h2 className="mb-0.5 text-lg font-bold sm:mb-1 sm:text-xl">
                {filterClass === 'all' ? 'All Records' : `${filterClass} Directory`}
              </h2>
              <p className="text-gray-500 text-sm">Enrolled: {targetStudents.length} students</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-80 lg:w-96">
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
          <div className="px-4 py-12 text-center text-gray-500 sm:p-12">
            No student records found under this class tier.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile directory cards keep every record readable without horizontal scrolling. */}
            <div className="space-y-3 md:hidden">
              {paginatedStudents.map((student) => (
                <article key={student.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
                      {student.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-gray-900">{student.fullName}</h3>
                      <p className="mt-0.5 break-all font-mono text-xs font-semibold text-blue-900">
                        {student.admissionNumber}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">Gender</dt>
                      <dd className="mt-0.5 font-semibold text-gray-800">{student.studentGender || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Fee balance</dt>
                      <dd className={`mt-0.5 font-bold ${student.feeStatus && student.feeStatus.balance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                        Ksh. {student.feeStatus?.balance?.toLocaleString() || '0.00'}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    variant="outline"
                    onClick={() => onViewStudent(student)}
                    className="mt-4 w-full border-blue-200 text-blue-900 hover:bg-blue-50"
                  >
                    <Eye className="mr-2 size-4" /> View profile
                  </Button>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 text-center text-sm text-gray-600 sm:flex-row sm:text-left">
              <div>
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(startIndex + RECORDS_PER_PAGE, targetStudents.length)}
                </span>{' '}
                of <span className="font-semibold">{targetStudents.length}</span> students
              </div>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-2.5 disabled:opacity-40 sm:px-3"
                >
                  <ChevronLeft className="size-4 sm:mr-1" /> <span className="hidden sm:inline">Prev</span>
                </Button>

                <div className="flex items-center gap-1 px-2 font-medium text-gray-900">
                  Page <span>{currentPage}</span> of <span>{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-2.5 disabled:opacity-40 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4 sm:ml-1" />
                </Button>
              </div>
            </div>

          </div>
        )}
      </Card>
    </div>
  );
}
