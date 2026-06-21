import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import api from '../../api/axios.js';
import {
  TableCheckbox, KebabMenu, SearchInput, SortBtn, InitialsAvatar, GhostBtn,
} from '../ui/TablePrimitives.jsx';
import { UserCircle, Filter, Clock, User, Activity, FileText, Globe } from 'lucide-react';

// ─── Action badge ─────────────────────────────────────────────────────────────
const ACTION_META = {
  download:       { label: 'Downloaded',     color: '#059669', bg: '#D1FAE5' },
  view:           { label: 'Viewed',         color: '#374151', bg: '#F3F4F6' },
  login:          { label: 'Login',          color: '#D97706', bg: '#FEF3C7' },
  login_fail:     { label: 'Login Fail',     color: '#DC2626', bg: '#FEE2E2' },
  logout:         { label: 'Logout',         color: '#6B7280', bg: '#F3F4F6' },
  upload:         { label: 'Uploaded',       color: '#6B7280', bg: '#E5E7EB' },
  delete:         { label: 'Deleted',        color: '#DC2626', bg: '#FEE2E2' },
  user_create:    { label: 'User Added',     color: '#059669', bg: '#D1FAE5' },
  role_change:    { label: 'Role Changed',   color: '#D97706', bg: '#FEF3C7' },
  deactivate:     { label: 'Deactivated',   color: '#DC2626', bg: '#FEE2E2' },
  password_reset: { label: 'Password Reset', color: '#6B7280', bg: '#E5E7EB' },
  folder_create:  { label: 'Folder Created', color: '#059669', bg: '#D1FAE5' },
  folder_edit:    { label: 'Folder Edited',  color: '#D97706', bg: '#FEF3C7' },
  folder_delete:  { label: 'Folder Deleted', color: '#DC2626', bg: '#FEE2E2' },
  bulk_delete:    { label: 'Bulk Delete',    color: '#DC2626', bg: '#FEE2E2' },
};

function ActionBadge({ action }) {
  const m = ACTION_META[action] || { label: action, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: m.color, backgroundColor: m.bg, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

const ACTION_FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'download', label: 'Downloaded' },
  { value: 'view', label: 'Viewed' },
  { value: 'login', label: 'Login' },
  { value: 'upload', label: 'Uploaded' },
];

// ─── TH Base ─────────────────────────────────────────────────────────────────
const TH_BASE = {
  padding: '0 18px', height: '48px', textAlign: 'left', fontSize: '12px',
  fontWeight: '500', color: '#6B7280', backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #E5E7EB', borderTop: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
};

