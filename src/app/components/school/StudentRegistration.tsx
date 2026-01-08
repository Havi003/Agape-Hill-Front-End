import { useState } from 'react';
import { GraduationCap, Save, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Exporting Student interface for use in StudentList.tsx
export interface Student {
  id: string;
  admissionNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  studentClass: string;
  nemisNumber: string;
  balance: number;
  kinName: string;
  kinRelationship: string;
  kinContact: string;
  kinEmail: string;
  kinAddress: string;
}

interface StudentRegistrationProps {
  onSuccess?: () => void;
}

export function StudentRegistration({ onSuccess }: StudentRegistrationProps) {
  // 1. Nested state matching your original prototype
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
    // Required for backend fee record creation
    totalBilled: 0,
    totalPaid: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 2. Validation Logic from Prototype
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

  // 3. Backend Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Mapping nested frontend state to the flat DTO the backend expects
        const payload = {
          fullName: formData.fullName,
          gender: formData.gender,
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

        const response = await fetch('http://localhost:8080/api/students/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            if (onSuccess) onSuccess();
            handleReset();
          }, 2000);
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("Could not connect to the server.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
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
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 shadow-lg transition-all duration-300">
        
        {/* Header Section with Divider */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-1">Student Registration</h2>
            <p className="text-gray-600">Enter details to enroll a new student at Agape Hill Limited</p>
          </div>
          <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="size-9 text-blue-900" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Bio Data */}
          <div>
            <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">Bio Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
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

          {/* Section 2: Government Tracking */}
          <div>
            <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">Government Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Section 3: System Assignment */}
          <div>
            <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">System Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-500">Admission Number</Label>
                <Input value="Pending Generation..." disabled className="bg-gray-50 italic text-gray-400" />
                <p className="text-[11px] text-blue-600">Assigned automatically on save</p>
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

          {/* Section 4: Next of Kin */}
          <div>
            <h3 className="mb-4 pb-2 border-b border-gray-200 font-bold text-gray-700">Next of Kin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Guardian Name *</Label>
                <Input
                  value={formData.nextOfKin.name}
                  onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, name: e.target.value } })}
                  className={errors['nextOfKin.name'] ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Input
                  placeholder="e.g. Father, Mother, Uncle"
                  value={formData.nextOfKin.relationship}
                  onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, relationship: e.target.value } })}
                  className={errors['nextOfKin.relationship'] ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone *</Label>
                <Input
                  value={formData.nextOfKin.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, phoneNumber: e.target.value } })}
                  className={errors['nextOfKin.phoneNumber'] ? 'border-red-500' : ''}
                />
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
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              className="bg-blue-900 hover:bg-blue-800 min-w-[160px]"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="size-4 mr-2" />
              ) : (
                <Save className="size-4 mr-2" />
              )}
              {isSuccess ? 'Registered!' : 'Register Student'}
            </Button>
            
            <Button type="button" variant="outline" onClick={handleReset}>
              <X className="size-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}