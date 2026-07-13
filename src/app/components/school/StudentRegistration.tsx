import { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  FileSpreadsheet, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as XLSX from 'xlsx';

// Import your newly updated cleaner Axios API handlers
import { registerStudent, registerStudentsInBulk } from '../../../services/StudentsApi';

export interface FeeStatus {
  totalBilled: number;
  totalPaid: number;
  balance: number;
}

export interface Student {
  id: string;
  admissionNumber: string;
  fullName: string;
  studentGender: string;
  dateOfBirth: string;
  studentClass: string;
  nemisNumber: string;
  feeStatus: FeeStatus;
  kinName: string;
  kinRelationship: string;
  kinContact: string;
  kinEmail: string;
  kinAddress: string;
  registeredDate: Date;
}

interface StudentRegistrationProps {
  onSuccess?: () => void;
}

export function StudentRegistration({ onSuccess }: StudentRegistrationProps) {
  // Navigation mode toggle: 'single' | 'bulk'
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');

  // Single Registration Form States
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    studentClass: '',
    nemisNumber: '',
    nextOfKin: {
      name: '',
      relationship: '',
      phoneNumber: '',
      email: '',
      address: '',
    },
    totalBilled: 0,
    totalPaid: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Bulk Upload Spreadsheet States
  const [dragActive, setDragActive] = useState(false);
  const [excelStudents, setExcelStudents] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [bulkError, setBulkError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean utility to normalize headers from various user-input styles
  const normalizeKey = (key: string) => key.toLowerCase().replace(/[\s_-]/g, '');

  // Process Local Spreadsheet data
  const handleExcelParse = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setBulkError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet data rows safely to plain JSON objects
        const rawRows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

        if (rawRows.length === 0) {
          setBulkError("The selected Excel file appears to be completely empty.");
          return;
        }

        // Map variation column names elegantly to flat DTO structures
        const parsedData = rawRows.map((row) => {
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            normalizedRow[normalizeKey(key)] = row[key];
          });

          return {
            fullName: normalizedRow['fullname'] || normalizedRow['studentname'] || '',
            studentGender: normalizedRow['gender'] || normalizedRow['studentgender'] || '',
            dateOfBirth: normalizedRow['dateofbirth'] || normalizedRow['dob'] || '',
            studentClass: normalizedRow['class'] || normalizedRow['studentclass'] || '',
            nemisNumber: String(normalizedRow['nemisnumber'] || normalizedRow['nemis'] || ''),
            kinName: normalizedRow['guardianname'] || normalizedRow['kinname'] || '',
            kinRelationship: normalizedRow['relationship'] || normalizedRow['kinrelationship'] || '',
            kinContact: String(normalizedRow['contactphone'] || normalizedRow['kincontact'] || normalizedRow['phonenumber'] || ''),
            kinEmail: normalizedRow['email'] || normalizedRow['kinemail'] || '',
            kinAddress: normalizedRow['address'] || normalizedRow['physicaladdress'] || normalizedRow['kinaddress'] || '',
            totalBilled: Number(normalizedRow['totalbilled'] || normalizedRow['billed'] || 0),
            totalPaid: Number(normalizedRow['totalpaid'] || normalizedRow['paid'] || 0)
          };
        });

        setExcelStudents(parsedData);
      } catch (err) {
        console.error("Excel conversion failed:", err);
        setBulkError("Failed to successfully parse your Excel file. Ensure it is a genuine .xlsx or .xls document.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop interface lifecycle handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExcelParse(e.dataTransfer.files[0]);
    }
  };

  // Handle Form Submission for Single Registration
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName,
        studentGender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        studentClass: formData.studentClass,
        nemisNumber: formData.nemisNumber,
        kinName: formData.nextOfKin.name,
        kinRelationship: formData.nextOfKin.relationship,
        kinContact: formData.nextOfKin.phoneNumber,
        kinEmail: formData.nextOfKin.email,
        kinAddress: formData.nextOfKin.address,
        totalBilled: formData.totalBilled,
        totalPaid: formData.totalPaid
      };

      // Using your newly typed Axios service handler
      await registerStudent(payload);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        handleReset();
      }, 2000);
    } catch (err) {
      console.error("Form single submission error:", err);
      alert("Could not process single student registration. Please verify connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Form Submission for Bulk Processing
  const handleBulkSubmit = async () => {
    if (excelStudents.length === 0) return;
    setIsSubmitting(true);
    try {
      // Using your newly typed Axios batch handler
      await registerStudentsInBulk(excelStudents);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setExcelStudents([]);
        setFileName('');
        if (onSuccess) onSuccess();
      }, 2500);
    } catch (err) {
      console.error("Batch submission processing failure:", err);
      alert("Server rejected the batch file processing validation rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Registration Client Validation Logics
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.studentClass) newErrors.studentClass = 'Class assignment is required';
    if (!formData.nemisNumber.trim()) {
      newErrors.nemisNumber = 'NEMIS number is required';
    } else if (formData.nemisNumber.length !== 11) {
      newErrors.nemisNumber = 'NEMIS number must be exactly 11 characters';
    }
    if (!formData.nextOfKin.name.trim()) newErrors['nextOfKin.name'] = 'Guardian name is required';
    if (!formData.nextOfKin.relationship.trim()) newErrors['nextOfKin.relationship'] = 'Relationship is required';
    if (!formData.nextOfKin.phoneNumber.trim()) newErrors['nextOfKin.phoneNumber'] = 'Phone number is required';
    if (!formData.nextOfKin.address.trim()) newErrors['nextOfKin.address'] = 'Physical address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({
      fullName: '', gender: '', dateOfBirth: '', studentClass: '', nemisNumber: '',
      nextOfKin: { name: '', relationship: '', phoneNumber: '', email: '', address: '' },
      totalBilled: 0, totalPaid: 0
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sub-navigation Switch Tab Toggles */}
      <div className="mb-4 grid w-full grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1.5 sm:flex sm:w-max sm:space-x-2">
        <Button 
          type="button" 
          variant={activeMode === 'single' ? 'default' : 'ghost'}
          className={`${activeMode === 'single' ? 'bg-blue-900 shadow-sm text-white hover:bg-blue-800' : 'text-gray-600'} h-auto px-2 py-2 text-xs sm:px-4 sm:text-sm`}
          onClick={() => setActiveMode('single')}
        >
          Single Enrollment
        </Button>
        <Button 
          type="button" 
          variant={activeMode === 'bulk' ? 'default' : 'ghost'}
          className={`${activeMode === 'bulk' ? 'bg-blue-900 shadow-sm text-white hover:bg-blue-800' : 'text-gray-600'} h-auto px-2 py-2 text-xs sm:px-4 sm:text-sm`}
          onClick={() => setActiveMode('bulk')}
        >
          Bulk Import (Excel)
        </Button>
      </div>

      <Card className="p-4 shadow-sm transition-all duration-300 sm:p-6 lg:p-8 lg:shadow-lg">
        {/* Dynamic Card Headings Header */}
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-gray-200 pb-5 sm:mb-8 sm:pb-6">
          <div>
            <h2 className="mb-1 text-xl font-bold text-blue-900 sm:text-2xl">
              {activeMode === 'single' ? 'Student Registration' : 'Excel Batch Enrollment'}
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              {activeMode === 'single' ? 'Enter details to enroll a new student at Agape Hill' : 'Drop your school registration spreadsheets below'}
            </p>
          </div>
          <div className="hidden size-16 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:flex">
            {activeMode === 'single' ? <GraduationCap className="size-9 text-blue-900" /> : <FileSpreadsheet className="size-9 text-blue-900" />}
          </div>
        </div>

        {/* MODE A: SINGLE ENROLLMENT FORM */}
        {activeMode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-6 sm:space-y-8">
            {/* Bio Data */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">Bio Data</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter student's full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-red-600">{errors.gender}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-600">{errors.dateOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* Tracking & Class System */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">System & Government Tracking</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nemis">NEMIS Number *</Label>
                  <Input
                    id="nemis"
                    maxLength={11}
                    placeholder="11-character unique ID"
                    value={formData.nemisNumber}
                    onChange={(e) => setFormData({ ...formData, nemisNumber: e.target.value })}
                    className={errors.nemisNumber ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between items-center">
                     {errors.nemisNumber && <p className="text-xs text-red-600">{errors.nemisNumber}</p>}
                     <p className="text-[10px] text-gray-400 ml-auto">{formData.nemisNumber.length}/11</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Academic Class *</Label>
                  <Input
                    id="class"
                    placeholder="e.g. Grade 4"
                    value={formData.studentClass}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className={errors.studentClass ? 'border-red-500' : ''}
                  />
                  {errors.studentClass && <p className="text-xs text-red-600">{errors.studentClass}</p>}
                </div>
              </div>
            </div>

            {/* Next of Kin Details */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">Next of Kin Details</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <Label>Guardian Name *</Label>
                  <Input
                    value={formData.nextOfKin.name}
                    onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, name: e.target.value } })}
                    className={errors['nextOfKin.name'] ? 'border-red-500' : ''}
                  />
                  {errors['nextOfKin.name'] && <p className="text-xs text-red-600">{errors['nextOfKin.name']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Relationship *</Label>
                  <Input
                    placeholder="e.g. Father, Mother"
                    value={formData.nextOfKin.relationship}
                    onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, relationship: e.target.value } })}
                    className={errors['nextOfKin.relationship'] ? 'border-red-500' : ''}
                  />
                  {errors['nextOfKin.relationship'] && <p className="text-xs text-red-600">{errors['nextOfKin.relationship']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone *</Label>
                  <Input
                    value={formData.nextOfKin.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, phoneNumber: e.target.value } })}
                    className={errors['nextOfKin.phoneNumber'] ? 'border-red-500' : ''}
                  />
                  {errors['nextOfKin.phoneNumber'] && <p className="text-xs text-red-600">{errors['nextOfKin.phoneNumber']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.nextOfKin.email}
                    onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, email: e.target.value } })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Physical Address *</Label>
                  <Input
                    placeholder="Street, Estate, City"
                    value={formData.nextOfKin.address}
                    onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, address: e.target.value } })}
                    className={errors['nextOfKin.address'] ? 'border-red-500' : ''}
                  />
                  {errors['nextOfKin.address'] && <p className="text-xs text-red-600">{errors['nextOfKin.address']}</p>}
                </div>
              </div>
            </div>

            {/* Single Registration Form Action Elements */}
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:gap-4">
              <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 sm:w-auto sm:min-w-[160px]" disabled={isSubmitting || isSuccess}>
                {isSubmitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : isSuccess ? <CheckCircle2 className="size-4 mr-2" /> : <Save className="size-4 mr-2" />}
                {isSuccess ? 'Registered!' : 'Register Student'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                <X className="size-4 mr-2" /> Clear Form
              </Button>
            </div>
          </form>
        )}

        {/* MODE B: EXCEL FILE FILE DRAG ZONE */}
        {activeMode === 'bulk' && (
          <div className="space-y-6">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={(e) => e.target.files?.[0] && handleExcelParse(e.target.files[0])}
            />

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-12 ${
                dragActive ? 'border-blue-600 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-full text-blue-900">
                  <UploadCloud className="size-10" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-700">
                    {fileName ? `Selected file: ${fileName}` : 'Drag & drop your Excel file here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse your local storage files</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md font-mono">
                  Supports .xlsx, .xls formats
                </div>
              </div>
            </div>

            {/* Error notifications display block */}
            {bulkError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg text-sm">
                <AlertCircle className="size-5 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Data Staging List Preview */}
            {excelStudents.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 animate-fadeIn">
                <div className="flex flex-col items-start justify-between gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="size-5 text-emerald-600" />
                    <span className="font-bold text-gray-700">Spreadsheet Staging Area</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
                    {excelStudents.length} Students Detected
                  </span>
                </div>

                {/* Staging Data Micro preview card items rows wrapper */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-sm text-gray-600">
                  {excelStudents.slice(0, 5).map((st, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded border border-gray-100">
                      <span className="font-medium text-gray-800">{st.fullName || 'Missing Name'}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                        {st.studentClass || 'No Class'} • {st.studentGender || 'No Gender'}
                      </span>
                    </div>
                  ))}
                  {excelStudents.length > 5 && (
                    <p className="text-xs text-gray-400 italic text-center pt-1">
                      ...and {excelStudents.length - 5} other student records staged below.
                    </p>
                  )}
                </div>

                {/* Staging Execution Submission buttons */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:space-x-3">
                  <Button 
                    onClick={handleBulkSubmit}
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-emerald-600 px-6 font-medium text-white hover:bg-emerald-700 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="size-4 mr-2" />
                    ) : (
                      <Save className="size-4 mr-2" />
                    )}
                    {isSuccess ? 'Import Completed!' : `Commit ${excelStudents.length} Students`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setExcelStudents([]); setFileName(''); }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
