import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SidebarProvider, useSidebar } from './context/SidebarContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import useIsMobile from './hooks/useIsMobile.js';
import Sidebar from './components/layout/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DirectoryPage from './pages/DirectoryPage.jsx';
import FolderPage from './pages/FolderPage.jsx';
import ActivityLogPage from './pages/ActivityLogPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import AccessRequestsPage from './pages/AccessRequestsPage.jsx';
import GuestPage from './pages/GuestPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import MyActivityPage from './pages/MyActivityPage.jsx';
import MyRequestsPage from './pages/MyRequestsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UserImportPage from './pages/UserImportPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#6B849A' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F8FA' }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            backgroundColor: 'rgba(11,24,44,0.55)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
      <Sidebar isMobile={isMobile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#6B849A' }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/directory" element={
        <ProtectedRoute>
          <AppLayout><DirectoryPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/directory/:folderId" element={
        <ProtectedRoute>
          <AppLayout><FolderPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/activity" element={
        <ProtectedRoute>
          <AppLayout><ActivityLogPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><UserManagementPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><AccessRequestsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-activity" element={
        <ProtectedRoute>
          <AppLayout><MyActivityPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/users/import" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><UserImportPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-requests" element={
        <ProtectedRoute>
          <AppLayout><MyRequestsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/guest/:token" element={<GuestPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
