import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
  Flame, Stethoscope, Shield, HelpCircle,
  MapPin, FileText, Loader2, AlertTriangle, ChevronRight
} from 'lucide-react';

const emergencyTypes = [
  {
    type: 'fire',
    label: 'Fire',
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700/60',
    activeBg: 'bg-red-900/60',
    activeBorder: 'border-red-500',
    description: 'Fire, smoke, or explosion',
  },
  {
    type: 'medical',
    label: 'Medical',
    icon: Stethoscope,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/60',
    activeBg: 'bg-blue-900/60',
    activeBorder: 'border-blue-500',
    description: 'Injury, illness, cardiac',
  },
  {
    type: 'security',
    label: 'Security',
    icon: Shield,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-700/60',
    activeBg: 'bg-yellow-900/60',
    activeBorder: 'border-yellow-500',
    description: 'Threat, theft, violence',
  },
  {
    type: 'other',
    label: 'Other',
    icon: HelpCircle,
    color: 'text-slate-400',
    bg: 'bg-slate-800/50',
    border: 'border-slate-600/60',
    activeBg: 'bg-slate-700/60',
    activeBorder: 'border-slate-400',
    description: 'Flood, power, structural',
  },
];

const ReportEmergency = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    room: '',
    floor: '',
    area: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      setError('Please select an emergency type');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        type: selectedType,
        title: form.title,
        description: form.description,
        location: {
          room: form.room,
          floor: form.floor,
          area: form.area,
        },
      };

      const { data } = await api.post('/emergencies', payload);
      toast.success('Emergency reported! Response protocol generated.');
      navigate(`/emergency/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report emergency. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeConfig = emergencyTypes.find((t) => t.type === selectedType);

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <span
            onClick={() => navigate('/dashboard')}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Dashboard
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Report Emergency</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Report Emergency</h1>
        <p className="text-slate-400 text-sm mt-1">
          Fill in the details — the system will analyze and notify all staff instantly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emergency Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">
            Emergency Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {emergencyTypes.map(({ type, label, icon: Icon, color, bg, border, activeBg, activeBorder, description }) => {
              const isActive = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  id={`emergency-type-${type}`}
                  onClick={() => setSelectedType(type)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${
                    isActive
                      ? `${activeBg} ${activeBorder} shadow-lg`
                      : `${bg} ${border} hover:border-slate-500`
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                  <p className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-300'}`}>{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Emergency Title <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              id="emergency-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field pl-11"
              placeholder="e.g. Kitchen fire on floor 3, Guest collapsed in lobby..."
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            <MapPin className="w-4 h-4 inline mr-1 text-slate-400" />
            Location Details
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Room No.</label>
              <input
                type="text"
                id="room-number"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="input-field text-sm"
                placeholder="301"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Floor</label>
              <input
                type="text"
                id="floor-number"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="input-field text-sm"
                placeholder="3rd"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Area</label>
              <input
                type="text"
                id="area-name"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="input-field text-sm"
                placeholder="Kitchen"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Description <span className="text-slate-500 font-normal">(optional but helps AI)</span>
          </label>
          <textarea
            id="emergency-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field resize-none"
            rows={4}
            placeholder="Describe what you see — the system uses this to generate better response instructions..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-800/50 text-red-300 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* AI notice */}
        <div className="flex items-start gap-3 bg-primary-900/20 border border-primary-800/30 rounded-xl p-4">
          <div className="w-8 h-8 bg-primary-900/60 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-400 text-sm">✦</span>
          </div>
          <div>
            <p className="text-primary-300 text-sm font-medium">Smart Protocol Enabled</p>
            <p className="text-slate-400 text-xs mt-0.5">
              The system will instantly classify severity, generate step-by-step response instructions,
              and auto-assign nearby staff. All connected staff will be notified immediately.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="submit-emergency"
          disabled={loading || !selectedType || !form.title}
          className="btn-primary w-full justify-center py-4 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Protocol & Alerting Staff...
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              Report Emergency Now
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportEmergency;
