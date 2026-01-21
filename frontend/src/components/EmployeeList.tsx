import { useState, useEffect } from 'react';
import { api } from '../api';
import { Employee } from '../types';

interface EmployeeListProps {
  onDelete: () => void;
}

function EmployeeList({ onDelete }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    setDeletingId(employeeId);
    try {
      await api.deleteEmployee(employeeId);
      onDelete();
      await loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 p-6">
        <div className="flex items-center justify-center h-40 text-gray-300">
          Loading employees...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-red-500/30 p-6">
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 p-6">
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <p className="text-lg">No employees found</p>
          <p className="text-sm mt-1">Add your first employee to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-teal-500/20 overflow-hidden">

      <div className="px-6 py-4 border-b border-teal-500/20">
        <h2 className="text-xl font-semibold text-white">
          All Employees ({employees.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/60">
            <tr>
              {["Employee ID", "Full Name", "Email", "Department", "Actions"].map((head) => (
                <th
                  key={head}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-teal-500/10">
            {employees.map((employee) => (
              <tr
                key={employee.employee_id}
                className="hover:bg-teal-500/5 transition"
              >
                <td className="px-6 py-4 text-sm text-white font-medium">
                  {employee.employee_id}
                </td>

                <td className="px-6 py-4 text-sm text-gray-200">
                  {employee.full_name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-400">
                  {employee.email}
                </td>

                <td className="px-6 py-4 text-sm text-gray-400">
                  {employee.department}
                </td>

                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(employee.employee_id)}
                    disabled={deletingId === employee.employee_id}
                    className="px-4 py-1 rounded-md text-xs font-medium 
                      bg-red-500/10 text-red-400 border border-red-500/30
                      hover:bg-red-500/20 transition
                      disabled:opacity-50">
                    {deletingId === employee.employee_id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;