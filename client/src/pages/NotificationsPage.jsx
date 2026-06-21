import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ArrowRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import TopBar from '../components/layout/TopBar.jsx';
import Toast from '../components/ui/Toast.jsx';

const TYPE_STYLE = {
  access_request:          { color: '#D97706', bg: '#FEF3C7', label: 'Access Request' },
  access_request_reviewed: { color: '#059669', bg: '#D1FAE5', label: 'Reviewed' },
  access_approved:         { color: '#059669', bg: '#D1FAE5', label: 'Approved' },
  access_denied:           { color: '#DC2626', bg: '#FEE2E2', label: 'Denied' },
  upload:                  { color: '#306196', bg: '#EEF4FF', label: 'Upload' },
  comment_added:           { color: '#7C3AED', bg: '#EDE9FE', label: 'Comment' },
  comment:                 { color: '#7C3AED', bg: '#EDE9FE', label: 'Comment' },
  pending_requests:        { color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  stale_docs:              { color: '#6B7280', bg: '#F3F4F6', label: 'Stale Docs' },
  default:                 { color: '#6B7280', bg: '#F3F4F6', label: 'Notice' },
};

// Fallback destinations for notifications that may have wrong/missing linkUrl
const TYPE_FALLBACK = {
  pending_requests:        '/requests',
  access_request:          '/requests',
  access_request_reviewed: '/my-requests',
  access_approved:         '/my-requests',
  access_denied:           '/my-requests',
  stale_docs:              '/directory',
  upload:                  '/directory',
  comment_added:           '/directory',
  comment:                 '/directory',
};

function typeStyle(type) {
  return TYPE_STYLE[type] || TYPE_STYLE.default;
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .catch(() => setToast({ message: 'Failed to load notifications', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.post('/notifications/mark-read');
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    window.dispatchEvent(new Event('notifications-cleared'));
    setToast({ message: 'All notifications marked as read', type: 'success' });
  };

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const resolveUrl = (notif) => {
    if (notif.linkUrl && notif.linkUrl !== '/access-requests') return notif.linkUrl;
    return TYPE_FALLBACK[notif.type] || null;
  };

  const handleClick = async (notif) => {
    if (!notif.read) await markOne(notif.id);
    const url = resolveUrl(notif);
    if (url) navigate(url);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F8FA' }}>
      <TopBar
        title="Notifications"
        icon={Bell}
        actions={
          unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <CheckCheck size={14} color="#306196" />
              Mark all read
            </button>
          )
        }
      />

      <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Summary row */}
        {!loading && notifications.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
            {unreadCount > 0 && (
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#306196', backgroundColor: '#EEF4FF', padding: '2px 8px', borderRadius: '6px' }}>
                {unreadCount} unread
              </span>
            )}
          </div>
        )}

        {/* Card list */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', flex: loading || notifications.length === 0 ? 'unset' : 1 }}>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[1, 2, 3, 4, 5].map((i, idx) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: idx < 4 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '13px', width: '40%', backgroundColor: '#F3F4F6', borderRadius: '5px' }} />
                    <div style={{ height: '11px', width: '65%', backgroundColor: '#F3F4F6', borderRadius: '5px' }} />
                  </div>
                  <div style={{ height: '11px', width: '50px', backgroundColor: '#F3F4F6', borderRadius: '5px', flexShrink: 0 }} />
                </div>
              ))}
            </div>

          ) : notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Inbox size={26} color="#306196" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#112235', marginBottom: '6px' }}>All caught up</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No notifications yet. You'll see updates here.</div>
            </div>

          ) : (
            notifications.map((n, idx) => {
              const ts = typeStyle(n.type);
              const isLast = idx === notifications.length - 1;
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 24px',
                    borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
                    backgroundColor: n.read ? '#FFFFFF' : '#F5F9FF',
                    cursor: resolveUrl(n) ? 'pointer' : 'default',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = n.read ? '#F7F8FA' : '#EEF4FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = n.read ? '#FFFFFF' : '#F5F9FF'; }}
                >
                  {/* Unread indicator stripe */}
                  <div style={{ width: '3px', height: '40px', borderRadius: '2px', backgroundColor: n.read ? 'transparent' : '#306196', flexShrink: 0 }} />

                  {/* Icon badge */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color={ts.color} />
                  </div>

                  {/* Main content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: n.body ? '3px' : 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: n.read ? '500' : '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: ts.color, backgroundColor: ts.bg, padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>{ts.label}</span>
                    </div>
                    {n.body && (
                      <div style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                    )}
                  </div>

                  {/* Right: timestamp + arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
                    {resolveUrl(n)
                      ? <ArrowRight size={14} color="#C4C9D4" />
                      : <div style={{ width: '14px' }} />
                    }
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
