import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import useEmergencies from '../hooks/useEmergencies';
import EmergencyCard from '../components/EmergencyCard';
import SeverityBadge from '../components/SeverityBadge';
import {
  AlertTriangle, CheckCircle2, Users, Clock, Plus,
  Filter, RefreshCw, Flame, Stethoscope, Shield, HelpCircle, Activity
} from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card hover:border-slate-600 transition-all duration-200">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <Activity className="w-4 h-4 text-slate-600" />
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { onlineUsers } = useSocket();
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { emergencies, loading, refetch } = useEmergencies(filters);

  const handleStatusFilter = (status) => {
    setActiveFilter(status);
    setFilters((prev) => ({ ...prev, status: status === 'all' ? undefined : status }));
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setFilters((prev) => ({ ...prev, type: type === 'all' ? undefined : type }));
  };

  const activeCount = emergencies.filter((e) => e.status === 'active').length;
  const respondingCount = emergencies.filter((e) => e.status === 'responding').length;
  const resolvedCount = emergencies.filter((e) => e.status === 'resolved').length;

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'responding', label: 'Responding' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const typeFilters = [
    { key: 'all', icon: Filter, label: 'All Types' },
    { key: 'fire', icon: Flame, label: 'Fire', color: 'text-red-400' },
    { key: 'medical', icon: Stethoscope, label: 'Medical', color: 'text-blue-400' },
    { key: 'security', icon: Shield, label: 'Security', color: 'text-yellow-400' },
    { key: 'other', icon: HelpCircle, label: 'Other', color: 'text-slate-400' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Emergency Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-white font-medium">{user?.name}</span> ·{' '}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/report" className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          Report Emergency
        </Link>
      </div>

      {/* Metric Cards */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={AlertTriangle}
            label="Active Emergencies"
            value={activeCount}
            sub="Requires immediate attention"
            color={activeCount > 0 ? 'bg-red-700' : 'bg-slate-700'}
          />
          <MetricCard
            icon={Activity}
            label="Responding"
            value={respondingCount}
            sub="Staff deployed"
            color="bg-blue-700"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Resolved Today"
            value={resolvedCount}
            sub="Incidents closed"
            color="bg-emerald-700"
          />
          <MetricCard
            icon={Users}
            label="Online Staff"
            value={onlineUsers.length}
            sub="Currently connected"
            color="bg-violet-700"
          />
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Status filters */}
        <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 gap-1">
          {statusFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStatusFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === key
                  ? 'bg-primary-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Type filters + refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 gap-1">
            {typeFilters.map(({ key, icon: Icon, label, color }) => (
              <button
                key={key}
                onClick={() => handleTypeFilter(key)}
                title={label}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  typeFilter === key
                    ? 'bg-slate-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${color || ''}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={refetch}
            className="btn-ghost px-3 py-2 border border-slate-700/50 bg-slate-800/60 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton h-28" />
          ))}
        </div>
      ) : emergencies.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">All Clear</h3>
          <p className="text-slate-400 text-sm">No emergencies match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map((emergency) => (
            <EmergencyCard key={emergency._id} emergency={emergency} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
