import { DoorOpen, ArrowRight, TriangleAlert } from 'lucide-react';

const exits = [
  { id: 'stairwell-a', label: 'Stairwell A', position: 'top-4 left-1/4', direction: '↑ North Exit' },
  { id: 'stairwell-b', label: 'Stairwell B', position: 'top-4 right-1/4', direction: '↑ North Exit' },
  { id: 'elevator-lobby', label: 'Main Elevator', position: 'top-1/2 left-4', direction: '← West Exit (DO NOT USE IN FIRE)' },
  { id: 'fire-exit-east', label: 'Fire Exit', position: 'top-1/2 right-4', direction: '→ East Exit' },
  { id: 'basement-exit', label: 'Emergency Exit', position: 'bottom-4 left-1/2', direction: '↓ South Exit' },
];

const EvacuationMap = ({ emergencyType }) => {
  const isFire = emergencyType === 'fire';

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-900/40 border border-orange-800/50 rounded-xl flex items-center justify-center">
          <DoorOpen className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Evacuation Map</h3>
          <p className="text-slate-400 text-xs">Floor plan — nearest exits highlighted</p>
        </div>
      </div>

      {isFire && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-3 mb-4">
          <TriangleAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-xs font-medium">
            FIRE ALERT: Do NOT use elevators. Use stairwells only. Proceed to nearest exit immediately.
          </p>
        </div>
      )}

      {/* Floor map SVG */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden" style={{ height: '240px' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 240" className="absolute inset-0">
          {/* Floor outline */}
          <rect x="20" y="20" width="360" height="200" rx="8" fill="none" stroke="#334155" strokeWidth="2" />

          {/* Rooms */}
          <rect x="40" y="40" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="80" y="74" textAnchor="middle" fill="#64748b" fontSize="9">Room 101</text>
          <rect x="140" y="40" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="180" y="74" textAnchor="middle" fill="#64748b" fontSize="9">Room 102</text>
          <rect x="240" y="40" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="280" y="74" textAnchor="middle" fill="#64748b" fontSize="9">Room 103</text>

          <rect x="40" y="140" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="80" y="174" textAnchor="middle" fill="#64748b" fontSize="9">Room 104</text>
          <rect x="140" y="140" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="180" y="174" textAnchor="middle" fill="#64748b" fontSize="9">Lounge</text>
          <rect x="240" y="140" width="80" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="280" y="174" textAnchor="middle" fill="#64748b" fontSize="9">Kitchen</text>

          {/* Corridor */}
          <rect x="40" y="110" width="280" height="20" rx="0" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="180" y="122" textAnchor="middle" fill="#475569" fontSize="8">CORRIDOR</text>

          {/* Exit arrows */}
          {/* North Stairwell A */}
          <g>
            <circle cx="60" cy="20" r="10" fill="#16a34a" opacity="0.9" />
            <text x="60" y="24" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">↑</text>
            <text x="60" y="14" textAnchor="middle" fill="#4ade80" fontSize="7">Exit A</text>
          </g>
          {/* North Stairwell B */}
          <g>
            <circle cx="340" cy="20" r="10" fill="#16a34a" opacity="0.9" />
            <text x="340" y="24" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">↑</text>
            <text x="340" y="14" textAnchor="middle" fill="#4ade80" fontSize="7">Exit B</text>
          </g>
          {/* Fire Exit East */}
          <g>
            <circle cx="390" cy="120" r="10" fill="#16a34a" opacity="0.9" />
            <text x="390" y="124" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">→</text>
            <text x="380" y="138" textAnchor="middle" fill="#4ade80" fontSize="7">Fire Exit</text>
          </g>
          {/* Elevator (disabled for fire) */}
          <g>
            <circle cx="10" cy="120" r="10" fill={isFire ? '#7f1d1d' : '#1e40af'} opacity="0.9" />
            <text x="10" y="124" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{isFire ? '✗' : '↔'}</text>
            <text x="10" y="138" textAnchor="middle" fill={isFire ? '#fca5a5' : '#93c5fd'} fontSize="6">{isFire ? 'N/A' : 'Elev.'}</text>
          </g>
          {/* South Exit */}
          <g>
            <circle cx="200" cy="230" r="10" fill="#16a34a" opacity="0.9" />
            <text x="200" y="234" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">↓</text>
            <text x="200" y="222" textAnchor="middle" fill="#4ade80" fontSize="7">South Exit</text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-600" />
          <span className="text-slate-400">Emergency Exit</span>
        </div>
        {isFire && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-900" />
            <span className="text-slate-400">Elevator (Disabled)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvacuationMap;
