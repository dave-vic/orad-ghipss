import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import TwoFactorSetup from '../components/settings/TwoFactorSetup.jsx';
import Toast from '../components/ui/Toast.jsx';

function SettingRow({ label, description, value, last }) {
  return (
    <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: last ? 'none' : '1px solid #F3F4F6' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#112235' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{description}</div>}
      </div>
      {value && (
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#374151', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [toast, setToast] = useState(null);

  const refreshUser = () => {
    api.get('/auth/me').then(res => setCurrentUser(res.data)).catch(console.error);
  };

  useEffect(() => { refreshUser(); }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
      <TopBar title="Settings" icon={Settings} />
      <div style={{ padding: '28px 32px', flex: 1, maxWidth: '680px' }}>
        <div style={{ marginBottom: '8px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ACCOUNT</div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
          <SettingRow label="Full Name" value={currentUser?.name} />
          <SettingRow label="Email" value={currentUser?.email} />
          <SettingRow label="Username" value={`@${currentUser?.username}`} />
          <SettingRow label="Role" value={currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : ''} last />
        </div>

        <div style={{ marginBottom: '8px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECURITY</div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
          <TwoFactorSetup
            user={currentUser}
            onUpdated={() => { refreshUser(); setToast({ message: 'Security settings updated', type: 'success' }); }}
          />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
