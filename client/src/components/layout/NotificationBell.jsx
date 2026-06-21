import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const loadCount = () => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    const reset = () => setUnread(0);
    window.addEventListener('notifications-cleared', reset);
    return () => { clearInterval(interval); window.removeEventListener('notifications-cleared', reset); };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    if (!open) {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    }
    setOpen(o => !o);
  };

  const handleMarkAllRead = async () => {
    await api.post('/notifications/mark-read');
    setUnread(0);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      await api.patch(`/notifications/${notif.id}/read`);
      setUnread(u => Math.max(0, u - 1));
      setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x));
    }
    setOpen(false);
    if (notif.linkUrl) navigate(notif.linkUrl);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{ position: 'relative', background: 'none', border: '1px solid #D0DCE8', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#4A6080', display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Bell size={16} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#C0392B', color: '#FFFFFF', borderRadius: '999px', fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #EBF1F7' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '44px', right: 0, width: '340px', backgroundColor: '#FFFFFF', border: '1px solid #D0DCE8', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #EBF1F7' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1C2D3E' }}>Notifications</span>
            {unread > 0 && <button onClick={handleMarkAllRead} style={{ fontSize: '12px', color: '#4A6080', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Mark all read</button>}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#6B849A', fontSize: '13px' }}>No notifications yet.</div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => handleClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid #F4F6F8', cursor: 'pointer', backgroundColor: n.read ? '#FFFFFF' : '#F0F6FF', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = n.read ? '#FFFFFF' : '#F0F6FF'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: n.read ? '400' : '600', color: '#1C2D3E', marginBottom: '2px' }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: '12px', color: '#6B849A' }}>{n.body}</div>}
                  </div>
                  {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F1C2E', flexShrink: 0, marginTop: '4px' }} />}
                </div>
                <div style={{ fontSize: '11px', color: '#8FA5BE', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          {/* See all link */}
          <div style={{ borderTop: '1px solid #EBF1F7', padding: '10px 16px' }}>
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              style={{ width: '100%', padding: '8px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#306196', cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF4FF'; e.currentTarget.style.borderColor = '#306196'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
