import os
from datetime import date
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship

# --- 1. DATABASE SETUP ---
# REPLACE THE STRING BELOW with your actual Supabase URL
# DATABASE_URL = "postgresql://postgres:ba9vK&SMpNK9t8?@db.dhxwmgecoypqylbnwmjm.supabase.co:5432/postgres" 
DATABASE_URL = "sqlite:///./test.db"

# Fail-safe for local testing if you forget to set the URL (uses a local file)
# if "YOUR_SUPABASE_URL" in DATABASE_URL:
#     print("WARNING: Using local SQLite DB. Update DATABASE_URL for production!")
#     DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. MODELS ---
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    
    # Relationship for bonus feature
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False) # 'Present' or 'Absent'

    employee = relationship("Employee", back_populates="attendance_records")
    
    # Constraint: One attendance record per employee per day
    __table_args__ = (UniqueConstraint('employee_id', 'date', name='_employee_date_uc'),)

# Create Tables
Base.metadata.create_all(bind=engine)

# --- 3. PYDANTIC SCHEMAS (Validation) ---
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class AttendanceCreate(BaseModel):
    employee_id: int # The internal DB ID, not the string ID
    date: date
    status: Literal['Present', 'Absent']

class EmployeeResponse(EmployeeCreate):
    id: int
    total_present: int = 0 # BONUS FEATURE

    class Config:
        from_attributes = True

# --- 4. API & LOGIC ---
app = FastAPI(title="HRMS Lite API")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simplicity in assessment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/employees/", response_model=EmployeeResponse, status_code=201)
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(Employee).filter((Employee.email == emp.email) | (Employee.employee_id == emp.employee_id)).first()
    if db_emp:
        raise HTTPException(status_code=400, detail="Employee with this Email or ID already exists.")
    
    new_emp = Employee(**emp.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

@app.get("/employees/", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    # BONUS LOGIC: Fetch employees + count of 'Present' days
    results = db.query(
        Employee,
        func.count(Attendance.id).filter(Attendance.status == 'Present').label('present_count')
    ).outerjoin(Attendance).group_by(Employee.id).all()
    
    response = []
    for emp, count in results:
        emp_dict = emp.__dict__
        emp_dict['total_present'] = count if count else 0
        response.append(emp_dict)
    return response

@app.delete("/employees/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return None

@app.post("/attendance/", status_code=201)
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(Attendance).filter(
        Attendance.employee_id == att.employee_id, 
        Attendance.date == att.date
    ).first()
    
    if existing:
        existing.status = att.status # Update if exists
    else:
        new_att = Attendance(**att.dict())
        db.add(new_att)
    
    db.commit()
    return {"message": "Attendance marked"}