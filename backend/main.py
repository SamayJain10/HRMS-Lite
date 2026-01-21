from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from datetime import date
import os
import requests
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

if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")

BASE_URL = f"{supabase_url}/rest/v1"

HEADERS = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

class Employee(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)

class AttendanceRecord(BaseModel):
    employee_id: str
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")


def supabase_get(table: str, query: str = ""):
    try:
        resp = requests.get(f"{BASE_URL}/{table}{query}", headers=HEADERS, timeout=10)
        if resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=resp.text)
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


def supabase_post(table: str, payload: dict):
    try:
        resp = requests.post(f"{BASE_URL}/{table}", json=payload, headers=HEADERS, timeout=10)
        if resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=resp.text)
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


def supabase_patch(table: str, query: str, payload: dict):
    try:
        resp = requests.patch(f"{BASE_URL}/{table}?{query}", json=payload, headers=HEADERS, timeout=10)
        if resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=resp.text)
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


def supabase_delete(table: str, query: str):
    try:
        resp = requests.delete(f"{BASE_URL}/{table}?{query}", headers=HEADERS, timeout=10)
        if resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=resp.text)
        return True
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"message": "HRMS Lite API"}


@app.post("/employees", status_code=201)
def create_employee(employee: Employee):
    try:
        # Check employee_id
        existing = supabase_get("employees", f"?employee_id=eq.{employee.employee_id}")
        if existing:
            raise HTTPException(status_code=409, detail="Employee ID already exists")

        # Check email
        existing_email = supabase_get("employees", f"?email=eq.{employee.email}")
        if existing_email:
            raise HTTPException(status_code=409, detail="Email already exists")

        result = supabase_post("employees", employee.dict())
        return result[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/employees")
def get_employees():
    try:
        result = supabase_get("employees", "?order=created_at.desc")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str):
    try:
        existing = supabase_get("employees", f"?employee_id=eq.{employee_id}")
        if not existing:
            raise HTTPException(status_code=404, detail="Employee not found")

        supabase_delete("attendance", f"employee_id=eq.{employee_id}")
        supabase_delete("employees", f"employee_id=eq.{employee_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/attendance", status_code=201)
def mark_attendance(record: AttendanceRecord):
    try:
        employee = supabase_get("employees", f"?employee_id=eq.{record.employee_id}")
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        date_str = str(record.date)

        existing = supabase_get(
            "attendance",
            f"?employee_id=eq.{record.employee_id}&date=eq.{date_str}"
        )

        payload = record.dict()
        payload["date"] = date_str

        if existing:
            result = supabase_patch(
                "attendance",
                f"employee_id=eq.{record.employee_id}&date=eq.{date_str}",
                {"status": record.status},
            )
        else:
            result = supabase_post("attendance", payload)

        return result[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attendance/{employee_id}")
def get_employee_attendance(employee_id: str):
    try:
        employee = supabase_get("employees", f"?employee_id=eq.{employee_id}")
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        result = supabase_get(
            "attendance",
            f"?employee_id=eq.{employee_id}&order=date.desc"
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attendance")
def get_all_attendance():
    try:
        result = supabase_get("attendance", "?order=date.desc")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
