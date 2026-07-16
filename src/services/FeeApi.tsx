import axios from 'axios';
import { apiUrl } from '../config/api';

const api = axios.create({ baseURL: apiUrl(''), headers: { 'Content-Type': 'application/json' } });
const body = <T,>(response: { data: { body: T } }): T => response.data.body;

export type TermName = 'TERM_1' | 'TERM_2' | 'TERM_3';
export type ClassGroup = 'ECD_NURSERY' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY';
export type FeeItemType = 'COMPULSORY' | 'OPTIONAL' | 'ONE_TIME';
export const STANDARD_FEE_OPTIONS = [
  { optionName: 'Transport Fee', defaultAmount: 8000 },
  { optionName: 'Maintenance Fee', defaultAmount: 200 },
  { optionName: 'Toilet Paper', defaultAmount: 100 },
  { optionName: 'Computer Classes', defaultAmount: 400 }
] as const;
export interface AcademicYear { id: string; yearName: string; startDate: string; endDate: string; active: boolean; }
export type AcademicYearRequest = Omit<AcademicYear, 'id'>;
export interface AcademicTerm { id: string; academicYearId: string; termName: TermName; startDate: string; endDate: string; status: 'UPCOMING' | 'ACTIVE' | 'CLOSED'; active: boolean; }
export type AcademicTermRequest = Pick<AcademicTerm, 'academicYearId' | 'termName' | 'startDate' | 'endDate'>;
export interface FeeItem { id: string; itemName: string; amount: number; itemType: FeeItemType; appliesToClassGroup?: string; description?: string; }
export type FeeItemRequest = Omit<FeeItem, 'id'>;
export interface FeeStructure { id: string; academicYearId: string; termId: string; classGroup: ClassGroup; name: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; totalCompulsory: number; totalOptional: number; items: FeeItem[]; }
export type FeeStructureRequest = Pick<FeeStructure, 'academicYearId' | 'termId' | 'classGroup' | 'name'>;
export interface StudentFeeOption { id: string; studentId: string; academicYearId: string; termId: string; optionName: string; enabled: boolean; amountOverride?: number; }
export interface StudentFeeOptionsRequest { academicYearId: string; termId: string; options: Array<Pick<StudentFeeOption, 'optionName' | 'enabled' | 'amountOverride'>>; }
export interface BillingPreview { studentId: string; admissionNumber: string; fullName: string; studentClass: string; compulsoryTotal: number; optionalTotal: number; previousBalance: number; credit: number; newTermBill: number; finalBalance: number; }
export interface GenerateBillsRequest { academicYearId: string; termId?: string; classGroup?: string; studentIds?: string[]; }
export interface GenerateBillsResult { generatedCount: number; skippedCount: number; totalBilled: number; message: string; }
export interface StudentCharge { id: string; termName: string; description: string; chargeType: string; amount: number; status: string; createdAt: string; }
export interface StudentPayment { id: string; paymentMethod: string; transactionId?: string; reference?: string; amount: number; paidAt: string; }
export interface StudentStatement { studentId: string; admissionNumber: string; fullName: string; studentClass: string; totalBilled: number; totalPaid: number; balance: number; charges: StudentCharge[]; payments: StudentPayment[]; }
export interface ManualPaymentRequest { studentId: string; academicYearId: string; termId: string; amount: number; paymentMethod: 'CASH' | 'BANK' | 'MANUAL'; reference?: string; notes?: string; paidAt?: string; }
export interface BillingDashboard {
  academicYearId: string | null;
  termId: string | null;
  totalBilled: number;
  totalPaid: number;
  totalBalance: number;
  totalCredit: number;
  activeChargeCount: number;
  paymentCount: number;
  studentCount: number;
  billedStudentCount: number;
  configuredFeeStructures: number;
  publishedFeeStructures: number;
  draftFeeStructures: number;
  configurationReady: boolean;
  readinessMessage: string;
}

