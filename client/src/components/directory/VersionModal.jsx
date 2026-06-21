import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, X, History, Check, Clock, User, HardDrive, MessageSquare } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../hooks/useAuth.js';

function formatSize(bytes) {
  const b = Number(bytes);
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function relativeDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VersionModal({ doc, onClose }) {
  const { user } = useAuth();
  const [versions, setVersions]   = useState([]);
  const [file, setFile]           = useState(null);
  const [note, setNote]           = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const fileInputRef = useRef(null);
  const isAdmin = user?.role === 'admin';

  const loadVersions = () => {
    api.get(`/documents/${doc.id}/versions`).then(r => setVersions(r.data)).catch(() => {});
  };

  useEffect(() => { loadVersions(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (note) fd.append('note', note);
    try {
      await api.post(`/documents/${doc.id}/versions`, fd);
      setFile(null); setNote('');
      loadVersions();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '540px', maxHeight: '90vh', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '24px 24px 28px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <History size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>Version History</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{versions.length} version{versions.length !== 1 ? 's' : ''} tracked</div>
            </div>
          </div>

          {/* Doc pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '7px 11px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px' }}>
            <FileText size={12} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Upload new version — admin only */}
          {isAdmin && (
            <div style={{ backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={13} color="#306196" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>Upload New Version</span>
              </div>

              <form onSubmit={handleUpload}>
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                  onClick={() => !file && fileInputRef.current?.click()}
                  style={{ border: `1.5px dashed ${dragOver ? '#306196' : file ? '#306196' : '#D1D5DB'}`, borderRadius: '10px', backgroundColor: dragOver ? '#EEF4FF' : file ? '#F0F6FF' : '#FFFFFF', padding: '14px 16px', marginBottom: '10px', cursor: file ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: file ? '#EEF4FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {file ? <FileText size={17} color="#306196" /> : <Upload size={17} color="#9CA3AF" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {file ? (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{(file.size / 1024).toFixed(0)} KB · ready to upload</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>Drop a file or click to browse</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Any file type supported</div>
                      </>
                    )}
                  </div>
                  {file && (
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '3px', display: 'flex', borderRadius: '5px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />

                <input type="text" placeholder="What changed? (optional)" value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${noteFocused ? '#306196' : '#E5E7EB'}`, borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px', backgroundColor: noteFocused ? '#FAFCFF' : '#FFFFFF', transition: 'all 0.15s', color: '#112235' }}
                  onFocus={() => setNoteFocused(true)} onBlur={() => setNoteFocused(false)}
                />

                <button type="submit" disabled={!file || uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', backgroundColor: !file || uploading ? '#9CA3AF' : '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: !file || uploading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', boxShadow: !file || uploading ? 'none' : '0 3px 10px rgba(48,97,150,0.25)' }}
                  onMouseEnter={e => { if (file && !uploading) e.currentTarget.style.backgroundColor = '#245078'; }}
                  onMouseLeave={e => { if (file && !uploading) e.currentTarget.style.backgroundColor = '#306196'; }}
                >
                  <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload Version'}
                </button>
              </form>
            </div>
          )}

          {/* Version timeline */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
              Version Timeline
            </div>

            {versions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', gap: '10px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={18} color="#306196" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '3px' }}>No versions yet</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Upload a new version above to start tracking changes</div>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '2px', backgroundColor: '#E5E7EB', borderRadius: '2px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {versions.map((v, i) => {
                    const isCurrent = i === 0;
                    return (
                      <div key={v.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', padding: '4px 0' }}>
                        {/* Version dot */}
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isCurrent ? '#306196' : '#F3F4F6', border: `2px solid ${isCurrent ? '#306196' : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: '11px', fontWeight: '800', color: isCurrent ? '#FFFFFF' : '#6B7280' }}>
                          v{v.version}
                        </div>

                        {/* Content card */}
                        <div style={{ flex: 1, backgroundColor: isCurrent ? '#EEF4FF' : '#FAFAFA', border: `1px solid ${isCurrent ? '#C7DEFF' : '#E5E7EB'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: isCurrent ? '#306196' : '#112235' }}>
                                {isCurrent ? 'Current Version' : `Version ${v.version}`}
                              </span>
                              {isCurrent && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '5px', backgroundColor: '#306196', color: '#FFFFFF' }}>
                                  <Check size={9} strokeWidth={3} /> Current
                                </span>
                              )}
                              {v.version === 1 && !isCurrent && (
                                <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '5px', backgroundColor: '#F3F4F6', color: '#6B7280' }}>Original</span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
                              <User size={11} color="#9CA3AF" /> {v.uploader?.name || '—'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
                              <Clock size={11} color="#9CA3AF" /> {relativeDate(v.uploadedAt)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
                              <HardDrive size={11} color="#9CA3AF" /> {formatSize(v.sizeBytes)}
                            </span>
                          </div>

                          {v.note && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', padding: '8px 10px', backgroundColor: isCurrent ? 'rgba(48,97,150,0.08)' : '#F3F4F6', borderRadius: '7px' }}>
                              <MessageSquare size={11} color="#9CA3AF" style={{ flexShrink: 0, marginTop: '1px' }} />
                              <span style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic', lineHeight: 1.5 }}>{v.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ height: '1px', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
        <div style={{ padding: '14px 24px', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
