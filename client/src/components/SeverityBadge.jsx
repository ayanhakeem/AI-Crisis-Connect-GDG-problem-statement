const severityConfig = {
  critical: {
    label: 'CRITICAL',
    classes: 'bg-red-900/60 text-red-300 border border-red-700/50',
    dot: 'bg-red-400',
  },
  high: {
    label: 'HIGH',
    classes: 'bg-orange-900/60 text-orange-300 border border-orange-700/50',
    dot: 'bg-orange-400',
  },
  medium: {
    label: 'MEDIUM',
    classes: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
    dot: 'bg-yellow-400',
  },
  low: {
    label: 'LOW',
    classes: 'bg-green-900/60 text-green-300 border border-green-700/50',
    dot: 'bg-green-400',
  },
};

const SeverityBadge = ({ severity, showDot = true }) => {
  const config = severityConfig[severity] || severityConfig.medium;
  return (
    <span className={`badge ${config.classes}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default SeverityBadge;
