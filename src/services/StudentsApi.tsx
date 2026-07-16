// src/api/studentApi.ts
import axios from 'axios';
import { apiUrl } from '../config/api';

// Axios instance
const api = axios.create({
  baseURL: apiUrl('/students'),
  headers: { 'Content-Type': 'application/json' }
});

// Types (IMPORTANT for safety)
export interface Student {
  id: string; // UUID ✅
  admissionNumber: string;
  fullName: string;
  studentClass?: string;
  studentGender?: string;
  registeredDate?: string;
  dateOfBirth?: string;
  feeStatus?: {
    totalBilled: number;
    totalPaid: number;
    balance: number;
  };
  kinName?: string;
  kinRelationship?: string;
  kinContact?: string;
}

export interface NextOfKinPayload {
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  address: string;
}

// ✅ FIXED: Safely structured to avoid adding unintended trailing slashes
export const getStudents = async (search: string = ""): Promise<Student[]> => {
  const res = await api.get('', {
    params: search ? { search } : {} // Axios adds ?search=xxx cleanly ONLY if it exists
  });
  return res.data.body;
};

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard-stats');
  return res.data.body;
};

// 🛠️ ALIGNED: Pointed to '/create' to match your Spring Controller mapping (@PostMapping("/create"))
export const registerStudent = async (data: any) => {
  const res = await api.post('/create', data);
  return res.data.body;
};

// ✅ NEW: Bulk creation endpoint mapping directly to your backend array processor
export const registerStudentsInBulk = async (data: any[]) => {
  const res = await api.post('/bulk-create', data);
  return res.data.body;
};

export const getNextofKinDetails = async (studentId: string) => {
  // 🛡️ Guard against wrong ID
  if (!studentId || !studentId.includes('-')) {
    console.error("❌ Invalid UUID passed:", studentId);
    throw new Error("Invalid student ID (UUID expected)");
  }

  const res = await api.get(`/${studentId}/next-of-kin`);
  return res.data.body; // ✅ consistent
};

export const updateNextOfKinDetails = async (
  studentId: string,
  data: NextOfKinPayload
): Promise<NextOfKinPayload> => {
  if (!studentId || !studentId.includes('-')) {
    console.error("❌ Invalid UUID passed:", studentId);
    throw new Error("Invalid student ID (UUID expected)");
  }

  const res = await api.put(`/${studentId}/next-of-kin`, data);
  return res.data.body;
};
