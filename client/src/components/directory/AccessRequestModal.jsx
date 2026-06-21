import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, CheckCircle2, X, FolderLock, Send, ShieldCheck } from 'lucide-react';
import api from '../../api/axios.js';

export default function AccessRequestModal({ folder, onClose, onSubmitted }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/access-requests', { folderId: folder.id, reason });
      setDone(true);
      setTimeout(onSubmitted, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const charLeft = Math.max(0, 10 - reason.trim().length);
  const canSubmit = !loading && reason.trim().length >= 10;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '460px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '24px 24px 28px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {done ? <ShieldCheck size={20} color="#FFFFFF" /> : <FolderLock size={20} color="#FFFFFF" />}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                  {done ? 'Request submitted' : 'Request access'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                  {done ? 'An admin will review your request' : 'Tell us why you need access'}
                </div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <X size={14} />
            </button>
          </div>
          {/* Folder pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px' }}>
            <Lock size={12} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{folder.name}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', flex: 1 }}>
          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '16px 0 8px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235', marginBottom: '6px' }}>Request sent successfully</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.7 }}>
                  Your request for <strong style={{ color: '#112235' }}>{folder.name}</strong> has been submitted. An admin will review it and notify you shortly.
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>
                  <X size={13} /> {error}
                </div>
              )}
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Reason for access
              </label>
              <textarea
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Explain why you need access to this folder…"
                rows={4}
                style={{
                  width: '100%', padding: '11px 13px', boxSizing: 'border-box',
                  border: `1.5px solid ${focused ? '#306196' : '#E5E7EB'}`,
                  borderRadius: '10px', fontSize: '13px', color: '#112235',
                  outline: 'none', resize: 'none', fontFamily: 'inherit',
                  lineHeight: 1.6, transition: 'all 0.15s',
                  backgroundColor: focused ? '#FAFCFF' : '#F7F8FA',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Be specific — this helps admins decide faster</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: charLeft > 0 ? '#9CA3AF' : '#059669' }}>
                  {charLeft > 0 ? `${charLeft} more chars` : 'Ready'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <>
            <div style={{ height: '1px', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: canSubmit ? '#306196' : '#E5E7EB', color: canSubmit ? '#FFFFFF' : '#9CA3AF', cursor: canSubmit ? 'pointer' : 'not-allowed', boxShadow: canSubmit ? '0 4px 12px rgba(48,97,150,0.25)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#245078'; }}
                onMouseLeave={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#306196'; }}
              >
                <Send size={13} /> {loading ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
