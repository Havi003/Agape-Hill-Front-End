import { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Student } from './StudentRegistration';
import { getNextofKinDetails } from '../../../services/StudentsApi';

interface NextOfKinDialogProps {
  student: Student;
  onClose: () => void;
  onUpdateNextOfKin: (
    studentId: string,
    nextOfKin: {
      kinName: string;
      kinRelationship: string;
      kinContact: string;
      kinEmail: string;
      kinAddress: string;
    }
  ) => void;
}

export function NextOfKinDialog({
  student,
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
  const [loading, setLoading] = useState(false);

  // ✅ SAFE FETCH + PROPER MAPPING
  useEffect(() => {
    let isMounted = true;

    const fetchKin = async () => {
      if (!student?.id) return;

      try {
        setLoading(true);

        const data = await getNextofKinDetails(student.id);

        if (!isMounted) return;

        setFormData({
          name: data?.name || student.kinName || '',
          relationship: data?.relationship || student.kinRelationship || '',
          phoneNumber: data?.phoneNumber || student.kinContact || '',
          email: data?.email || '',
          address: data?.address || ''
        });

      } catch (error) {
        console.error("Failed to load next of kin:", error);

        // fallback to student data
        if (isMounted) {
          setFormData({
            name: student.kinName || '',
            relationship: student.kinRelationship || '',
            phoneNumber: student.kinContact || '',
            email: student.kinEmail || '',
            address: student.kinAddress || ''
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchKin();

    return () => {
      isMounted = false;
    };
  }, [student.id]);

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onUpdateNextOfKin(student.id, {
      kinName: formData.name,
      kinRelationship: formData.relationship,
      kinContact: formData.phoneNumber,
      kinEmail: formData.email,
      kinAddress: formData.address
    });

    onClose();
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

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <p className="text-sm text-gray-500 mb-4">
            Loading next of kin details...
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">

            <div>
              <Label>Name *</Label>
              <Input
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

            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>

            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 sm:w-auto">
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>

          </div>
        </form>

      </Card>
    </div>
  );
}
