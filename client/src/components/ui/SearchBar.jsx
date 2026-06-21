import { useState, useRef, useEffect } from 'react';
import { Search, FileText, Folder, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';

function formatSize(bytes) {
  const b = Number(bytes);
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const timer = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timer.current);
    if (val.trim().length < 2) { setResults(null); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(val)}`);
        setResults(data);
        setOpen(true);
      } catch {} finally { setLoading(false); }
    }, 300);
  };

  const total = (results?.documents?.length || 0) + (results?.folders?.length || 0);

  return (
    <div ref={ref} style={{ position: 'relative', width: '220px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 10px',
        backgroundColor: '#F7F8FA',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
      }}
        onFocusCapture={e => e.currentTarget.style.borderColor = '#306196'}
        onBlurCapture={e => e.currentTarget.style.borderColor = '#D1D5DB'}
      >
        <Search size={13} color="#9CA3AF" style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results && setOpen(true)}
          placeholder="Search…"
          style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#112235', flex: 1, background: 'transparent' }}
        />
        {loading && <div style={{ width: '12px', height: '12px', border: '1.5px solid #D1D5DB', borderTopColor: '#306196', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults(null); setOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex', flexShrink: 0 }}>
            <X size={12} />
          </button>
        )}
      </div>

      {open && results && (
        <div style={{
          position: 'absolute', top: '36px', left: 0, right: 0,
          backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 1000, maxHeight: '360px', overflowY: 'auto',
        }}>
          {total === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No results for "{query}"</div>
          ) : (
            <>
              {results.folders?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Folders</div>
                  {results.folders.map(f => (
                    <div key={f.id} onClick={() => { navigate(`/directory/${f.id}`); setOpen(false); setQuery(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', cursor: 'pointer', borderTop: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <Folder size={13} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#112235', fontWeight: '500' }}>{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {results.documents?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Documents</div>
                  {results.documents.map(d => (
                    <div key={d.id} onClick={() => { navigate(`/directory/${d.folderId}`); setOpen(false); setQuery(''); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 14px', cursor: 'pointer', borderTop: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <FileText size={13} color="#6B7280" />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', color: '#112235', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>in {d.folder.name}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>{formatSize(d.sizeBytes)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
