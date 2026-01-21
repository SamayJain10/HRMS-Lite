export interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id?: number;
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
  created_at?: string;
}