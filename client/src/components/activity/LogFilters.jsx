import api from '../../api/axios.js';

const ACTION_FILTERS = [
  { value: '', label: 'All' },
  { value: 'download', label: 'Downloaded' },
  { value: 'view', label: 'Viewed' },
  { value: 'login', label: 'Login' },
  { value: 'upload', label: 'Uploaded' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'folder_create', label: 'Folder Created' },
  { value: 'folder_edit', label: 'Folder Edited' },
  { value: 'folder_delete', label: 'Folder Deleted' },
  { value: 'bulk_delete', label: 'Bulk Delete' },
];

export default function LogFilters({ filters, onChange, isAdmin }) {
  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.action) params.set('action', filters.action);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    const res = await api.get(`/logs/export?${params}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {ACTION_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onChange({ ...filters, action: f.value })}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: filters.action === f.value ? '#306196' : '#D1D5DB',
              backgroundColor: filters.action === f.value ? '#306196' : '#FFFFFF',
              color: filters.action === f.value ? '#FFFFFF' : '#6B7280',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: filters.action === f.value ? '600' : '400',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        value={filters.from}
        onChange={e => onChange({ ...filters, from: e.target.value })}
        style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235' }}
      />
      <input
        type="date"
        value={filters.to}
        onChange={e => onChange({ ...filters, to: e.target.value })}
        style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235' }}
      />
      {isAdmin && (
        <button
          onClick={handleExport}
          style={{ marginLeft: 'auto', padding: '6px 14px', backgroundColor: '#1A9E5E', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
        >
          Export CSV
        </button>
      )}
    </div>
  );
}
