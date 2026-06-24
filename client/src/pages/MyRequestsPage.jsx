import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Folder, ClipboardList } from 'lucide-react';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';

const STATUS = {
  pending:  { label: 'Pending',  color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', Icon: Clock },
  approved: { label: 'Approved', color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', Icon: CheckCircle },
  denied:   { label: 'Denied',   color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', Icon: XCircle },
};

export default function MyRequestsPage() {
  const isMobile = useIsMobile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/access-requests/mine')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const thStyle = {
    padding: '0 18px',
    height: '44px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    backgroundColor: '#F7F8FA',
    borderBottom: '1px solid #E5E7EB',
  };

  const tdStyle = {
    padding: '0 18px',
    height: '60px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #E5E7EB',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
      <TopBar title="My Requests" icon={ClipboardList} breadcrumb={[{ label: 'Tracking' }, { label: 'My Requests' }]} />
      <div style={{ padding: isMobile ? '16px' : '28px', flex: 1 }}>

        {loading ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {/* Skeleton header */}
            <div style={{ height: '44px', backgroundColor: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }} />
            {[1,2,3].map(i => (
              <div key={i} style={{ height: '60px', borderBottom: '1px solid #F3F4F6', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: '12px', width: '160px', borderRadius: '6px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              </div>
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>

        ) : requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '64px 24px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={22} color="#306196" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#112235', marginBottom: '4px' }}>No requests yet</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF' }}>You haven't submitted any folder access requests.</div>
            </div>
          </div>

        ) : (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflowX: isMobile ? 'auto' : 'visible' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '600px' : undefined }}>
              <thead>
                <tr>
                  <th style={thStyle}>Folder</th>
                  <th style={thStyle}>Your Reason</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => {
                  const s = STATUS[req.status] || STATUS.pending;
                  const isLast = idx === requests.length - 1;
                  return (
                    <tr key={req.id}
                      style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Folder size={14} color="#306196" />
                          </div>
                          <span style={{ fontWeight: '600', color: '#112235', fontSize: '13px' }}>{req.folder?.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #E5E7EB', color: '#6B7280', maxWidth: '260px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason || '—'}</div>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #E5E7EB', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #E5E7EB' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: s.color, backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
                          <s.Icon size={11} /> {s.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #E5E7EB', color: '#6B7280' }}>
                        {req.reviewNote || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
