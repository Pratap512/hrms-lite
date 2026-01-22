import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, CheckCircle, XCircle, Users } from 'lucide-react';

// SET THIS TO YOUR DEPLOYED BACKEND URL LATER
const API_BASE = "http://127.0.0.1:5000"; 

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form States
  const [newEmp, setNewEmp] = useState({ full_name: '', email: '', employee_id: '', department: '' });
  const [showForm, setShowForm] = useState(false);

  // Fetch Data
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees/`);
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data. Is the backend running?");
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // Handlers
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/employees/`, newEmp);
      setShowForm(false);
      setNewEmp({ full_name: '', email: '', employee_id: '', department: '' });
      fetchEmployees();
    } catch (err) {
      alert("Error creating employee. Check for duplicate ID/Email.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      fetchEmployees();
    } catch (err) { alert("Delete failed"); }
  };

  const handleAttendance = async (id, status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.post(`${API_BASE}/attendance/`, {
        employee_id: id,
        date: today,
        status: status
      });
      fetchEmployees(); // Refresh to update bonus counters
    } catch (err) { alert("Attendance failed"); }
  };

  if (loading) return <div className="p-10 text-center">Loading HRMS...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Users className="w-6 h-6"/> HRMS Lite
            </h1>
            <p className="text-gray-500 text-sm">Employee & Attendance Management</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus size={18}/> {showForm ? 'Close Form' : 'Add Employee'}
          </button>
        </header>

        {/* Add Employee Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Full Name" className="border p-2 rounded" value={newEmp.full_name} onChange={e => setNewEmp({...newEmp, full_name: e.target.value})} />
            <input required placeholder="Email" type="email" className="border p-2 rounded" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
            <input required placeholder="Employee ID (Unique)" className="border p-2 rounded" value={newEmp.employee_id} onChange={e => setNewEmp({...newEmp, employee_id: e.target.value})} />
            <input required placeholder="Department" className="border p-2 rounded" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} />
            <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Employee</button>
          </form>
        )}

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-center">Total Present (Bonus)</th>
                <th className="p-4 text-center">Mark Attendance (Today)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No employees found. Add one!</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{emp.full_name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div>{emp.department}</div>
                    <div>{emp.email}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                      {emp.total_present} Days
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleAttendance(emp.id, 'Present')} className="text-green-600 hover:bg-green-100 p-2 rounded"><CheckCircle/></button>
                    <button onClick={() => handleAttendance(emp.id, 'Absent')} className="text-red-600 hover:bg-red-100 p-2 rounded"><XCircle/></button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(emp.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
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