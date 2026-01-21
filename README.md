# HRMS Lite

A simple HR management system for handling employee records and attendance tracking.

## What it does

This application lets you manage employee information and track their daily attendance. You can add new employees, view their details, mark them present or absent, and see attendance history with filtering options.

## Tech Stack

**Frontend**
- React with TypeScript
- Tailwind CSS
- Vite

**Backend**
- FastAPI (Python)
- Supabase (PostgreSQL)

**Deployment**
- Frontend on Vercel
- Backend on Render

## Features

### Employee Management
- Add employees with ID, name, email, and department
- View all employees in a table
- Delete employees (removes their attendance too)
- Validates email format and prevents duplicate IDs

### Attendance Tracking
- Mark daily attendance as Present or Absent
- View attendance history for each employee
- Filter records by date range
- See total present days count
- Update existing attendance by marking the same date again

## Getting Started

### Database Setup

Create a Supabase account and run this SQL:

```sql
CREATE TABLE employees (
  employee_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
```

Save your Supabase URL and anon key from the API settings.

### Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

Start server:
```bash
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

Start dev server:
```bash
npm run dev
```

Open http://localhost:5173

## Deployment

**Backend (Render):**
- Connect your GitHub repo
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add environment variables for Supabase

**Frontend (Vercel):**
- Import your GitHub repo
- Set framework preset to Vite
- Add `VITE_API_URL` environment variable with your Render backend URL

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
│   └── vite.config.ts
│
└── README.md
```

## API Endpoints

```
GET    /employees              - List all employees
POST   /employees              - Create employee
DELETE /employees/{id}         - Delete employee

POST   /attendance             - Mark attendance
GET    /attendance/{id}        - Get employee attendance
GET    /attendance             - Get all attendance
```

## Notes

- No authentication needed (single admin assumed)
- Deleting an employee removes their attendance records
- Can't mark attendance for future dates
- Marking the same date twice updates the existing record
- Employee IDs and emails must be unique