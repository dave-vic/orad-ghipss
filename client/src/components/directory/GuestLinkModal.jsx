import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link2, Copy, Trash2, Plus, Clock, Eye, X, Share2, FileText, Check, AlertTriangle } from 'lucide-react';
import api from '../../api/axios.js';

export default function GuestLinkModal({ doc, onClose }) {
  const [links, setLinks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ label: '', expiresAt: '', maxViews: '' });
  const [copied, setCopied]     = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [focused, setFocused]   = useState('');

  const loadLinks = () => {
    api.get(`/documents/${doc.id}/guest-links`)
      .then(res => setLinks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLinks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/documents/${doc.id}/guest-links`, {
        label: form.label || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        maxViews: form.maxViews ? parseInt(form.maxViews) : undefined,
      });
      setForm({ label: '', expiresAt: '', maxViews: '' });
      loadLinks();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const confirmRevoke = async () => {
    await api.delete(`/documents/${doc.id}/guest-links/${revoking}`);
    setRevoking(null);
    loadLinks();
  };

  const isExpired = (link) => {
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) return true;
    if (link.maxViews && link.viewCount >= link.maxViews) return true;
    return false;
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '9px 12px',
    border: `1.5px solid ${focused === field ? '#306196' : '#E5E7EB'}`,
    borderRadius: '8px', fontSize: '13px', color: '#112235',
    outline: 'none', boxSizing: 'border-box',
    backgroundColor: focused === field ? '#FAFCFF' : '#F7F8FA',
    transition: 'all 0.15s',
  });

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
              <Share2 size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>Share Document</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Generate guest links for external access</div>
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

          {/* Create form */}
          <div style={{ backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={13} color="#306196" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>New Guest Link</span>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Label <span style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                  <input type="text" placeholder="e.g. For John" value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    style={inputStyle('label')} onFocus={() => setFocused('label')} onBlur={() => setFocused('')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Expires</label>
                  <input type="datetime-local" value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    style={inputStyle('expires')} onFocus={() => setFocused('expires')} onBlur={() => setFocused('')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Max Views</label>
                  <input type="number" min="1" placeholder="Unlimited" value={form.maxViews}
                    onChange={e => setForm(f => ({ ...f, maxViews: e.target.value }))}
                    style={inputStyle('views')} onFocus={() => setFocused('views')} onBlur={() => setFocused('')} />
                </div>
              </div>
              <button type="submit" disabled={creating}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', backgroundColor: creating ? '#9CA3AF' : '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: creating ? 'not-allowed' : 'pointer', transition: 'background 0.15s', boxShadow: creating ? 'none' : '0 3px 10px rgba(48,97,150,0.25)' }}
                onMouseEnter={e => { if (!creating) e.currentTarget.style.backgroundColor = '#245078'; }}
                onMouseLeave={e => { if (!creating) e.currentTarget.style.backgroundColor = '#306196'; }}
              >
                <Link2 size={13} /> {creating ? 'Generating…' : 'Generate Link'}
              </button>
            </form>
          </div>

          {/* Existing links */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
              Active Links {links.length > 0 && `· ${links.length}`}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>
            ) : links.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px', gap: '10px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={18} color="#306196" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '3px' }}>No guest links yet</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Generate a link above to share this document</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.map(link => {
                  const expired = isExpired(link);
                  const isRevoking = revoking === link.id;
                  const isCopied = copied === link.id;

                  return (
                    <div key={link.id} style={{ border: `1px solid ${expired ? '#FECACA' : isRevoking ? '#FECACA' : '#E5E7EB'}`, borderRadius: '10px', overflow: 'hidden', backgroundColor: expired ? '#FEF2F2' : '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: expired ? '#FEE2E2' : '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Link2 size={15} color={expired ? '#DC2626' : '#306196'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: expired ? '#DC2626' : '#112235' }}>{link.label || 'Guest Link'}</span>
                            {expired && (
                              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '5px', backgroundColor: '#FEE2E2', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expired</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {link.expiresAt && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9CA3AF' }}>
                                <Clock size={10} /> {new Date(link.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9CA3AF' }}>
                              <Eye size={10} /> {link.viewCount}{link.maxViews ? `/${link.maxViews}` : ''} views
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          {!expired && (
                            <button onClick={() => handleCopy(link.url, link.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: isCopied ? '#D1FAE5' : '#F7F8FA', border: `1px solid ${isCopied ? '#A7F3D0' : '#E5E7EB'}`, borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: isCopied ? '#059669' : '#374151', transition: 'all 0.15s' }}
                              onMouseEnter={e => { if (!isCopied) e.currentTarget.style.backgroundColor = '#F0F6FF'; }}
                              onMouseLeave={e => { if (!isCopied) e.currentTarget.style.backgroundColor = '#F7F8FA'; }}
                            >
                              {isCopied ? <Check size={11} /> : <Copy size={11} />}
                              {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                          )}
                          <button onClick={() => setRevoking(isRevoking ? null : link.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: isRevoking ? '#FEE2E2' : '#FEF2F2', border: `1px solid ${isRevoking ? '#FECACA' : '#FECACA'}`, borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#DC2626', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = isRevoking ? '#FEE2E2' : '#FEF2F2'}
                          >
                            <Trash2 size={11} /> Revoke
                          </button>
                        </div>
                      </div>

                      {isRevoking && (
                        <div style={{ backgroundColor: '#FEF2F2', borderTop: '1px solid #FECACA', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <AlertTriangle size={13} color="#DC2626" />
                            <span style={{ fontSize: '12px', color: '#B91C1C', fontWeight: '500' }}>Anyone with this link will lose access.</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button onClick={() => setRevoking(null)}
                              style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '7px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer' }}
                            >Cancel</button>
                            <button onClick={confirmRevoke}
                              style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '700', border: 'none', borderRadius: '7px', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: 'pointer' }}
                            >Yes, revoke</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
