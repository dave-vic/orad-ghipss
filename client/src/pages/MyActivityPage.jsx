import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, FileText, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';

const TH_BASE = {
  padding: '0 18px', height: '48px', textAlign: 'left', fontSize: '12px',
  fontWeight: '500', color: '#6B7280', backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #E5E7EB', borderTop: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
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

const ACTION_COLORS = {
  download: { color: '#2563EB', bg: '#DBEAFE' },
  upload:   { color: '#059669', bg: '#D1FAE5' },
  view:     { color: '#306196', bg: '#E8F0F8' },
  delete:   { color: '#DC2626', bg: '#FEE2E2' },
  login:    { color: '#D97706', bg: '#FEF3C7' },
};

function ActionBadge({ action }) {
  const t = ACTION_COLORS[action] || { color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span style={{ padding: '2px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', backgroundColor: t.bg, color: t.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {action}
    </span>
  );
}

function SectionCard({ title, Icon, iconColor = '#306196', count, children }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={iconColor} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#112235', flex: 1 }}>{title}</span>
        {count > 0 && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: iconColor, backgroundColor: `${iconColor}18`, borderRadius: '5px', padding: '2px 8px' }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
      {message}
    </div>
  );
}

export default function MyActivityPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [acks, setAcks] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRecent, setHoveredRecent] = useState(null);
  const [hoveredAck, setHoveredAck] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/me/acknowledgements'),
      api.get('/me/recently-viewed'),
    ]).then(([a, r]) => { setAcks(a.data); setRecent(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
      <TopBar title="My Activity" icon={Activity} breadcrumb={[{ label: 'Tracking' }, { label: 'My Activity' }]} />
      <div style={{ padding: isMobile ? '16px' : '28px', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Recently Accessed */}
            <SectionCard title="Recently Accessed" Icon={Clock} iconColor="#306196" count={recent.length}>
              {recent.length === 0 ? (
                <EmptyState message="No recent activity yet." />
              ) : (
                <div style={{ borderTop: '1px solid #E5E7EB', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '500px' }}>
                    <colgroup>
                      <col />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '110px' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {thCell('Document', FileText)}
                        {thCell('Action', Activity)}
                        {thCell('When', Calendar)}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r, i) => {
                        const td = {
                          padding: '0 18px', height: '56px', fontSize: '13px', color: '#374151',
                          borderBottom: i < recent.length - 1 ? '1px solid #E5E7EB' : 'none',
                          verticalAlign: 'middle',
                          backgroundColor: hoveredRecent === i ? '#F5F8FC' : '#FFFFFF',
                          transition: 'background 100ms ease',
                        };
                        return (
                          <tr key={i} onMouseEnter={() => setHoveredRecent(i)} onMouseLeave={() => setHoveredRecent(null)}>
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <FileText size={12} color="#6B7280" />
                                </div>
                                <span style={{ fontWeight: '600', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{r.name}</span>
                              </div>
                            </td>
                            <td style={td}><ActionBadge action={r.action} /></td>
                            <td style={{ ...td, color: '#6B7280', fontSize: '12px' }}>
                              {new Date(r.lastAccessedAt).toLocaleDateString('en-GB')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Acknowledgements */}
            <SectionCard title="My Acknowledgements" Icon={ShieldCheck} iconColor="#059669" count={acks.length}>
              {acks.length === 0 ? (
                <EmptyState message="No documents acknowledged yet." />
              ) : (
                <div style={{ borderTop: '1px solid #E5E7EB', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '500px' }}>
                    <colgroup>
                      <col />
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '110px' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {thCell('Document', FileText)}
                        {thCell('Folder', null)}
                        {thCell('Date', Calendar)}
                      </tr>
                    </thead>
                    <tbody>
                      {acks.map((a, i) => {
                        const td = {
                          padding: '0 18px', height: '56px', fontSize: '13px', color: '#374151',
                          borderBottom: i < acks.length - 1 ? '1px solid #E5E7EB' : 'none',
                          verticalAlign: 'middle',
                          backgroundColor: hoveredAck === a.id ? '#F5F8FC' : '#FFFFFF',
                          transition: 'background 100ms ease',
                          cursor: 'pointer',
                        };
                        return (
                          <tr key={a.id}
                            onClick={() => navigate(`/directory/${a.document.folderId}`)}
                            onMouseEnter={() => setHoveredAck(a.id)}
                            onMouseLeave={() => setHoveredAck(null)}
                          >
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <ShieldCheck size={12} color="#059669" />
                                </div>
                                <span style={{ fontWeight: '600', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{a.document.name}</span>
                              </div>
                            </td>
                            <td style={{ ...td, color: '#6B7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.document.folder?.name || '—'}
                            </td>
                            <td style={{ ...td, color: '#6B7280', fontSize: '12px' }}>
                              {new Date(a.acknowledgedAt).toLocaleDateString('en-GB')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

          </div>
        )}
      </div>
    </div>
  );
}
