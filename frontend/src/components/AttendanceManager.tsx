import { useState, useEffect } from 'react';
import { api } from '../api';
import { Employee, AttendanceRecord } from '../types';

function AttendanceManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadAttendance(selectedEmployee);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    filterAttendanceByDate();
  }, [attendanceRecords, filterStartDate, filterEndDate]);

  const filterAttendanceByDate = () => {
    if (!filterStartDate && !filterEndDate) {
      setFilteredRecords(attendanceRecords);
      return;
    }

    const filtered = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;

      if (start && end) {
        return recordDate >= start && recordDate <= end;
      } else if (start) {
        return recordDate >= start;
      } else if (end) {
        return recordDate <= end;
      }
      return true;
    });

    setFilteredRecords(filtered);
  };

  const getTotalPresentDays = () => {
    return attendanceRecords.filter(record => record.status === 'Present').length;
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployee(data[0].employee_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    }
  };

  const loadAttendance = async (employeeId: string) => {
    try {
      const data = await api.getEmployeeAttendance(employeeId);
      setAttendanceRecords(data);
      setFilteredRecords(data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setError('');
    setLoading(true);

    try {
      await api.markAttendance({
        employee_id: selectedEmployee,
        date,
        status,
      });
      await loadAttendance(selectedEmployee);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 p-6">
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No employees available</p>
          <p className="text-sm mt-1">Add employees first to mark attendance</p>
        </div>
      </div>
    );
  }

  const selectedEmployeeData = employees.find(e => e.employee_id === selectedEmployee);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Mark Attendance</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-300 mb-1">
                Select Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-teal-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_id} - {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 bg-slate-900/50 border border-teal-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Present' | 'Absent')}
                className="w-full px-3 py-2 bg-slate-900/50 border border-teal-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30"
          >
            {loading ? 'Marking...' : 'Mark Attendance'}
          </button>
        </form>
      </div>

      {selectedEmployeeData && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-teal-500/20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Attendance History - {selectedEmployeeData.full_name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Total Present Days: <span className="font-semibold text-teal-400">{getTotalPresentDays()}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="filterStartDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="px-3 py-2 bg-slate-900/50 border border-teal-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="filterEndDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="px-3 py-2 bg-slate-900/50 border border-teal-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {(filterStartDate || filterEndDate) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-slate-700/50 text-gray-300 rounded-md hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <div className="text-sm text-gray-400">
                Showing {filteredRecords.length} of {attendanceRecords.length} records
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p>{attendanceRecords.length === 0 ? 'No attendance records found' : 'No records match your filter'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-teal-500/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {filteredRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'Present'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendanceManager;