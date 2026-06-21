import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Trash2, Upload, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import api from '../../api/axios.js';

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

export default function BulkImportModal({ onClose, onImported }) {
  const [file, setFile]         = useState(null);
  const [rows, setRows]         = useState(EXAMPLE_ROWS);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults]   = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

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
      onImported(data.created?.length ?? 0);
    } catch (err) {
      setResults({ errors: [{ error: err.response?.data?.error || 'Import failed' }] });
    } finally { setImporting(false); }
  };

  const COLS = ['name', 'email', 'username', 'role'];

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, backgroundColor: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{ width: 'min(920px, 95vw)', height: '580px', backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalIn 0.18s ease' }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

        {/* Header */}
        <div style={{ height: '52px', padding: '0 20px', flexShrink: 0, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#112235' }}>Import users from CSV</span>
          <button onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left panel */}
          <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', marginBottom: '2px' }}>Import CSV file</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>Upload your CSV file to import users in bulk</div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                style={{ border: `1.5px dashed ${dragOver ? '#306196' : '#D1D5DB'}`, borderRadius: '10px', backgroundColor: dragOver ? '#EEF5FF' : '#F7F8FA', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: file ? 'default' : 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
              >
                <FileText size={24} color={file ? '#306196' : '#9CA3AF'} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: file ? '#112235' : '#6B7280' }}>
                  {file ? file.name : '.csv'}
                </span>
                {file ? (
                  <button onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#6B7280' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >
                    <Trash2 size={11} /> Remove file
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Click to browse or drag &amp; drop</span>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />

              {/* Required columns */}
              <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#F7F8FA', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Required columns</div>
                {['name', 'email', 'username', 'role'].map(col => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#306196', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace' }}>{col}</span>
                  </div>
                ))}
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF' }}>
                  Role must be: <span style={{ fontFamily: 'monospace' }}>admin</span>, <span style={{ fontFamily: 'monospace' }}>member</span>, or <span style={{ fontFamily: 'monospace' }}>viewer</span>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {results.created?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', backgroundColor: '#D1FAE5', borderRadius: '7px', fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                      <CheckCircle size={13} /> {results.created.length} users imported
                    </div>
                  )}
                  {results.skipped?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', backgroundColor: '#FEF3C7', borderRadius: '7px', fontSize: '12px', color: '#D97706', fontWeight: '600' }}>
                      <AlertCircle size={13} /> {results.skipped.length} skipped
                    </div>
                  )}
                  {results.errors?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', backgroundColor: '#FEE2E2', borderRadius: '7px', fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>
                      <XCircle size={13} /> {results.errors.length} errors
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Import button */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB' }}>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                style={{ width: '100%', padding: '10px', backgroundColor: file && !importing ? '#306196' : '#9CA3AF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: file && !importing ? 'pointer' : 'not-allowed', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (file && !importing) e.currentTarget.style.backgroundColor = '#245078'; }}
                onMouseLeave={e => { if (file && !importing) e.currentTarget.style.backgroundColor = '#306196'; }}
              >
                {importing ? 'Importing…' : file ? `Import ${rows.length} users` : 'Import users'}
              </button>
            </div>
          </div>

          {/* Right panel — preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: '44px', padding: '0 20px', flexShrink: 0, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>Preview</span>
              {!file && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Showing example data</span>}
              {file && <span style={{ fontSize: '12px', color: '#6B7280' }}>{rows.length} rows</span>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              {rows.length === 0 && file ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Upload size={28} color="#D1D5DB" />
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No data rows found in this file</div>
                </div>
              ) : !file ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Upload size={28} color="#D1D5DB" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>Upload a CSV file</div>
                    <div style={{ fontSize: '12px', color: '#C4C9D4', marginTop: '2px' }}>to preview your data here</div>
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '44px', padding: '11px 14px', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textAlign: 'center', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>#</th>
                      {COLS.map(col => (
                        <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6B7280', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
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
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', borderBottom: '1px solid #F3F4F6' }}>{idx + 1}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#112235', fontWeight: '500', borderBottom: '1px solid #F3F4F6' }}>{row.name || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.email || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.username || '—'}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                            {row.role ? (
                              <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', color: rs.color, backgroundColor: rs.bg, textTransform: 'capitalize' }}>
                                {row.role}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
