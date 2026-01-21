/// <reference types="vite/client" />
import { Employee, AttendanceRecord } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'Request failed');
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

export const api = {
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${API_URL}/employees`);
    return handleResponse<Employee[]>(response);
  },

  async createEmployee(employee: Omit<Employee, 'created_at'>): Promise<Employee> {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    return handleResponse<Employee>(response);
  },

  async deleteEmployee(employeeId: string): Promise<void> {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at'>): Promise<AttendanceRecord> {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return handleResponse<AttendanceRecord>(response);
  },

  async getEmployeeAttendance(employeeId: string): Promise<AttendanceRecord[]> {
    const response = await fetch(`${API_URL}/attendance/${employeeId}`);
    return handleResponse<AttendanceRecord[]>(response);
  },

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    const response = await fetch(`${API_URL}/attendance`);
    return handleResponse<AttendanceRecord[]>(response);
  },
};