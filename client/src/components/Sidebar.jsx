import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import OnlineIndicator from './OnlineIndicator';
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Users,
  LogOut,
  Zap,
  ShieldAlert,
  Radio,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/report', icon: AlertTriangle, label: 'Report Emergency' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/staff', icon: Users, label: 'Manage Staff' },
  ];

  const staffLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/report', icon: AlertTriangle, label: 'Report Emergency' },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-600 rounded-lg rotate-6 opacity-20" />
            <div className="absolute inset-0 bg-primary-700 rounded-lg leading-none flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">CrisisConnect</h1>
            <p className="text-primary-400 text-xs font-semibold tracking-wider">PROTOCOL SYSTEM</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs capitalize">{user?.role} · {user?.department}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest px-2 mb-3">Navigation</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Connection status */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs text-slate-400">
              {isConnected ? 'Live Connected' : 'Disconnected'}
            </span>
          </div>
          <OnlineIndicator count={onlineUsers.length} />
        </div>

        {/* Online staff list preview */}
        {onlineUsers.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-2 font-medium">Online Staff</p>
            <div className="space-y-1.5">
              {onlineUsers.slice(0, 4).map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{u.name}</span>
                  <span className="text-xs text-slate-500 ml-auto flex-shrink-0">{u.department}</span>
                </div>
              ))}
              {onlineUsers.length > 4 && (
                <p className="text-xs text-slate-500">+{onlineUsers.length - 4} more</p>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