export const getAcademicYears = async () => body<AcademicYear[]>(await api.get('/academic-years'));
export const createAcademicYear = async (data: AcademicYearRequest) => body<AcademicYear>(await api.post('/academic-years', data));
export const updateAcademicYear = async (id: string, data: AcademicYearRequest) => body<AcademicYear>(await api.put(`/academic-years/${id}`, data));
export const activateAcademicYear = async (id: string) => body<AcademicYear>(await api.post(`/academic-years/${id}/activate`));
export const getTerms = async (academicYearId?: string) => {
  return body<AcademicTerm[]>(await api.get('/academic-terms', {
    params: academicYearId ? { academicYearId } : {}
  }));
};
export const createTerm = async (data: AcademicTermRequest) => body<AcademicTerm>(await api.post('/academic-terms', data));
export const updateTerm = async (id: string, data: AcademicTermRequest) => body<AcademicTerm>(await api.put(`/academic-terms/${id}`, data));
export const activateTerm = async (id: string) => body<AcademicTerm>(await api.post(`/academic-terms/${id}/activate`));
export const closeTerm = async (id: string) => body<AcademicTerm>(await api.post(`/academic-terms/${id}/close`));
export const getFeeStructures = async (params: Partial<Pick<FeeStructure, 'academicYearId' | 'termId' | 'classGroup'>> = {}) => body<FeeStructure[]>(await api.get('/fee-structures', { params }));
export const getFeeStructure = async (id: string) => body<FeeStructure>(await api.get(`/fee-structures/${id}`));
export const createFeeStructure = async (data: FeeStructureRequest) => body<FeeStructure>(await api.post('/fee-structures', data));
export const updateFeeStructure = async (id: string, data: FeeStructureRequest) => body<FeeStructure>(await api.put(`/fee-structures/${id}`, data));
export const publishFeeStructure = async (id: string) => body<FeeStructure>(await api.post(`/fee-structures/${id}/publish`));
export const archiveFeeStructure = async (id: string) => body<FeeStructure>(await api.post(`/fee-structures/${id}/archive`));
export const duplicateFeeStructure = async (id: string) => body<FeeStructure>(await api.post(`/fee-structures/${id}/duplicate`));
export const addFeeItem = async (structureId: string, data: FeeItemRequest) => body<FeeItem>(await api.post(`/fee-structures/${structureId}/items`, data));
export const updateFeeItem = async (structureId: string, itemId: string, data: FeeItemRequest) => body<FeeItem>(await api.put(`/fee-structures/${structureId}/items/${itemId}`, data));
export const deleteFeeItem = async (structureId: string, itemId: string) => body<void>(await api.delete(`/fee-structures/${structureId}/items/${itemId}`));
export const getStudentFeeOptions = async (studentId: string, academicYearId: string, termId: string) => body<StudentFeeOption[]>(await api.get(`/students/${studentId}/fee-options`, { params: { academicYearId, termId } }));
export const updateStudentFeeOptions = async (studentId: string, data: StudentFeeOptionsRequest) => body<StudentFeeOption[]>(await api.put(`/students/${studentId}/fee-options`, data));
export const previewBills = async (termId: string, data: GenerateBillsRequest) => body<BillingPreview[]>(await api.post(`/billing/terms/${termId}/preview`, data));
export const generateBills = async (termId: string, data: GenerateBillsRequest) => body<GenerateBillsResult>(await api.post(`/billing/terms/${termId}/generate`, data));
export const recalculateTerm = async (termId: string) => body<GenerateBillsResult>(await api.post(`/billing/terms/${termId}/recalculate`));
export const getBillingDashboard = async (academicYearId?: string, termId?: string) => body<BillingDashboard>(await api.get('/billing/dashboard', { params: { academicYearId: academicYearId || undefined, termId: termId || undefined } }));
export const getStudentStatement = async (studentId: string, academicYearId?: string, termId?: string) => body<StudentStatement>(await api.get(`/billing/students/${studentId}/statement`, { params: { academicYearId, termId } }));
export const recalculateStudent = async (studentId: string) => body<StudentStatement>(await api.post(`/billing/students/${studentId}/recalculate`));
export const recordManualPayment = async (data: ManualPaymentRequest) => body<StudentPayment>(await api.post('/payments/manual', data));
