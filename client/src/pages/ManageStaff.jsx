import { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, X, Loader2, AlertCircle, CheckCircle2,
  Shield, Eye, EyeOff, UserCheck, UserX
} from 'lucide-react';

const DEPARTMENTS = ['Security', 'Housekeeping', 'Front Desk', 'Maintenance', 'Management', 'Food & Beverage', 'Medical'];

const ManageStaff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: 'Front Desk',
  });

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/auth/staff');
      setStaff(data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', form);
      toast.success(`${form.name} added successfully!`);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'staff', department: 'Front Desk' });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (staffId, currentStatus, name) => {
    setToggling(staffId);
    try {
      await api.patch(`/auth/staff/${staffId}/toggle`);
      toast.success(`${name} ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchStaff();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling('');
    }
  };

  const activeStaff = staff.filter((s) => s.isActive);
  const inactiveStaff = staff.filter((s) => !s.isActive);

  const deptBadgeColors = {
    Security: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
    Medical: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
    Management: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
    'Front Desk': 'bg-green-900/40 text-green-300 border-green-700/50',
    Maintenance: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
    Housekeeping: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
    'Food & Beverage': 'bg-pink-900/40 text-pink-300 border-pink-700/50',
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Staff</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeStaff.length} active · {inactiveStaff.length} inactive · {staff.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
          id="add-staff-btn"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="card border-primary-800/30 animate-fade-in">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-400" />
            Register New Staff Account
          </h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="john@hotel.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="select-field"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="select-field"
              >
                <option value="staff">Staff (Responder)</option>
                <option value="admin">Admin (Manager)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              All Staff Members
            </h2>
          </div>
          <div className="divide-y divide-slate-800">
            {staff.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No staff registered yet</p>
            ) : (
              staff.map((member) => (
                <div key={member._id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors ${!member.isActive ? 'opacity-50' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    member.role === 'admin' 
                      ? 'bg-gradient-to-br from-primary-700 to-primary-900' 
                      : 'bg-gradient-to-br from-slate-600 to-slate-800'
                  }`}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{member.name}</p>
                      {member.role === 'admin' && (
                        <span className="badge bg-primary-900/50 text-primary-300 border border-primary-800/50">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                      {member._id === user?._id && (
                        <span className="badge bg-slate-700 text-slate-300 border border-slate-600/50 text-xs">You</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{member.email}</p>
                  </div>

                  {/* Department badge */}
                  <span className={`badge border hidden sm:inline-flex ${deptBadgeColors[member.department] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                    {member.department}
                  </span>

                  {/* Status + toggle */}
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {member._id !== user?._id && (
                      <button
                        onClick={() => handleToggle(member._id, member.isActive, member.name)}
                        disabled={toggling === member._id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                          member.isActive
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/50'
                            : 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-800/50'
                        }`}
                      >
                        {toggling === member._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : member.isActive ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
