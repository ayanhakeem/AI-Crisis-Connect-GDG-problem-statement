import { useNavigate } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import { Flame, Stethoscope, Shield, HelpCircle, MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from '../utils/time';

const typeConfig = {
  fire: { icon: Flame, color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50' },
  medical: { icon: Stethoscope, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
  security: { icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800/50' },
  other: { icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700/50' },
};

const statusConfig = {
  active: 'bg-red-900/40 text-red-300 border border-red-800/50',
  responding: 'bg-blue-900/40 text-blue-300 border border-blue-800/50',
  resolved: 'bg-green-900/40 text-green-300 border border-green-800/50',
};

const EmergencyCard = ({ emergency }) => {
  const navigate = useNavigate();
  const { icon: Icon, color, bg } = typeConfig[emergency.type] || typeConfig.other;
  const isCritical = emergency.severity === 'critical' && emergency.status === 'active';

  return (
    <div
      onClick={() => navigate(`/emergency/${emergency._id}`)}
      className={`card cursor-pointer hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 ${isCritical ? 'critical-pulse border-red-800/60' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm truncate">{emergency.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SeverityBadge severity={emergency.severity} />
              <span className={`badge ${statusConfig[emergency.status]}`}>
                {emergency.status}
              </span>
            </div>
          </div>

          {emergency.description && (
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">{emergency.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {emergency.location?.area && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {emergency.location.area}
                {emergency.location.room && ` · Room ${emergency.location.room}`}
                {emergency.location.floor && ` · Floor ${emergency.location.floor}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(emergency.createdAt)}
            </span>
          </div>

          {/* Assigned staff avatars */}
          {emergency.assignedTo?.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <User className="w-3 h-3 text-slate-500" />
              <div className="flex -space-x-2">
                {emergency.assignedTo.slice(0, 4).map((staff) => (
                  <div
                    key={staff._id}
                    title={staff.name}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {staff.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-500">{emergency.assignedTo.length} assigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCard;
