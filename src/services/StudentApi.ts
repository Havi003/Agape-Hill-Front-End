// src/api/studentApi.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/students',
    headers: { 'Content-Type': 'application/json' }
});

export const getDashboardStats = () => api.get('/dashboard-stats').then(res => res.data);
export const getStudents = (search: string = "") => api.get(`?search=${search}`).then(res => res.data);
export const registerStudent = (data: any) => api.post('', data).then(res => res.data);