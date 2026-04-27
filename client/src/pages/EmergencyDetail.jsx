import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import SeverityBadge from '../components/SeverityBadge';
import EvacuationMap from '../components/EvacuationMap';
import useSocketEvent from '../hooks/useSocket';
import toast from 'react-hot-toast';
import { formatDistanceToNow, formatDateTime } from '../utils/time';
import {
  ArrowLeft, Flame, Stethoscope, Shield, HelpCircle,
  MapPin, Clock, User, CheckCircle2, AlertTriangle,
  ChevronDown, Loader2, Bot, Users, History, Activity,
  Trophy, TrendingUp, Award, Zap
} from 'lucide-react';

const typeConfig = {
  fire: { icon: Flame, color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50', label: 'Fire' },
  medical: { icon: Stethoscope, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50', label: 'Medical' },
  security: { icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800/50', label: 'Security' },
  other: { icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700/50', label: 'Other' },
};

const statusFlow = ['active', 'responding', 'resolved'];

const EmergencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);

  const fetchEmergency = useCallback(async () => {
    try {
      const { data } = await api.get(`/emergencies/${id}`);
      setEmergency(data);
      setSelectedStaff(data.assignedTo?.map((s) => s._id) || []);
    } catch {
      toast.error('Emergency not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmergency();
  }, [fetchEmergency]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/auth/staff').then(({ data }) => setStaffList(data));
    }
  }, [isAdmin]);

  // Real-time update for this specific emergency
  useSocketEvent('emergency:updated', useCallback((updated) => {
    if (updated._id === id) {
      setEmergency(updated);
      toast.success('Emergency updated in real-time');
    }
  }, [id]));

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/emergencies/${id}/status`, { status: newStatus });
      setEmergency(data);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignStaff = async () => {
    setAssigningStaff(true);
    try {
      const { data } = await api.patch(`/emergencies/${id}/assign`, { staffIds: selectedStaff });
      setEmergency(data);
      toast.success('Staff assignment updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setAssigningStaff(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!emergency) return null;

  const { icon: Icon, color, bg, label } = typeConfig[emergency.type] || typeConfig.other;
  const currentStatusIdx = statusFlow.indexOf(emergency.status);
  const nextStatus = statusFlow[currentStatusIdx + 1];
  const showEvacuation = emergency.type === 'fire' || emergency.severity === 'critical';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${bg}`}>
              <Icon className={`w-7 h-7 ${color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${bg}`}>{label}</span>
                <SeverityBadge severity={emergency.severity} />
              </div>
              <h1 className="text-2xl font-bold text-white">{emergency.title}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 flex-wrap">
                {emergency.location?.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {emergency.location.area}
                    {emergency.location.room && ` · Room ${emergency.location.room}`}
                    {emergency.location.floor && ` · Floor ${emergency.location.floor}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(emergency.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Reported by {emergency.reportedBy?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge + update button */}
          <div className="flex flex-col items-end gap-2">
            <div className={`badge text-sm px-3 py-1.5 ${
              emergency.status === 'active' ? 'bg-red-900/50 text-red-300 border border-red-800/50' :
              emergency.status === 'responding' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' :
              'bg-green-900/50 text-green-300 border border-green-800/50'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current mr-1" />
              {emergency.status.toUpperCase()}
            </div>
            {nextStatus && (
              <button
                id={`update-status-${nextStatus}`}
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updatingStatus}
                className="btn-secondary text-sm"
              >
                {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                Mark as {nextStatus}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Post-Mortem Scorecard (Shown when resolved) */}
      {emergency.status === 'resolved' && emergency.postMortemReport && (
        <div className="card border-[#F45B20]/30 bg-gradient-to-br from-[#F45B20]/10 to-transparent overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <Trophy className="w-32 h-32 text-[#F45B20]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#F45B20] rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">AI Management Scorecard</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-slate-400 text-xs">Performance Audit</p>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-[#F45B20] text-[10px] font-black uppercase tracking-widest bg-[#F45B20]/10 px-1.5 py-0.5 rounded border border-[#F45B20]/20">
                    {Math.round((new Date(emergency.updatedAt) - new Date(emergency.createdAt)) / 60000)} MIN RESOLUTION
                  </span>
                </div>
              </div>
              <div className="ml-auto flex flex-col items-center">
                <div className="text-4xl font-black text-[#F45B20] tracking-tighter leading-none mb-1">
                  {emergency.postMortemReport.grade}
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Efficiency Grade</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Response Speed</span>
                  <span className="text-white font-bold">{emergency.postMortemReport.efficiencyMetrics?.responseTime}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${emergency.postMortemReport.efficiencyMetrics?.responseTime}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Resolution Efficiency</span>
                  <span className="text-white font-bold">{emergency.postMortemReport.efficiencyMetrics?.resolutionTime}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F45B20] transition-all duration-1000" 
                    style={{ width: `${emergency.postMortemReport.efficiencyMetrics?.resolutionTime}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Staff Coordination</span>
                  <span className="text-white font-bold">{emergency.postMortemReport.efficiencyMetrics?.staffCoordinationScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${emergency.postMortemReport.efficiencyMetrics?.staffCoordinationScore}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/60 rounded-2xl p-6 border border-white/10 ring-1 ring-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5">
                 <Zap className="w-24 h-24 text-[#F45B20]" />
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-[#F45B20] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    AI Dispatch Analysis
                  </p>
                  <p className="text-slate-200 text-sm italic leading-relaxed font-medium">
                    "{emergency.postMortemReport.summary}"
                  </p>
                </div>

                {emergency.postMortemReport.improvements?.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Management Improvements</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {emergency.postMortemReport.improvements.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 group">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-all">
                             <Award className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                          <span className="text-slate-400 text-xs leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {emergency.description && (
        <div className="card">
          <p className="text-slate-300 text-sm leading-relaxed">{emergency.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Analysis Panel */}
        <div className="space-y-4">
          <div className="card border-primary-800/30 bg-primary-900/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-900/60 border border-primary-700/50 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Emergency Protocol Analysis</h2>
                <p className="text-primary-400 text-xs">Standard Response System</p>
              </div>
              <SeverityBadge severity={emergency.severity} />
            </div>

            {emergency.aiCategory && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Category</p>
                <p className="text-slate-200 text-sm">{emergency.aiCategory}</p>
              </div>
            )}

            {emergency.estimatedResponseTime && (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2.5 mb-4">
                <Clock className="w-4 h-4 text-primary-400" />
                <span className="text-slate-300 text-sm">Est. response time: </span>
                <span className="text-white font-semibold text-sm">{emergency.estimatedResponseTime}</span>
              </div>
            )}

            {/* Immediate Actions Checklist */}
            {emergency.immediateActions?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Required Response Steps
                </p>
                <div className="space-y-2">
                  {emergency.immediateActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-primary-700/40 border border-primary-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-300 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Departments */}
            {emergency.suggestedDepartments?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Suggested Departments</p>
                <div className="flex flex-wrap gap-2">
                  {emergency.suggestedDepartments.map((dept) => (
                    <span key={dept} className="badge bg-slate-700/60 text-slate-300 border border-slate-600/50">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {emergency.additionalRisks && (
              <div className="mt-4 flex items-start gap-2 bg-orange-900/20 border border-orange-800/30 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-300 text-xs font-semibold mb-0.5">Additional Risks</p>
                  <p className="text-slate-300 text-xs">{emergency.additionalRisks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Staff + Timeline */}
        <div className="space-y-4">
          {/* Assign Staff (admin only) */}
          {isAdmin && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-white text-sm">Assign Staff</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {staffList.filter((s) => s.isActive && s._id !== emergency.reportedBy?._id).map((staff) => (
                  <label
                    key={staff._id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(staff._id)}
                      onChange={(e) => {
                        setSelectedStaff((prev) =>
                          e.target.checked ? [...prev, staff._id] : prev.filter((id) => id !== staff._id)
                        );
                      }}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {staff.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{staff.name}</p>
                      <p className="text-slate-400 text-xs">{staff.department}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={handleAssignStaff}
                disabled={assigningStaff}
                className="btn-primary text-sm w-full justify-center"
              >
                {assigningStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Update Assignment
              </button>
            </div>
          )}

          {/* Assigned staff display */}
          {emergency.assignedTo?.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-white text-sm">Responding Staff</h3>
                <span className="badge bg-slate-700 text-slate-300">{emergency.assignedTo.length}</span>
              </div>
              <div className="space-y-2">
                {emergency.assignedTo.map((staff) => (
                  <div key={staff._id} className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white text-sm font-bold">
                      {staff.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{staff.name}</p>
                      <p className="text-slate-400 text-xs">{staff.department}</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" title="Active" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-white text-sm">Incident Timeline</h3>
            </div>
            <div className="space-y-0">
              {emergency.timeline?.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-700 border-2 border-primary-900 flex-shrink-0 mt-1" />
                    {i < emergency.timeline.length - 1 && (
                      <div className="w-px bg-slate-700 flex-1 my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-slate-200 text-sm">{entry.action}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {entry.by?.name && <span>by {entry.by.name}</span>}
                      <span>·</span>
                      <span>{formatDateTime(entry.at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evacuation Map */}
      {showEvacuation && <EvacuationMap emergencyType={emergency.type} />}
    </div>
  );
};

export default EmergencyDetail;
