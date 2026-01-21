# HRMS Lite - Human Resource Management System

A lightweight web-based HR management system for managing employee records and tracking daily attendance.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite as build tool

### Backend
- FastAPI (Python)
- Pydantic for validation
- Supabase PostgreSQL for database

### Deployment
- Frontend: Vercel
- Backend: Render

## Features

### Employee Management
- Add new employees with unique ID, name, email, and department
- View all employees in a clean table
- Delete employees (cascades to attendance records)
- Email and duplicate ID validation

### Attendance Management
- Mark daily attendance (Present/Absent)
- View attendance history per employee
- Update existing attendance records
- Date validation (cannot mark future dates)

## Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run these commands:

```sql
-- Create employees table
CREATE TABLE employees (
  employee_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
```

4. Get your credentials:
   - Go to Project Settings > API
   - Copy the `URL` (SUPABASE_URL)
   - Copy the `anon public` key (SUPABASE_KEY)

## Local Development Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

5. Run the server:
```bash
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

4. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Deployment

### Backend Deployment (Render)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create account
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `hrms-lite-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `SUPABASE_URL`: your Supabase URL
   - `SUPABASE_KEY`: your Supabase anon key
7. Deploy

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import project
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
4. Add environment variable:
   - `VITE_API_URL`: your Render backend URL
5. Deploy

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py              
│   ├── requirements.txt     
│   └── .env                 
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddEmployee.tsx
│   │   │   ├── EmployeeList.tsx
│   │   │   └── AttendanceManager.tsx
│   │   ├── App.tsx
│   │   ├── api.ts          
│   │   ├── types.ts        
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env                
│
└── README.md
```

## API Endpoints

### Employees
- `POST /employees` - Create new employee
- `GET /employees` - Get all employees
- `DELETE /employees/{employee_id}` - Delete employee

### Attendance
- `POST /attendance` - Mark attendance (creates or updates)
- `GET /attendance/{employee_id}` - Get employee attendance history
- `GET /attendance` - Get all attendance records

## Assumptions & Limitations

- Single admin user (no authentication required)
- Cannot mark attendance for future dates
- Deleting an employee removes all their attendance records
- Attendance can be updated by marking the same date again
- Employee ID and email must be unique
- No payroll or leave management features

## Development Notes

- The application handles loading states, empty states, and errors gracefully
- All forms include proper validation
- The UI is responsive and works on mobile devices
- API responses include proper HTTP status codes
- Database uses cascading deletes for referential integrity