import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import TopBar from '../components/layout/TopBar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import UserTable from '../components/users/UserTable.jsx';
import AddUserModal from '../components/users/AddUserModal.jsx';
import BulkImportModal from '../components/users/BulkImportModal.jsx';
import PermissionsMatrix from '../components/users/PermissionsMatrix.jsx';
import Toast from '../components/ui/Toast.jsx';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles & Permissions' },
];

export default function UserManagementPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const activeCount = users.filter(u => u.active).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="User Management" icon={Users} />
      <div style={{ padding: isMobile ? '16px' : '28px', flex: 1 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '28px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 0 10px',
                  fontSize: '14px',
                  fontWeight: active ? '600' : '400',
                  color: active ? '#112235' : '#6B7280',
                  borderBottom: active ? '2px solid #306196' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'color 0.1s',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'users' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading users...</div>
            ) : (
              <UserTable
                users={users}
                currentUser={user}
                onRefresh={loadUsers}
                onToast={setToast}
                onShowAdd={() => setShowAdd(true)}
                onShowImport={() => setShowImport(true)}
              />
            )}

            {showImport && (
              <BulkImportModal
                onClose={() => setShowImport(false)}
                onImported={(count) => { loadUsers(); setToast({ message: `✓ ${count} users imported successfully.`, type: 'success' }); }}
              />
            )}

            {showAdd && (
              <AddUserModal
                onClose={() => setShowAdd(false)}
                onCreated={() => { setShowAdd(false); loadUsers(); setToast({ message: 'User created successfully', type: 'success' }); }}
                onToast={setToast}
              />
            )}
          </>
        )}

        {tab === 'roles' && (
          <PermissionsMatrix userRole={user?.role} />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
