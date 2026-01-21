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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">HRMS Lite</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('employees')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'employees'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setCurrentView('attendance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'attendance'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
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