import { useState, useEffect } from 'react';
import EmployeeList from './components/EmployeeList';
import AddEmployee from './components/AddEmployee';
import AttendanceManager from './components/AttendanceManager';

type View = 'employees' | 'attendance';

function App() {
  const [currentView, setCurrentView] = useState<View>('employees');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-blue-900">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-teal-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  HRMS Lite
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('employees')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'employees'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setCurrentView('attendance')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'attendance'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Attendance
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'employees' ? (
          <div className="space-y-6">
            <AddEmployee onSuccess={handleRefresh} />
            <EmployeeList key={refreshKey} onDelete={handleRefresh} />
          </div>
        ) : (
          <AttendanceManager key={refreshKey} />
        )}
      </main>
    </div>
  );
}

export default App;