const OnlineIndicator = ({ count = 0, showCount = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
      </div>
      {showCount && (
        <span className="text-xs text-emerald-400 font-medium">{count} online</span>
      )}
    </div>
  );
};

export default OnlineIndicator;
