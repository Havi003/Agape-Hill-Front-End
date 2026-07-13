// src/api/eventsApi.ts
import axios from 'axios';
import { apiUrl } from '../config/api';

const api = axios.create({
  baseURL: apiUrl('/events'),
  headers: { 'Content-Type': 'application/json' }
});

export interface EventParticipant {
  studentId: string;
  fullName: string;
  admissionNumber: string;
  amountPaid: number;
}

export interface SchoolEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string;
  registrationFee: number;
  participantCount?: number;
  totalCollected?: number;
  participants?: EventParticipant[];
}

export const getAllEvents = async (): Promise<SchoolEvent[]> => {
  const res = await api.get('');
  return res.data.body;
};

export const createSchoolEvent = async (data: Partial<SchoolEvent>): Promise<SchoolEvent> => {
  const res = await api.post('/create', data);
  return res.data.body;
};

export const getEventLedger = async (eventId: string): Promise<EventParticipant[]> => {
  const res = await api.get(`/${eventId}/ledger`);
  return res.data.body;
};

export const logEventPayment = async (eventId: string, studentId: string, amountPaid: number): Promise<void> => {
  await api.post(`/${eventId}/payments`, { studentId, amountPaid });
};
