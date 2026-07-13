// src/api/feeApi.ts
import axios from 'axios';
import { MasterFeeStructure, FeeStatement, GradeLevel } from '../types/feeTypes';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/fees',
  headers: { 'Content-Type': 'application/json' }
});

// SUBSECTION 1: STRUCTURE CONFIGURATION ENDPOINTS
export const getActiveFeeStructure = async (): Promise<MasterFeeStructure> => {
  const res = await api.get('/active-structure');
  return res.data.body;
};

export const saveFeeStructure = async (data: MasterFeeStructure): Promise<MasterFeeStructure> => {
  const res = await api.post('/structure/save', data);
  return res.data.body;
};

// SUBSECTION 2: TRANSACTION & BILLING ENDPOINTS
export const getAllFeeStatements = async (search: string = ""): Promise<FeeStatement[]> => {
  const res = await api.get('/statements', { params: search ? { search } : {} });
  return res.data.body;
};

export const executeGlobalTermBilling = async (academicYear: number, termName: string): Promise<string> => {
  // Triggers backend pipeline sequence: carries forward balances and bills based on class levels
  const res = await api.post('/billing/run-global', { academicYear, termName });
  return res.data.header.message;
};

export const recordStudentPayment = async (studentId: string, amount: number, method: string, reference: string): Promise<void> => {
  await api.post(`/statements/${studentId}/pay`, { amount, method, reference });
};