import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, CheckCircle, XCircle, Users, X, Calendar } from 'lucide-react';

// Production API Endpoint
// Use "http://127.0.0.1:5000" for LOCAL testing
const API_BASE = "https://hrms-backend-kgrz.onrender.com"; 

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null); // Stores the employee object for the popup
  
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
    } catch (err) { alert("Error: ID or Email might be duplicate."); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this employee?")) return;
    try { await axios.delete(`${API_BASE}/employees/${id}`); fetchEmployees(); } 
    catch (err) { alert("Delete failed."); }
  };

  const handleAttendance = async (id, status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.post(`${API_BASE}/attendance/`, { employee_id: id, date: today, status: status });
      fetchEmployees();
    } catch (err) { alert("Failed to mark attendance."); }
  };

  if (loading) return <div className="p-10 text-center">Loading HRMS...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800 relative">
      <div className={`max-w-5xl mx-auto ${selectedEmp ? 'blur-sm' : ''} transition-all`}>
        
        {/*Header*/}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Users className="w-6 h-6"/> HRMS Lite
            </h1>
            <p className="text-gray-500 text-sm">Employee & Attendance Management</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <UserPlus size={18}/> {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </header>

        {/*Form*/}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Full Name" className="border p-2 rounded" value={newEmp.full_name} onChange={e => setNewEmp({...newEmp, full_name: e.target.value})} />
            <input required placeholder="Email" type="email" className="border p-2 rounded" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
            <input required placeholder="Employee ID" className="border p-2 rounded" value={newEmp.employee_id} onChange={e => setNewEmp({...newEmp, employee_id: e.target.value})} />
            <input required placeholder="Department" className="border p-2 rounded" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} />
            <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Record</button>
          </form>
        )}

        {/*Main Table*/}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-600">Employee</th>
                <th className="p-4 text-gray-600">Contact</th>
                <th className="p-4 text-center text-gray-600">Total Present</th>
                <th className="p-4 text-center text-gray-600">Today's Action</th>
                <th className="p-4 text-right text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{emp.full_name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div>{emp.department}</div>
                    <div className="text-xs">{emp.email}</div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedEmp(emp)}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors"
                      title="View detailed history"
                    >
                      {emp.total_present} Days
                    </button>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleAttendance(emp.id, 'Present')} className="text-green-600 hover:bg-green-100 p-2 rounded-full"><CheckCircle size={20}/></button>
                    <button onClick={() => handleAttendance(emp.id, 'Absent')} className="text-red-600 hover:bg-red-100 p-2 rounded-full"><XCircle size={20}/></button>
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

      {/*History Popup*/}
      {selectedEmp && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setSelectedEmp(null)}></div>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10 relative animate-fade-in">
            <button onClick={() => setSelectedEmp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Calendar className="text-blue-600"/> Attendance History
            </h3>
            <p className="text-gray-500 text-sm mb-4">Records for <span className="font-semibold text-gray-800">{selectedEmp.full_name}</span></p>
            
            <div className="max-h-60 overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                  <tr><th className="p-3 text-left">Date</th><th className="p-3 text-right">Status</th></tr>
                </thead>
                <tbody>
                  {/* SAFETY FIX: The '|| []' prevents the white screen crash */}
                  {(selectedEmp.attendance_records || []).length === 0 ? (
                    <tr><td colSpan="2" className="p-4 text-center text-gray-400 italic">No attendance records found.</td></tr>
                  ) : (
                    (selectedEmp.attendance_records || [])
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-gray-600">{record.date}</td>
                        <td className={`p-3 text-right font-medium ${record.status === 'Present' ? 'text-green-600' : 'text-red-500'}`}>
                          {record.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
              <span>Total Present: <b>{selectedEmp.total_present}</b></span>
              <button onClick={() => setSelectedEmp(null)} className="text-blue-600 hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}