// ─── LogTable ─────────────────────────────────────────────────────────────────
export default function LogTable({ logs, isAdmin, filters, onFiltersChange, page, totalPages, onPage }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortCol(null); setSortDir('asc'); }
    } else { setSortCol(col); setSortDir('asc'); }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters?.action) params.set('action', filters.action);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    const res = await api.get(`/logs/export?${params}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = 'activity-log.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const q = search.toLowerCase();
  const filtered = logs.filter(l =>
    !q || l.user?.name?.toLowerCase().includes(q) || l.user?.username?.toLowerCase().includes(q) || l.targetName?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q)
  );

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const va = a[sortCol] ?? '', vb = b[sortCol] ?? '';
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return sortDir === 'asc' ? cmp : -cmp;
  }) : filtered;

  const allSelected = selected.size > 0 && sorted.every(l => selected.has(l.id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(sorted.map(l => l.id)));
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const sortProps = { sortCol, sortDir, onSort: handleSort };
  const thCell = (label, Icon, col) => (
    <th style={TH_BASE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <Icon size={12} color="#9CA3AF" />
        <span>{label}</span>
        {col && <SortBtn col={col} {...sortProps} />}
      </div>
    </th>
  );

  const colCount = isAdmin ? 7 : 5;

  const emptyEl = (
    <tr>
      <td colSpan={colCount} style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><ClipboardList size={28} color="#D1D5DB" /></div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
          {search ? `No results for "${search}"` : 'No activity recorded yet'}
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          {search ? 'Try a different search or clear filters' : 'Actions like logins and downloads will appear here'}
        </div>
        {search && <button onClick={() => setSearch('')} style={{ marginTop: '12px', fontSize: '13px', color: '#306196', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>}
      </td>
    </tr>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search activity…" />

          {/* Action filter tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {ACTION_FILTER_TABS.map(tab => {
              const active = (filters?.action ?? '') === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onFiltersChange?.({ ...filters, action: tab.value })}
                  style={{
                    padding: '5px 11px', borderRadius: '5px', border: '1px solid',
                    borderColor: active ? '#306196' : '#D1D5DB',
                    backgroundColor: active ? '#306196' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#6B7280',
                    fontSize: '12px', cursor: 'pointer', fontWeight: active ? '600' : '400',
                    transition: 'all 0.1s',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Date range */}
          <input type="date" value={filters?.from || ''} onChange={e => onFiltersChange?.({ ...filters, from: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none' }} />
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>to</span>
          <input type="date" value={filters?.to || ''} onChange={e => onFiltersChange?.({ ...filters, to: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none' }} />

          {isAdmin && (
            <GhostBtn onClick={handleExport}>
              ↓ Export CSV
            </GhostBtn>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isAdmin ? '800px' : '560px' }}>
          <thead>
            <tr>
              <th style={{ ...TH_BASE, width: '44px', padding: '0 18px' }}>
                <TableCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
              {thCell('Timestamp', Clock, 'createdAt')}
              {isAdmin && thCell('User', User, null)}
              <th style={TH_BASE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Activity size={12} color="#9CA3AF" />
                  <span>Action</span>
                </div>
              </th>
              {thCell('Document / Target', FileText, 'targetName')}
              {isAdmin && thCell('IP Address', Globe, null)}
              <th style={{ ...TH_BASE, width: '44px' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? emptyEl : sorted.map(log => {
              const isHovered = hoveredId === log.id;
              const isSelected = selected.has(log.id);
              const rowBg = isSelected ? '#EEF5FF' : isHovered ? '#F5F8FC' : '#FFFFFF';
              const td = { padding: '0 18px', height: '60px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #E5E7EB', backgroundColor: rowBg, transition: 'background 100ms ease', verticalAlign: 'middle' };

              const kebabItems = isAdmin ? [
                { label: 'View user profile', Icon: UserCircle, onClick: () => {} },
                { label: 'Filter by this user', Icon: Filter, onClick: () => onFiltersChange?.({ ...filters, user: log.user?.id }) },
              ] : [];

              return (
                <tr key={log.id}
                  onMouseEnter={() => setHoveredId(log.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td style={{ ...td, padding: '0 18px', width: '44px' }}>
                    <TableCheckbox checked={isSelected} onChange={() => toggleOne(log.id)} />
                  </td>

                  {/* Timestamp */}
                  <td style={{ ...td, color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>

                  {/* User */}
                  {isAdmin && (
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {log.user && <InitialsAvatar name={log.user.name || log.user.username} role={log.user.role} size={20} />}
                        <span style={{ fontSize: '13px', color: '#374151' }}>{log.user?.name || log.user?.username || '—'}</span>
                      </div>
                    </td>
                  )}

                  {/* Action */}
                  <td style={td}><ActionBadge action={log.action} /></td>

                  {/* Target */}
                  <td style={{ ...td, color: '#6B7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.targetName || '—'}
                  </td>

                  {/* IP */}
                  {isAdmin && (
                    <td style={{ ...td, color: '#6B7280', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {log.ipAddress || '—'}
                    </td>
                  )}

                  {/* Kebab */}
                  <td style={{ ...td, padding: '0 10px', textAlign: 'center', width: '44px' }}>
                    {kebabItems.length > 0 && <KebabMenu items={kebabItems} rowHovered={isHovered} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 4px', height: '44px',
          borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onPage?.(page - 1)} disabled={page <= 1}
              style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', color: '#374151', backgroundColor: '#FFFFFF', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
            >‹ Prev</button>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => onPage?.(page + 1)} disabled={page >= totalPages}
              style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', color: '#374151', backgroundColor: '#FFFFFF', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
            >Next ›</button>
          </div>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>20 per page</span>
        </div>
      )}
    </div>
  );
}
