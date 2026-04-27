import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import AIChatDrawer from './components/AIChatDrawer';
import useEmergencyAlert from './hooks/useEmergencyAlert';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportEmergency from './pages/ReportEmergency';
import EmergencyDetail from './pages/EmergencyDetail';
import Analytics from './pages/Analytics';
import ManageStaff from './pages/ManageStaff';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  useEmergencyAlert(); // Global audio listener
  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
      <AIChatDrawer />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e2332',
                color: '#f1f5f9',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#4ade80', secondary: '#1e2332' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#1e2332' },
              },
              duration: 4000,
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected authenticated routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportEmergency />} />
              <Route path="/emergency/:id" element={<EmergencyDetail />} />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute adminOnly>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageStaff />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
