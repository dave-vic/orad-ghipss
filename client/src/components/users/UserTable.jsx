import { useState } from 'react';
import { KeyRound, UserCircle, ShieldCheck, UserX, UserCheck, Trash2, User, Tag, ToggleLeft, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios.js';
import RoleBadge from '../ui/RoleBadge.jsx';
import Modal from '../ui/Modal.jsx';
import {
  TableCheckbox, ToggleSwitch, KebabMenu, PaginationBar,
  SearchInput, SortBtn, InitialsAvatar, BulkBar, GhostBtn,
} from '../ui/TablePrimitives.jsx';

// ─── Shared modal styles ──────────────────────────────────────────────────────
const cancelBtn = { padding: '8px 16px', fontSize: '13px', fontWeight: '600', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#374151', cursor: 'pointer' };
const primaryBtn = { padding: '8px 18px', fontSize: '13px', fontWeight: '700', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const dangerBtn = { padding: '8px 18px', fontSize: '13px', fontWeight: '700', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' };

// ─── Modals (unchanged logic) ─────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onToast }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}/password`, { password });
      onToast({ message: `Password reset for ${user.name}`, type: 'success' });
      onClose();
    } catch (err) {
      onToast({ message: err.response?.data?.error || 'Reset failed', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Reset password" subtitle={`Set a new password for ${user.name}`} onClose={onClose}
      footer={<><button type="button" onClick={onClose} style={cancelBtn}>Cancel</button><button type="submit" form="reset-pw-form" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.4 : 1 }}>{loading ? 'Saving...' : 'Reset password'}</button></>}>
      <form id="reset-pw-form" onSubmit={handleSubmit}>
        <label style={labelStyle}>New Password</label>
        <input type="password" required minLength={8} autoFocus placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#306196'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
      </form>
    </Modal>
  );
}

function RemoveUserModal({ user, onClose, onRefresh, onToast }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const matched = confirm.trim().toLowerCase() === user.username.toLowerCase();

  const handleRemove = async () => {
    setLoading(true);
    try {
      await api.delete(`/users/${user.id}`);
      onRefresh();
      onToast({ message: 'User removed', type: 'success' });
      onClose();
    } catch { onToast({ message: 'Failed to remove user', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Remove user" subtitle="This action cannot be undone." onClose={onClose}
      footer={<><button onClick={onClose} style={cancelBtn}>Cancel</button><button onClick={handleRemove} disabled={!matched || loading} style={{ ...dangerBtn, opacity: (!matched || loading) ? 0.4 : 1 }}>{loading ? 'Removing...' : 'Remove'}</button></>}>
      <p style={{ fontSize: '13px', color: '#374151', marginTop: 0, marginBottom: '12px' }}>This will permanently remove <strong>{user.name}</strong> from the portal.</p>
      <div style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626', borderRadius: '6px', padding: '14px 16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626', marginBottom: '6px' }}>Removing this user will:</div>
        <div style={{ fontSize: '12px', color: '#DC2626', lineHeight: '1.6' }}>• All active sessions will be terminated<br />• Activity log entries will be retained</div>
      </div>
      <label style={{ ...labelStyle, marginBottom: '8px' }}>Type <code style={{ fontFamily: 'monospace', backgroundColor: '#F7F8FA', padding: '1px 5px', borderRadius: '3px' }}>{user.username}</code> to confirm</label>
      <input type="text" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={user.username} style={inputStyle}
        onFocus={e => { e.target.style.borderColor = '#306196'; e.target.style.boxShadow = '0 0 0 3px rgba(48,97,150,0.13)'; }}
        onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }} />
    </Modal>
  );
}

const ROLE_OPTIONS = [
  { id: 'admin', label: 'Admin', description: 'Full access to all folders, user management, and activity logs' },
  { id: 'member', label: 'Member', description: 'Access to SOPs, Manuals, Partner Documents, and Onboarding' },
  { id: 'viewer', label: 'Viewer', description: 'Access to SOPs and Onboarding Materials only' },
];

function ChangeRoleModal({ user, onClose, onRefresh, onToast }) {
  const [selected, setSelected] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const unchanged = selected === user.role;

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}/role`, { role: selected });
      onRefresh(); onToast({ message: 'Role updated', type: 'success' }); onClose();
    } catch { onToast({ message: 'Failed to update role', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Change role" subtitle={`Select a new access level for ${user.name}.`} onClose={onClose}
      footer={<><button onClick={onClose} style={cancelBtn}>Cancel</button><button onClick={handleSave} disabled={unchanged || loading} style={{ ...primaryBtn, opacity: (unchanged || loading) ? 0.4 : 1 }}>{loading ? 'Saving...' : 'Save changes'}</button></>}>
      <div>
        {ROLE_OPTIONS.map(role => {
          const isSel = selected === role.id;
          return (
            <div key={role.id} onClick={() => setSelected(role.id)}
              style={{ border: `1px solid ${isSel ? '#306196' : '#E5E7EB'}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px', cursor: 'pointer', backgroundColor: isSel ? '#F0F6FF' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#F7F8FA'; } }}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FFFFFF'; } }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#112235' }}>{role.label}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{role.description}</div>
              </div>
              {isSel && <CheckCircle2 size={16} color="#306196" style={{ marginLeft: '12px', flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function DeactivateUserModal({ user, onClose, onRefresh, onToast }) {
  const isActive = user.active;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}/status`, { active: !isActive });
      onRefresh(); onToast({ message: `User ${isActive ? 'deactivated' : 'reactivated'}`, type: 'success' }); onClose();
    } catch { onToast({ message: 'Failed to update status', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Modal
      title={isActive ? 'Deactivate account' : 'Reactivate account'}
      subtitle={`${user.name} · @${user.username}`}
      onClose={onClose}
      danger={isActive}
      footer={
        <>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleConfirm} disabled={loading} style={{ ...(isActive ? dangerBtn : primaryBtn), opacity: loading ? 0.4 : 1 }}>
            {loading ? (isActive ? 'Deactivating…' : 'Reactivating…') : (isActive ? 'Deactivate' : 'Reactivate')}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ backgroundColor: isActive ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${isActive ? '#FECACA' : '#BBF7D0'}`, borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: isActive ? '#DC2626' : '#059669', marginBottom: '4px' }}>
            {isActive ? 'This will block the user from signing in' : 'This will restore full access'}
          </div>
          <div style={{ fontSize: '12px', color: isActive ? '#B91C1C' : '#047857', lineHeight: 1.8 }}>
            {isActive ? (
              <><div>• All active sessions will be terminated immediately</div><div>• The user will not be able to log in</div><div>• All data and activity logs are preserved</div></>
            ) : (
              <><div>• The user can sign in again immediately</div><div>• All previous data and settings are restored</div></>
            )}
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          {isActive ? 'You can reactivate this account at any time from User Management.' : 'The user will regain access immediately after reactivation.'}
        </p>
      </div>
    </Modal>
  );
}

// ─── User Profile Modal ───────────────────────────────────────────────────────
function UserProfileModal({ user, onClose }) {
  const ROLE_META = {
    admin:  { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', avatarBg: '#DC2626', label: 'Admin'  },
    member: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', avatarBg: '#059669', label: 'Member' },
    viewer: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', avatarBg: '#D97706', label: 'Viewer' },
  };
  const role = ROLE_META[user.role] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', avatarBg: '#6B7280', label: user.role };
  const initials = (user.name || user.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <Modal title="User profile" onClose={onClose} width={400}
      footer={<button onClick={onClose} style={cancelBtn}>Close</button>}
    >
      {/* Hero card */}
      <div style={{ background: 'linear-gradient(135deg, #F5F8FF 0%, #EEF4FF 100%)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: role.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#112235', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.username}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px', backgroundColor: role.bg, color: role.color, border: `1px solid ${role.border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: user.active ? '#059669' : '#9CA3AF' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: user.active ? '#059669' : '#D1D5DB', display: 'inline-block' }} />
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#E5E7EB', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        {[
          ['Email',      user.email],
          ['Username',   user.username ? `@${user.username}` : null],
          ['Joined',     fmt(user.createdAt)],
          ['Last login', user.lastLoginAt ? fmt(user.lastLoginAt) : 'Never'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', backgroundColor: '#FFFFFF', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: '13px', color: '#112235', fontWeight: '500', textAlign: 'right', wordBreak: 'break-all' }}>{value || '—'}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Table header cell ─────────────────────────────────────────────────────────
const TH_BASE = {
  padding: '0 18px', height: '48px', textAlign: 'left', fontSize: '12px',
  fontWeight: '500', color: '#6B7280', backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #E5E7EB', borderTop: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
};

// ─── UserTable ────────────────────────────────────────────────────────────────
export default function UserTable({ users, currentUser, onRefresh, onToast, onShowAdd, onShowImport }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);

  // Modals
  const [resetTarget, setResetTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortCol(null); setSortDir('asc'); }
    } else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const q = search.toLowerCase();
  const filtered = users.filter(u =>
    !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)
  );

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const va = a[sortCol] ?? '', vb = b[sortCol] ?? '';
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return sortDir === 'asc' ? cmp : -cmp;
  }) : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const allSelected = selected.size > 0 && paginated.every(u => selected.has(u.id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map(u => u.id)));
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const sortProps = { sortCol, sortDir, onSort: handleSort };

  const thCell = (label, Icon, col) => (
    <th style={TH_BASE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Icon && <Icon size={12} color="#9CA3AF" strokeWidth={2} />}
        <span>{label}</span>
        {col && <SortBtn col={col} {...sortProps} />}
      </div>
    </th>
  );

  const emptyState = (
    <tr>
      <td colSpan={7} style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>👤</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
          {search ? `No results for "${search}"` : 'No users yet'}
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          {search ? 'Try a different search or clear filters' : 'Add your first user to get started'}
        </div>
        {search
          ? <button onClick={() => setSearch('')} style={{ fontSize: '13px', color: '#306196', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>
          : <button onClick={onShowAdd} style={{ padding: '8px 16px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>+ Add User</button>
        }
      </td>
    </tr>
  );

  return (
    <>
      {/* Bulk selection bar */}
      <BulkBar
        count={selected.size}
        actions={
          <button style={{ padding: '5px 12px', backgroundColor: '#FEE2E2', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', fontSize: '13px', color: '#DC2626', cursor: 'pointer', fontWeight: '600' }}>
            <Trash2 size={12} style={{ display: 'inline', marginRight: '5px' }} />Deactivate
          </button>
        }
        onClear={() => setSelected(new Set())}
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search users…" />
          <GhostBtn>↕ Sort</GhostBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          <GhostBtn>▽ Filters</GhostBtn>
          <GhostBtn onClick={onShowImport}>Import users</GhostBtn>
          <button
            onClick={onShowAdd}
            style={{ padding: '7px 14px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#245078'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#306196'}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '130px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '44px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...TH_BASE, padding: '0 18px', width: '52px' }}>
                <TableCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
              {thCell('User details', User, 'name')}
              {thCell('Role', Tag, 'role')}
              {thCell('Status', ToggleLeft, null)}
              {thCell('Joined', Calendar, 'createdAt')}
              {thCell('Last login', Calendar, null)}
              <th style={{ ...TH_BASE, width: '44px' }} />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? emptyState : paginated.map(u => {
              const isSelf = u.id === currentUser?.id;
              const isHovered = hoveredId === u.id;
              const isSelected = selected.has(u.id);
              const rowBg = isSelected ? '#EEF5FF' : isHovered ? '#F5F8FC' : '#FFFFFF';
              const td = { padding: '0 18px', height: '60px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #E5E7EB', backgroundColor: rowBg, transition: 'background 100ms ease', verticalAlign: 'middle' };

              const kebabItems = [
                { label: 'View profile', Icon: UserCircle, onClick: () => setProfileTarget(u) },
                { label: 'Edit role', Icon: ShieldCheck, onClick: () => setRoleTarget(u) },
                { label: 'Reset password', Icon: KeyRound, onClick: () => setResetTarget(u) },
                '---',
                u.active
                  ? { label: 'Deactivate', Icon: UserX, onClick: () => setDeactivateTarget(u), danger: false }
                  : { label: 'Reactivate', Icon: UserCheck, onClick: () => setDeactivateTarget(u), danger: false },
                '---',
                { label: 'Remove', Icon: Trash2, onClick: () => setRemoveTarget(u), danger: true },
              ].filter(item => item === '---' || !isSelf || (item.label !== 'Edit role' && item.label !== 'Reset password' && item.label !== 'Deactivate' && item.label !== 'Reactivate' && item.label !== 'Remove'));

              return (
                <tr key={u.id}
                  onMouseEnter={() => setHoveredId(u.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td style={{ ...td, padding: '0 18px' }}>
                    <TableCheckbox checked={isSelected} onChange={() => toggleOne(u.id)} />
                  </td>

                  {/* User details */}
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <InitialsAvatar name={u.name} role={u.role} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: '#112235', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name} {isSelf && <span style={{ fontSize: '10px', color: '#306196', fontWeight: '600', background: '#E8F0F8', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={td}><RoleBadge role={u.role} /></td>

                  {/* Status toggle */}
                  <td style={td}>
                    <ToggleSwitch
                      on={u.active}
                      onChange={() => !isSelf && setDeactivateTarget(u)}
                      disabled={isSelf}
                    />
                  </td>

                  {/* Joined */}
                  <td style={{ ...td, color: '#6B7280', fontSize: '12px' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Last login */}
                  <td style={{ ...td, color: '#6B7280', fontSize: '12px' }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>

                  {/* Kebab */}
                  <td style={{ ...td, padding: '0 10px', textAlign: 'center' }}>
                    <KebabMenu items={kebabItems} rowHovered={isHovered} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationBar page={page} totalPages={totalPages} perPage={perPage} onPage={setPage} onPerPage={p => { setPerPage(p); setPage(1); }} />

      {/* Modals */}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} onToast={onToast} />}
      {removeTarget && <RemoveUserModal user={removeTarget} onClose={() => setRemoveTarget(null)} onRefresh={onRefresh} onToast={onToast} />}
      {roleTarget && <ChangeRoleModal user={roleTarget} onClose={() => setRoleTarget(null)} onRefresh={onRefresh} onToast={onToast} />}
      {deactivateTarget && <DeactivateUserModal user={deactivateTarget} onClose={() => setDeactivateTarget(null)} onRefresh={onRefresh} onToast={onToast} />}
      {profileTarget && <UserProfileModal user={profileTarget} onClose={() => setProfileTarget(null)} />}
    </>
  );
}
