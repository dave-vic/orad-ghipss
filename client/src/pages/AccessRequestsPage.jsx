import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Clock, Folder, User, AlignLeft, Calendar, ShieldCheck, X, Check, Lock } from 'lucide-react';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import Toast from '../components/ui/Toast.jsx';
import { InitialsAvatar } from '../components/ui/TablePrimitives.jsx';

const STATUS = {
  pending:  { color: '#D97706', bg: '#FEF3C7', label: 'Pending',  Icon: Clock },
  approved: { color: '#059669', bg: '#D1FAE5', label: 'Approved', Icon: CheckCircle2 },
  denied:   { color: '#DC2626', bg: '#FEE2E2', label: 'Denied',   Icon: XCircle },
};

const TH_BASE = {
  padding: '0 18px', height: '44px', textAlign: 'left', fontSize: '11px',
  fontWeight: '700', color: '#6B7280', backgroundColor: '#F7F8FA',
  borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

function thCell(label, Icon) {
  return (
    <th style={TH_BASE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Icon && <Icon size={12} color="#9CA3AF" strokeWidth={2} />}
        <span>{label}</span>
      </div>
    </th>
  );
}

function ReviewModal({ request, onClose, onReviewed }) {
  const [status, setStatus] = useState('approved');
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/access-requests/${request.id}/review`, { status, reviewNote });
      onReviewed();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitColor = status === 'approved' ? '#059669' : '#DC2626';
  const submitHover = status === 'approved' ? '#047857' : '#B91C1C';

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, backgroundColor: 'rgba(11,24,44,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '480px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '24px 24px 28px', position: 'relative', overflow: 'hidden' }}>
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
              <ShieldCheck size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>Review Request</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Access to <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>{request.folder.name}</span></div>
            </div>
          </div>
        </div>

        {/* Body */}
        <form id="review-form" onSubmit={handleSubmit}>
          <div style={{ padding: '22px 24px 20px' }}>

            {/* Requester card */}
            <div style={{ display: 'flex', gap: '12px', padding: '14px 16px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '20px' }}>
              <InitialsAvatar name={request.user.name} role={request.user.role} size={38} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>{request.user.name}</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>@{request.user.username}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '8px' }}>
                  "{request.reason}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Lock size={10} color="#306196" />
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Requesting access to <strong style={{ color: '#306196' }}>{request.folder.name}</strong></span>
                </div>
              </div>
            </div>

            {/* Decision */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                Decision
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { val: 'approved', label: 'Approve', sublabel: 'Grant access', Icon: Check, solid: '#059669', light: '#F0FDF4', border: '#BBF7D0', iconBg: '#DCFCE7' },
                  { val: 'denied',   label: 'Deny',    sublabel: 'Reject request', Icon: X,   solid: '#DC2626', light: '#FFF5F5', border: '#FECACA', iconBg: '#FEE2E2' },
                ].map(({ val, label, sublabel, Icon: BtnIcon, solid, light, border, iconBg }) => {
                  const sel = status === val;
                  return (
                    <button key={val} type="button" onClick={() => setStatus(val)}
                      style={{ padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', border: `2px solid ${sel ? solid : '#E5E7EB'}`, backgroundColor: sel ? light : '#FAFAFA', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', textAlign: 'left' }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = border; e.currentTarget.style.backgroundColor = light; } }}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; } }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: sel ? solid : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                        <BtnIcon size={16} color={sel ? '#FFFFFF' : solid} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: sel ? solid : '#374151', lineHeight: 1 }}>{label}</div>
                        <div style={{ fontSize: '11px', color: sel ? solid : '#9CA3AF', marginTop: '3px', fontWeight: '500', opacity: sel ? 0.8 : 1 }}>{sublabel}</div>
                      </div>
                      {sel && (
                        <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '6px', backgroundColor: solid, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} color="#FFFFFF" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                Note <span style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Add a note for the user…"
                onFocus={e => e.target.style.borderColor = '#306196'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', outline: 'none', lineHeight: 1.55, transition: 'border-color 0.15s', color: '#374151', backgroundColor: '#FAFAFA' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />
          <div style={{ padding: '16px 24px', display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: loading ? '#9CA3AF' : submitColor, color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', boxShadow: loading ? 'none' : `0 4px 12px ${submitColor}40` }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = submitHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = submitColor; }}
            >
              {loading ? 'Saving…' : status === 'approved' ? 'Approve' : 'Deny'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadRequests = () => {
    setLoading(true);
    api.get(`/access-requests?status=${filter}`)
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const TABS = [
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied',   label: 'Denied' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Access Requests" icon={ShieldCheck} />
      <div style={{ padding: '28px', flex: 1 }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', width: 'fit-content' }}>
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: filter === t.value ? '600' : '400',
                backgroundColor: filter === t.value ? '#FFFFFF' : 'transparent',
                color: filter === t.value ? '#112235' : '#6B7280',
                boxShadow: filter === t.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            {[1,2,3,4].map((i, idx) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderBottom: idx < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '13px', width: '30%', backgroundColor: '#F3F4F6', borderRadius: '5px' }} />
                  <div style={{ height: '11px', width: '55%', backgroundColor: '#F3F4F6', borderRadius: '5px' }} />
                </div>
                <div style={{ height: '24px', width: '70px', backgroundColor: '#F3F4F6', borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ShieldCheck size={24} color="#306196" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235', marginBottom: '4px' }}>No {filter} requests</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>All access requests with status "{filter}" will appear here.</div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px' }}>
              <colgroup>
                <col style={{ width: '200px' }} />
                <col style={{ width: '160px' }} />
                <col />
                <col style={{ width: '120px' }} />
                <col style={{ width: '110px' }} />
                {filter === 'pending' && <col style={{ width: '100px' }} />}
              </colgroup>
              <thead>
                <tr>
                  {thCell('User', User)}
                  {thCell('Folder', Folder)}
                  {thCell('Reason', AlignLeft)}
                  {thCell('Submitted', Calendar)}
                  {thCell('Status', ShieldCheck)}
                  {filter === 'pending' && <th style={{ ...TH_BASE, textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const s = STATUS[req.status] || STATUS.pending;
                  const isHovered = hoveredId === req.id;
                  const td = {
                    padding: '0 18px', height: '60px', fontSize: '13px', color: '#374151',
                    borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle',
                    backgroundColor: isHovered ? '#F5F8FC' : '#FFFFFF', transition: 'background 100ms ease',
                  };

                  return (
                    <tr
                      key={req.id}
                      onMouseEnter={() => setHoveredId(req.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* User */}
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <InitialsAvatar name={req.user.name} role={req.user.role} size={28} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '600', color: '#112235', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.user.name}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>@{req.user.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Folder */}
                      <td style={{ ...td, fontWeight: '500', color: '#112235' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.folder.name}</div>
                      </td>

                      {/* Reason */}
                      <td style={{ ...td, color: '#6B7280' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason}</div>
                        {req.reviewNote && (
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Note: {req.reviewNote}
                          </div>
                        )}
                      </td>

                      {/* Submitted */}
                      <td style={{ ...td, color: '#6B7280', fontSize: '12px' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Status */}
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', color: s.color, backgroundColor: s.bg }}>
                          <s.Icon size={10} />
                          {s.label}
                        </span>
                      </td>

                      {/* Action */}
                      {filter === 'pending' && (
                        <td style={{ ...td, textAlign: 'right', padding: '0 18px' }}>
                          <button
                            onClick={() => setReviewing(req)}
                            style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#112235'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#112235'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                          >
                            Review
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {reviewing && (
          <ReviewModal
            request={reviewing}
            onClose={() => setReviewing(null)}
            onReviewed={() => { setReviewing(null); loadRequests(); setToast({ message: 'Request reviewed', type: 'success' }); }}
          />
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
