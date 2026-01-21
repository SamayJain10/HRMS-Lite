from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

class Employee(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)

class AttendanceRecord(BaseModel):
    employee_id: str
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")

@app.get("/")
def root():
    return {"message": "HRMS Lite API"}

@app.post("/employees", status_code=201)
def create_employee(employee: Employee):
    try:
        existing = supabase.table("employees").select("*").eq("employee_id", employee.employee_id).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="Employee ID already exists")
        
        existing_email = supabase.table("employees").select("*").eq("email", employee.email).execute()
        if existing_email.data:
            raise HTTPException(status_code=409, detail="Email already exists")
        
        result = supabase.table("employees").insert(employee.dict()).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/employees")
def get_employees():
    try:
        result = supabase.table("employees").select("*").order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str):
    try:
        existing = supabase.table("employees").select("*").eq("employee_id", employee_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        supabase.table("attendance").delete().eq("employee_id", employee_id).execute()
        supabase.table("employees").delete().eq("employee_id", employee_id).execute()
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/attendance", status_code=201)
def mark_attendance(record: AttendanceRecord):
    try:
        employee = supabase.table("employees").select("*").eq("employee_id", record.employee_id).execute()
        if not employee.data:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        existing = supabase.table("attendance") \
            .select("*") \
            .eq("employee_id", record.employee_id) \
            .eq("date", str(record.date)) \
            .execute()
        
        payload = record.dict()
        payload["date"] = str(record.date)  
        
        if existing.data:
            result = supabase.table("attendance") \
                .update({"status": record.status}) \
                .eq("employee_id", record.employee_id) \
                .eq("date", str(record.date)) \
                .execute()
        else:
            result = supabase.table("attendance").insert(payload).execute()
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attendance/{employee_id}")
def get_employee_attendance(employee_id: str):
    try:
        employee = supabase.table("employees").select("*").eq("employee_id", employee_id).execute()
        if not employee.data:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        result = supabase.table("attendance").select("*").eq("employee_id", employee_id).order("date", desc=True).execute()
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attendance")
def get_all_attendance():
    try:
        result = supabase.table("attendance").select("*").order("date", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))