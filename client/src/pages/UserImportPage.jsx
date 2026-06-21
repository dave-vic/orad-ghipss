import { useState, useRef, useCallback } from 'react';
import { FileText, Trash2, Upload, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import Toast from '../components/ui/Toast.jsx';

const EXAMPLE_ROWS = [
  { name: 'Kofi Asante',   email: 'kofi@ghipss.com',   username: 'kofi',   role: 'admin'  },
  { name: 'Ama Owusu',     email: 'ama@ghipss.com',     username: 'ama',    role: 'member' },
  { name: 'Kwame Mensah',  email: 'kwame@ghipss.com',   username: 'kwame',  role: 'viewer' },
  { name: 'Abena Boateng', email: 'abena@ghipss.com',   username: 'abena',  role: 'member' },
  { name: 'Yaw Darko',     email: 'yaw@ghipss.com',     username: 'yaw',    role: 'viewer' },
];

const ROLE_STYLE = {
  admin:  { color: '#DC2626', bg: '#FEE2E2' },
  member: { color: '#059669', bg: '#D1FAE5' },
  viewer: { color: '#D97706', bg: '#FEF3C7' },
};

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
  });
}

export default function UserImportPage() {
  const [file, setFile]       = useState(null);
  const [rows, setRows]       = useState(EXAMPLE_ROWS);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [toast, setToast]     = useState(null);
  const fileInputRef = useRef(null);

  const readFile = useCallback((f) => {
    if (!f) return;
    setFile(f); setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => setRows(parseCSV(e.target.result || ''));
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  }, [readFile]);

  const removeFile = () => {
    setFile(null); setRows(EXAMPLE_ROWS); setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (!file || rows.length === 0) return;
    setImporting(true);
    try {
      const { data } = await api.post('/users/import', { users: rows });
      setResults(data);
      setToast({ message: `Imported ${data.created?.length ?? 0} users successfully`, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Import failed', type: 'error' });
    } finally { setImporting(false); }
  };

  const COLS = ['name', 'email', 'username', 'role'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar title="Bulk User Import" icon={Upload} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', margin: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', backgroundColor: '#FFFFFF' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: '300px', flexShrink: 0, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#112235', marginBottom: '2px' }}>Import CSV file</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>Upload your CSV file to import users in bulk</div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              style={{
                border: `1.5px dashed ${dragOver ? '#306196' : '#D1D5DB'}`,
                borderRadius: '10px',
                backgroundColor: dragOver ? '#EEF5FF' : '#F7F8FA',
                height: '140px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                cursor: file ? 'default' : 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <FileText size={28} color={file ? '#306196' : '#9CA3AF'} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: file ? '#112235' : '#6B7280' }}>
                {file ? file.name : '.csv'}
              </span>
              {file ? (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                >
                  <Trash2 size={12} /> Remove file
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Click to browse or drag & drop</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />

            {/* Required columns hint */}
            <div style={{ marginTop: '20px', padding: '12px 14px', backgroundColor: '#F7F8FA', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Required columns</div>
              {['name', 'email', 'username', 'role'].map(col => (
                <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#306196', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace' }}>{col}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF' }}>
                Role must be: <span style={{ fontFamily: 'monospace' }}>admin</span>, <span style={{ fontFamily: 'monospace' }}>member</span>, or <span style={{ fontFamily: 'monospace' }}>viewer</span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              style={{ width: '100%', padding: '10px', backgroundColor: file && !importing ? '#306196' : '#9CA3AF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: file && !importing ? 'pointer' : 'not-allowed', transition: 'background 0.1s' }}
              onMouseEnter={e => { if (file && !importing) e.currentTarget.style.backgroundColor = '#245078'; }}
              onMouseLeave={e => { if (file && !importing) e.currentTarget.style.backgroundColor = '#306196'; }}
            >
              {importing ? 'Importing…' : file ? `Save · Import ${rows.length} users` : 'Save'}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ height: '52px', padding: '0 20px', flexShrink: 0, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#112235' }}>Preview</span>
            {!file && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Showing example data</span>}
            {file && rows.length > 0 && <span style={{ fontSize: '12px', color: '#6B7280' }}>{rows.length} rows · 4 columns</span>}
          </div>

          {/* Results banners */}
          {results && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.created?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#D1FAE5', borderRadius: '8px', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                  <CheckCircle size={14} /> {results.created.length} users imported successfully
                </div>
              )}
              {results.skipped?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FEF3C7', borderRadius: '8px', fontSize: '13px', color: '#D97706', fontWeight: '600' }}>
                  <AlertCircle size={14} /> {results.skipped.length} skipped
                </div>
              )}
              {results.errors?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FEE2E2', borderRadius: '8px', fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>
                  <XCircle size={14} /> {results.errors.length} errors
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: '44px', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textAlign: 'center', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>#</th>
                  {COLS.map(col => (
                    <th key={col} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const role = (row.role || '').toLowerCase();
                  const rs = ROLE_STYLE[role] || { color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={idx}
                      style={{ backgroundColor: '#FFFFFF' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F8FC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', borderBottom: '1px solid #E5E7EB' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#112235', fontWeight: '500', borderBottom: '1px solid #E5E7EB' }}>{row.name || '—'}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{row.email || '—'}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{row.username || '—'}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: rs.color, backgroundColor: rs.bg, textTransform: 'capitalize' }}>
                          {row.role || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
