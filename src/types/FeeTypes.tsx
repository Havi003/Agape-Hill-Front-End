// src/types/FeeTypes.tsx

export type GradeLevel = 'ECD_NURSERY' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY';

export interface TermlyBreakdown {
  term: '1ST TERM' | '2ND TERM' | '3RD TERM';
  fees: number;
  lunch: number;
  porridge: number;
  exams: number;
  totals: number;
}

export interface AdditionalMandatoryFees {
  admissionFee: number;       // Payable once on admission (e.g., Kshs. 700)
  transportFee: number;       // Optional/Termly (e.g., Kshs. 8,000)
  maintenanceFee: number;     // Per term (e.g., Kshs. 200)
  toiletPaperContrib: number; // Termly contribution (e.g., Kshs. 100)
  computerClasses: number;    // Grade 1-6 only (e.g., Kshs. 400)
}

export interface UniformSpecifications {
  girls: string[];
  boys: string[];
  gamesKit: string[];
}

// Master structural definition for Option 1
export interface MasterFeeStructure {
  id?: string;
  academicYear: number; // e.g., 2026
  ecdNurseryBreakdown: TermlyBreakdown[];
  lowerPrimaryBreakdown: TermlyBreakdown[];
  upperPrimaryBreakdown: TermlyBreakdown[];
  additionalFees: AdditionalMandatoryFees;
  uniforms: UniformSpecifications;
  isActive: boolean;
}

// Transaction data models for Option 2
export interface FeeStatement {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  studentClass: string;
  currentTerm: string;
  totalBilled: number;  // Matches total_billed numeric(19,2) in DB
  totalPaid: number;    // Matches total_paid numeric(19,2) in DB
  balance: number;      // Matches balance numeric(19,2) in DB
  carryForwardAmount: number; // Overpayments (-) or outstanding debt (+) from prior terms
  paymentHistory: FeePaymentRecord[];
}

export interface FeePaymentRecord {
  id: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'MPESA' | 'BANK_DEPOSIT' | 'CASH';
  referenceNumber: string; // e.g. Mpesa Ref or Bank Slip Code
  receivedBy: string;
}