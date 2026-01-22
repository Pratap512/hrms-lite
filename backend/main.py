import os
from datetime import date
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship

# --- DATABASE SETUP ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS ---
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False) 

    employee = relationship("Employee", back_populates="attendance_records")
    __table_args__ = (UniqueConstraint('employee_id', 'date', name='_employee_date_uc'),)

Base.metadata.create_all(bind=engine)

# --- SCHEMAS ---
class AttendanceOut(BaseModel):
    date: date
    status: Literal['Present', 'Absent']
    
    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: Literal['Present', 'Absent']

class EmployeeResponse(EmployeeCreate):
    id: int
    attendance_records: List[AttendanceOut] = [] # The List
    total_present: int = 0                       # The Count

    class Config:
        from_attributes = True

# --- API ---
app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        raise HTTPException(status_code=400, detail="Employee exists.")
    new_emp = Employee(**emp.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

@app.get("/employees/", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    # Python logic to calculate count instantly
    for emp in employees:
        emp.total_present = sum(1 for a in emp.attendance_records if a.status == 'Present')
    return employees

@app.delete("/employees/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(emp)
    db.commit()
    return None

@app.post("/attendance/", status_code=201)
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    existing = db.query(Attendance).filter(Attendance.employee_id == att.employee_id, Attendance.date == att.date).first()
    if existing:
        existing.status = att.status
    else:
        new_att = Attendance(**att.dict())
        db.add(new_att)
    db.commit()
    return {"message": "Attendance updated"}