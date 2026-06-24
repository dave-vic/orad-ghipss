import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Upload, Users, Folder, TrendingUp, Clock,
  AlertTriangle, FileText, Star, ArrowUpRight, Activity, X, LogIn, LogOut,
  Sun, Sunset, Moon, ChevronRight, Zap, ClipboardList,
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import TopBar from '../components/layout/TopBar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';

const ACTION_META = {
  download:     { label: 'Download',  color: '#2563EB', bg: '#DBEAFE',  border: '#BFDBFE', Icon: Download },
  upload:       { label: 'Upload',    color: '#059669', bg: '#D1FAE5',  border: '#A7F3D0', Icon: Upload },
  delete:       { label: 'Delete',    color: '#DC2626', bg: '#FEE2E2',  border: '#FECACA', Icon: FileText },
  login:        { label: 'Login',     color: '#D97706', bg: '#FEF3C7',  border: '#FDE68A', Icon: LogIn },
  logout:       { label: 'Logout',    color: '#6B7280', bg: '#F3F4F6',  border: '#E5E7EB', Icon: LogOut },
  view:         { label: 'View',      color: '#059669', bg: '#D1FAE5',  border: '#A7F3D0', Icon: FileText },
  folder_delete:{ label: 'Deleted',   color: '#DC2626', bg: '#FEE2E2',  border: '#FECACA', Icon: Folder },
  acknowledge:  { label: 'Acknowledge', color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE', Icon: FileText },
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getGreetingIcon() {
  const h = new Date().getHours();
  if (h < 12) return <Sun size={20} color="#FFFFFF" />;
  if (h < 17) return <Sunset size={20} color="#FFFFFF" />;
  return <Moon size={20} color="#FFFFFF" />;
}

function todayStr() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function InitialsAvatar({ name, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#306196', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{ width: size, height: size, borderRadius: '9px', backgroundColor: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, Icon, color, bg, sub, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hovered && onClick ? color + '40' : '#E5E7EB'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        flex: 1,
        minWidth: '120px',
        boxShadow: hovered && onClick ? `0 4px 16px ${color}14` : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        transform: hovered && onClick ? 'translateY(-1px)' : 'none',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}
    >
      {/* Colored icon box */}
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#112235', letterSpacing: '-0.8px', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>{sub}</div>}
      </div>
      {/* Arrow for clickable */}
      {onClick && <ArrowUpRight size={13} color={hovered ? color : '#D1D5DB'} style={{ flexShrink: 0, transition: 'color 0.15s' }} />}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [dismissedInsights, setDismissedInsights] = useState(new Set());
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData({ stats: {}, recentActivity: [], topDocuments: [], staleDocuments: [], insights: [] }))
      .finally(() => setLoading(false));
    api.get('/favourites').then(r => setFavourites(r.data)).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
        <TopBar title={`Good ${getTimeOfDay()}, ${user?.name?.split(' ')[0]}`} />
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hero skeleton */}
          <div style={{ height: '120px', borderRadius: '16px', background: 'linear-gradient(90deg, #0F2744 0%, #1B3A5C 100%)', opacity: 0.6 }} />
          {/* Stat skeletons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ flex: 1, height: '72px', borderRadius: '12px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', border: '1px solid #E5E7EB' }} />
            ))}
          </div>
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
      <TopBar title={`Good ${getTimeOfDay()}, ${user?.name?.split(' ')[0]}`} />

      <div style={{ padding: isMobile ? '16px' : '24px 32px 32px', flex: 1 }}>

        {/* ── Hero banner ── */}
        <div style={{ background: 'linear-gradient(135deg, #0A1F3C 0%, #0F2744 40%, #1B3A5C 75%, #245A8A 100%)', borderRadius: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>

          {/* Background decoration */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.07 }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
            <circle cx="700" cy="-40" r="180" fill="white" />
            <circle cx="750" cy="220" r="120" fill="white" />
            <circle cx="100" cy="180" r="100" fill="white" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '340px', background: 'linear-gradient(90deg, transparent, rgba(96,160,220,0.08))', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>

            {/* Top badges */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin && data?.stats?.pendingRequests > 0 && (
                <button
                  onClick={() => navigate('/requests')}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 13px', backgroundColor: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: '10px', color: '#FCA5A5', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.2)'; }}
                >
                  <AlertTriangle size={13} />
                  {data.stats.pendingRequests} pending
                  <ArrowUpRight size={12} />
                </button>
              )}
              <span style={{ padding: '6px 13px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize', letterSpacing: '0.07em' }}>
                {user?.role}
              </span>
            </div>

            {/* Icon */}
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              {getGreetingIcon()}
            </div>

            {/* Greeting */}
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '8px' }}>
              Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}!
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
              <Clock size={11} color="rgba(255,255,255,0.3)" /> {todayStr()}
            </div>

          </div>
        </div>

        {/* ── Stat cards ── */}
        {data && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <StatCard label="Total Documents" value={data.stats?.totalDocs ?? 0} Icon={FileText} color="#306196" bg="#EEF4FF" sub="across all folders" />
            {isAdmin && <StatCard label="Active Users" value={data.stats?.totalUsers ?? 0} Icon={Users} color="#306196" bg="#EEF4FF" sub="registered accounts" />}
            <StatCard label="Downloads" value={data.stats?.recentDownloads ?? 0} Icon={Download} color="#306196" bg="#EEF4FF" sub="last 30 days" />
            {isAdmin && <StatCard label="Uploads" value={data.stats?.recentUploads ?? 0} Icon={Upload} color="#306196" bg="#EEF4FF" sub="last 30 days" />}
            {!isAdmin && <StatCard label="My Requests" value={data.stats?.myRequests ?? 0} Icon={Folder} color="#306196" bg="#EEF4FF" sub="access requests" onClick={() => navigate('/requests')} />}
          </div>
        )}

        {/* ── Insights ── */}
        {data?.insights?.filter((_, i) => !dismissedInsights.has(i)).length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.insights.map((msg, i) => dismissedInsights.has(i) ? null : (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '13px', color: '#92400E' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={13} color="#D97706" />
                </div>
                <span style={{ flex: 1, fontWeight: '500' }}>{msg}</span>
                <button onClick={() => setDismissedInsights(s => new Set([...s, i]))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#B45309', borderRadius: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF3C7'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick Access (favourites) ── */}
        {favourites.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={10} color="#9CA3AF" /> Quick Access
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {favourites.map(f => (
                <button key={f.id}
                  onClick={() => navigate(f.type === 'folder' ? `/directory/${f.targetId}` : `/directory`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', color: '#374151', cursor: 'pointer', fontWeight: '600', transition: 'all 0.12s', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#306196'; e.currentTarget.style.color = '#306196'; e.currentTarget.style.backgroundColor = '#EEF4FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  {f.type === 'folder' ? <Folder size={12} color="#306196" /> : <FileText size={12} color="#306196" />}
                  {f.targetName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content grid ── */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin && !isMobile ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'start' }}>

            {/* Left: Recent Activity */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={15} color="#306196" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>Recent Activity</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Latest actions across the platform</div>
                  </div>
                </div>
                <button onClick={() => navigate('/activity-log')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#306196', background: 'none', border: '1px solid #E5E7EB', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', transition: 'all 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF4FF'; e.currentTarget.style.borderColor = '#306196'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  View all <ChevronRight size={11} />
                </button>
              </div>
              {!data.recentActivity?.length ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No activity recorded yet.</div>
              ) : data.recentActivity.map((log, idx) => {
                const meta = ACTION_META[log.action] || { label: log.action, color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', Icon: Activity };
                const ActIcon = meta.Icon;
                const isLast = idx === data.recentActivity.length - 1;
                const primaryLabel = isAdmin ? (log.user?.name || 'Unknown user') : (log.targetName || '—');
                const secondaryLabel = isAdmin
                  ? (log.targetName || (log.action === 'login' || log.action === 'logout' ? 'Session event' : null))
                  : null;
                return (
                  <div key={log.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFBFF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Icon badge */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ActIcon size={14} color={meta.color} />
                    </div>

                    {/* Avatar (admin only) */}
                    {isAdmin && <InitialsAvatar name={log.user?.name || '?'} size={30} />}

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#112235', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {primaryLabel}
                      </div>
                      {secondaryLabel && (
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondaryLabel}</div>
                      )}
                    </div>

                    {/* Action badge */}
                    <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                      {meta.label}
                    </span>

                    {/* Time */}
                    <span style={{ fontSize: '11px', color: '#C4C9D4', whiteSpace: 'nowrap', minWidth: '50px', textAlign: 'right' }}>
                      {relativeTime(log.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right column */}
            {isAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Most Downloaded */}
                {data.topDocuments?.length > 0 && (
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp size={13} color="#059669" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>Most Downloaded</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>last 30 days</span>
                    </div>
                    {data.topDocuments.map((doc, i) => (
                      <div key={doc.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', borderBottom: i < data.topDocuments.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: i === 0 ? '#D1FAE5' : i === 1 ? '#DBEAFE' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: i === 0 ? '#059669' : i === 1 ? '#2563EB' : '#9CA3AF', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>{doc.folderName || 'a folder'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: '#D1FAE5', borderRadius: '6px', padding: '2px 7px', border: '1px solid #A7F3D0' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>{doc.downloads}</span>
                          <Download size={9} color="#059669" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stale Documents */}
                {data.staleDocuments?.length > 0 && (
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={13} color="#DC2626" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#112235' }}>Stale Documents</span>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>{data.staleDocuments.length}</span>
                    </div>
                    {data.staleDocuments.map((doc, i) => (
                      <div key={doc.id}
                        onClick={() => navigate(`/directory/${doc.folderId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', borderBottom: i < data.staleDocuments.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={12} color="#DC2626" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>Not accessed in 90+ days</div>
                        </div>
                        <ChevronRight size={13} color="#9CA3AF" />
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
