import { useState, useEffect } from 'react';
import api from '../utils/axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Flame, Stethoscope, Shield, HelpCircle, TrendingUp, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from '../utils/time';

const typeColors = {
  fire: '#ef4444',
  medical: '#3b82f6',
  security: '#eab308',
  other: '#6b7280',
};

const typeIcons = {
  fire: Flame,
  medical: Stethoscope,
  security: Shield,
  other: HelpCircle,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold text-sm">{p.value} incidents</p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/emergencies/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const byTypeFormatted = stats?.byType?.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
    type: item._id,
  })) || [];

  const last7DaysFormatted = stats?.last7Days?.map((item) => ({
    day: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    count: item.count,
  })) || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Emergency trends and incident intelligence</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-900/40 border border-red-800/50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.activeCount || 0}</p>
              <p className="text-slate-400 text-xs">Active Now</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-900/40 border border-green-800/50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.resolvedToday || 0}</p>
              <p className="text-slate-400 text-xs">Resolved Today</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-900/40 border border-blue-800/50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.avgResponseMinutes || 0}<span className="text-base text-slate-400 font-normal ml-1">min</span></p>
              <p className="text-slate-400 text-xs">Avg Response Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - By Type */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-white">Emergencies by Type</h2>
          </div>
          {byTypeFormatted.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byTypeFormatted} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {byTypeFormatted.map((entry) => (
                    <Cell key={entry.type} fill={typeColors[entry.type] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Type legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {byTypeFormatted.map(({ type, name, count }) => {
              const Icon = typeIcons[type] || HelpCircle;
              return (
                <div key={type} className="flex items-center gap-2 text-xs text-slate-400">
                  <Icon className="w-3.5 h-3.5" style={{ color: typeColors[type] }} />
                  <span>{name}: <span className="text-white font-medium">{count}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Line Chart - Last 7 Days */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-white">Daily Incidents (Last 7 Days)</h2>
          </div>
          {last7DaysFormatted.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last7DaysFormatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#b91c1c"
                  strokeWidth={2.5}
                  dot={{ fill: '#b91c1c', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Resolved Incidents Table */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <h2 className="font-semibold text-white">Recently Resolved Incidents</h2>
        </div>
        {!stats?.lastResolved?.length ? (
          <p className="text-slate-500 text-sm text-center py-8">No resolved incidents yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-slate-500 font-medium pb-3 pr-4">Incident</th>
                  <th className="text-left text-slate-500 font-medium pb-3 pr-4">Type</th>
                  <th className="text-left text-slate-500 font-medium pb-3 pr-4">Severity</th>
                  <th className="text-left text-slate-500 font-medium pb-3 pr-4">Reported By</th>
                  <th className="text-left text-slate-500 font-medium pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.lastResolved.map((e) => {
                  const Icon = typeIcons[e.type] || HelpCircle;
                  return (
                    <tr key={e._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-white font-medium truncate max-w-[200px]">{e.title}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Icon className="w-3.5 h-3.5" style={{ color: typeColors[e.type] }} />
                          <span className="capitalize">{e.type}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`badge text-xs ${
                          e.severity === 'critical' ? 'bg-red-900/50 text-red-300' :
                          e.severity === 'high' ? 'bg-orange-900/50 text-orange-300' :
                          e.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-green-900/50 text-green-300'
                        }`}>
                          {e.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{e.reportedBy?.name || 'Unknown'}</td>
                      <td className="py-3 text-slate-400">{formatDistanceToNow(e.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
