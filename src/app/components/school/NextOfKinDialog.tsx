import { useState, useEffect } from 'react';
import { X, Save, Users, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Student } from './StudentRegistration';
import type { NextOfKinPayload } from '../../../services/StudentsApi';

interface NextOfKinDialogProps {
  student: Student;
  currentKin: NextOfKinPayload;
  onClose: () => void;
  onUpdateNextOfKin: (
    studentId: string,
    nextOfKin: NextOfKinPayload
  ) => Promise<boolean>;
}

export function NextOfKinDialog({
  student,
  currentKin,
  onClose,
  onUpdateNextOfKin
}: NextOfKinDialogProps) {

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Keep the form aligned with the record already loaded by the profile.
  useEffect(() => {
    setFormData({
      name: currentKin.name || '',
      relationship: currentKin.relationship || '',
      phoneNumber: currentKin.phoneNumber || '',
      email: currentKin.email || '',
      address: currentKin.address || ''
    });
  }, [student.id, currentKin]);

  // ✅ VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.relationship.trim()) newErrors.relationship = 'Relationship is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    const wasUpdated = await onUpdateNextOfKin(student.id, {
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      address: formData.address.trim()
    });
    setIsSaving(false);

    if (wasUpdated) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

      <Card className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-4 shadow-2xl sm:p-8">

        {/* HEADER */}
        <div className="mb-6 flex items-start justify-between gap-3 border-b border-gray-200 pb-4 sm:items-center">

          <div className="flex items-center gap-3">
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:flex">
              <Users className="size-6 text-blue-900" />
            </div>

            <div>
              <h2>Edit Next of Kin</h2>
              <p className="break-all text-sm text-gray-600 sm:text-base">
                {student.fullName} - {student.admissionNumber}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
            <X className="size-5" />
          </Button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">

            <div>
              <Label>Name *</Label>
              <Input
                disabled={isSaving}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <Label>Relationship *</Label>
              <Input
                disabled={isSaving}
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
              />
              {errors.relationship && <p className="text-red-500 text-sm">{errors.relationship}</p>}
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input
                disabled={isSaving}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                disabled={isSaving}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Address *</Label>
              <Input
                disabled={isSaving}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">

            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isSaving}>
              Cancel
            </Button>

            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 sm:w-auto" disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

          </div>
        </form>

      </Card>
    </div>
  );
}
