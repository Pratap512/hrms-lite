import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, CheckCircle, XCircle, Users } from 'lucide-react';

// Environment configuration
const API_BASE = "https://hrms-backend-kgrz.onrender.com"; 

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newEmp, setNewEmp] = useState({ full_name: '', email: '', employee_id: '', department: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees/`);
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/employees/`, newEmp);
      setShowForm(false);
      setNewEmp({ full_name: '', email: '', employee_id: '', department: '' });
      fetchEmployees();
    } catch (err) {
      alert("Failed to create employee. Please ensure ID and Email are unique.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      fetchEmployees();
    } catch (err) { alert("Delete operation failed."); }
  };

  const handleAttendance = async (id, status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.post(`${API_BASE}/attendance/`, {
        employee_id: id,
        date: today,
        status: status
      });
      fetchEmployees();
    } catch (err) { alert("Could not update attendance."); }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Initializing system...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Users className="w-6 h-6"/> HRMS Lite
            </h1>
            <p className="text-gray-500 text-sm">Employee & Attendance Management</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <UserPlus size={18}/> {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <input required placeholder="Full Name" className="border p-2 rounded focus:ring-2 ring-blue-100 outline-none" value={newEmp.full_name} onChange={e => setNewEmp({...newEmp, full_name: e.target.value})} />
            <input required placeholder="Email" type="email" className="border p-2 rounded focus:ring-2 ring-blue-100 outline-none" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
            <input required placeholder="Employee ID" className="border p-2 rounded focus:ring-2 ring-blue-100 outline-none" value={newEmp.employee_id} onChange={e => setNewEmp({...newEmp, employee_id: e.target.value})} />
            <input required placeholder="Department" className="border p-2 rounded focus:ring-2 ring-blue-100 outline-none" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} />
            <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">Save Record</button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Employee</th>
                <th className="p-4 font-semibold text-gray-600">Contact</th>
                <th className="p-4 text-center font-semibold text-gray-600">Total Present</th>
                <th className="p-4 text-center font-semibold text-gray-600">Today's Status</th>
                <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No records found.</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{emp.full_name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div className="font-medium text-gray-700">{emp.department}</div>
                    <div>{emp.email}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                      {emp.total_present} Days
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleAttendance(emp.id, 'Present')} className="text-green-600 hover:bg-green-100 p-2 rounded-full transition-colors" title="Mark Present"><CheckCircle size={20}/></button>
                    <button onClick={() => handleAttendance(emp.id, 'Absent')} className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors" title="Mark Absent"><XCircle size={20}/></button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(emp.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}