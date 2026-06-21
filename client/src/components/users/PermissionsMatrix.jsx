import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';

const CATEGORIES = [
  {
    key: 'documents',
    label: 'Documents',
    permissions: [
      { key: 'view_documents', label: 'View documents' },
      { key: 'download_documents', label: 'Download documents' },
      { key: 'upload_documents', label: 'Upload documents' },
      { key: 'delete_documents', label: 'Delete documents' },
    ],
  },
  {
    key: 'folders',
    label: 'Folders',
    permissions: [
      { key: 'access_sops', label: 'Access SOPs folder' },
      { key: 'access_manuals', label: 'Access Manuals folder' },
      { key: 'access_partner_docs', label: 'Access Partner Documents folder' },
      { key: 'access_onboarding', label: 'Access Onboarding Materials folder' },
      { key: 'access_internal_admin', label: 'Access Internal Admin Files folder' },
    ],
  },
  {
    key: 'activity',
    label: 'Activity & Logs',
    permissions: [
      { key: 'view_own_activity', label: 'View own activity log' },
      { key: 'view_all_activity', label: "View all users' activity log" },
      { key: 'export_activity', label: 'Export activity log (CSV)' },
    ],
  },
  {
    key: 'user_management',
    label: 'User Management',
    permissions: [
      { key: 'view_user_list', label: 'View user list' },
      { key: 'add_users', label: 'Add users' },
      { key: 'edit_user_roles', label: 'Edit user roles' },
      { key: 'deactivate_users', label: 'Deactivate users' },
      { key: 'remove_users', label: 'Remove users' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    permissions: [
      { key: 'view_settings', label: 'View portal settings' },
      { key: 'edit_settings', label: 'Edit portal settings' },
    ],
  },
];

const DEFAULT_PERMISSIONS = {
  admin: {
    view_documents: true, download_documents: true, upload_documents: true, delete_documents: true,
    access_sops: true, access_manuals: true, access_partner_docs: true, access_onboarding: true, access_internal_admin: true,
    view_own_activity: true, view_all_activity: true, export_activity: true,
    view_user_list: true, add_users: true, edit_user_roles: true, deactivate_users: true, remove_users: true,
    view_settings: true, edit_settings: true,
  },
  member: {
    view_documents: true, download_documents: true, upload_documents: false, delete_documents: false,
    access_sops: true, access_manuals: true, access_partner_docs: true, access_onboarding: true, access_internal_admin: false,
    view_own_activity: true, view_all_activity: false, export_activity: false,
    view_user_list: false, add_users: false, edit_user_roles: false, deactivate_users: false, remove_users: false,
    view_settings: false, edit_settings: false,
  },
  viewer: {
    view_documents: true, download_documents: true, upload_documents: false, delete_documents: false,
    access_sops: true, access_manuals: false, access_partner_docs: false, access_onboarding: true, access_internal_admin: false,
    view_own_activity: true, view_all_activity: false, export_activity: false,
    view_user_list: false, add_users: false, edit_user_roles: false, deactivate_users: false, remove_users: false,
    view_settings: false, edit_settings: false,
  },
};

const ROLES = [
  { key: 'admin', label: 'Admin' },
  { key: 'member', label: 'Member' },
  { key: 'viewer', label: 'Viewer' },
];

function Checkbox({ checked, disabled, onChange }) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    width: '18px', height: '18px', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.1s, opacity 0.1s',
    boxSizing: 'border-box',
  };

  if (checked) {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: '#306196',
          opacity: disabled ? 0.45 : hovered && !disabled ? 0.85 : 1,
        }}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !disabled && onChange(!checked)}
      >
        <Check size={11} color="#FFFFFF" strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        backgroundColor: 'transparent',
        border: `1.5px solid ${hovered && !disabled ? '#306196' : '#9CA3AF'}`,
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !disabled && onChange(!checked)}
    />
  );
}

export default function PermissionsMatrix({ userRole }) {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [collapsed, setCollapsed] = useState({});
  const [toast, setToast] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);

  const toggleCategory = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePermission = (role, permKey) => {
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [permKey]: !prev[role][permKey] },
    }));
    setToast({ message: 'Permissions updated', type: 'success' });
  };

  const thCell = {
    padding: '0 18px', fontSize: '13px', fontWeight: '700',
    color: '#112235', textAlign: 'center', height: '44px',
    borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
    whiteSpace: 'nowrap',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#112235', marginBottom: '4px' }}>
          Roles & Permissions
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          Manage roles and permissions for the portal
        </div>
      </div>

      {/* Table container */}
      <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <colgroup>
            <col style={{ minWidth: '340px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '140px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...thCell, textAlign: 'left' }}>Permission</th>
              {ROLES.map(r => (
                <th key={r.key} style={thCell}>{r.label}</th>
              ))}
              <th style={{ ...thCell, textAlign: 'right', paddingRight: '18px' }}>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowAddRole(true)}
                    style={{
                      backgroundColor: '#306196', color: '#FFFFFF', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '13px',
                      fontWeight: '700', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#245480'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#306196'}
                  >
                    + Add Role
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => (
              <>
                {/* Category row */}
                <tr key={cat.key} onClick={() => toggleCategory(cat.key)} style={{ cursor: 'pointer' }}>
                  <td
                    colSpan={5}
                    style={{
                      padding: '10px 18px', backgroundColor: '#FAFAFA',
                      borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ChevronDown
                        size={12}
                        color="#6B7280"
                        style={{
                          transform: collapsed[cat.key] ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 150ms ease',
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#112235' }}>
                        {cat.label}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Permission rows */}
                {!collapsed[cat.key] && cat.permissions.map(perm => (
                  <tr key={perm.key}>
                    <td style={{
                      padding: '0 18px 0 36px', height: '44px', fontSize: '13px',
                      color: '#374151', borderBottom: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                    }}>
                      <PermLabel label={perm.label} />
                    </td>
                    {ROLES.map(role => (
                      <td key={role.key} style={{
                        height: '44px', textAlign: 'center', borderBottom: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Checkbox
                            checked={permissions[role.key][perm.key]}
                            disabled={role.key === 'admin'}
                            onChange={() => togglePermission(role.key, perm.key)}
                          />
                        </div>
                      </td>
                    ))}
                    <td style={{ height: '44px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }} />
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Role Modal */}
      {showAddRole && (
        <Modal
          title="Add Role"
          onClose={() => setShowAddRole(false)}
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddRole(false)}
                style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#FFFFFF', fontSize: '13px', cursor: 'pointer', color: '#374151', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddRole(false);
                  setToast({ message: 'Custom roles will be available in a future update', type: 'success' });
                }}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#306196', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
              >
                Create Role
              </button>
            </div>
          }
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Role name
            </label>
            <input
              type="text"
              placeholder="e.g. Manager"
              style={{
                width: '100%', padding: '8px 12px', border: '1.5px solid #D1D5DB',
                borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#306196'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function PermLabel({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      style={{
        textDecoration: hovered ? 'underline dotted #9CA3AF' : 'none',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </span>
  );
}
