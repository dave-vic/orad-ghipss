import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Folder, ClipboardList, Users, LogOut, Inbox, History, ClipboardCheck, UserPlus, ChevronDown, User, X, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import api from '../../api/axios.js';

export default function Sidebar({ isMobile = false, isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [usersOpen, setUsersOpen] = useState(
    location.pathname.startsWith('/users') || location.pathname.startsWith('/requests')
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItem = (to, label, Icon) => (
    <NavLink key={to} to={to} onClick={() => isMobile && onClose()} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '7px 16px', margin: '1px 8px',
      textDecoration: 'none', borderRadius: '6px', fontSize: '13px',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? '#306196' : '#374151',
      backgroundColor: isActive ? '#E8F0F8' : 'transparent',
      borderLeft: isActive ? '2px solid #306196' : '2px solid transparent',
      transition: 'background 0.1s, color 0.1s',
    })}>
      {({ isActive }) => (
        <>
          <Icon size={14} color={isActive ? '#306196' : '#6B7280'} />
          {label}
        </>
      )}
    </NavLink>
  );

  const userMgmtActive = location.pathname.startsWith('/users');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetch = () => api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count)).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    const reset = () => setUnreadCount(0);
    window.addEventListener('notifications-cleared', reset);
    return () => { clearInterval(interval); window.removeEventListener('notifications-cleared', reset); };
  }, []);

  const mobileNavLink = (to) => {
    if (isMobile) onClose();
  };

  return (
    <div style={{
      width: '220px', flexShrink: 0,
      backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column',
      ...(isMobile ? {
        position: 'fixed', top: 0, left: isOpen ? 0 : '-260px',
        height: '100vh', zIndex: 1000,
        transition: 'left 0.25s ease',
        overflowY: 'auto',
        boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
      } : {
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }),
    }}>
      {/* Brand */}
      <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1B3A5C' }}>
        <img src="/orad-logo.svg" alt="ORAD"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0' }}>

        {/* WORKSPACE */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ padding: '0 16px 5px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WORKSPACE</div>
          {navItem('/dashboard', 'Dashboard', LayoutDashboard)}
          {navItem('/directory', 'Directory', Folder)}
        </div>

        {/* TRACKING */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ padding: '0 16px 5px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TRACKING</div>
          {navItem('/my-activity', 'My Activity', History)}
          {navItem('/my-requests', 'My Requests', ClipboardCheck)}
          <NavLink to="/notifications" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 16px', margin: '1px 8px',
            textDecoration: 'none', borderRadius: '6px', fontSize: '13px',
            fontWeight: isActive ? '600' : '400',
            color: isActive ? '#306196' : '#374151',
            backgroundColor: isActive ? '#E8F0F8' : 'transparent',
            borderLeft: isActive ? '2px solid #306196' : '2px solid transparent',
            transition: 'background 0.1s, color 0.1s',
          })}>
            {({ isActive }) => (
              <>
                <Bell size={14} color={isActive ? '#306196' : '#6B7280'} />
                <span style={{ flex: 1 }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#FFFFFF', backgroundColor: '#306196', borderRadius: '10px', padding: '1px 6px', minWidth: '16px', textAlign: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </div>

        {/* ADMINISTRATION — admin only */}
        {user?.role === 'admin' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ padding: '0 16px 5px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ADMINISTRATION</div>

            {/* User Management — collapsible */}
            <button
              onClick={() => setUsersOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: 'calc(100% - 16px)', margin: '1px 8px',
                padding: '7px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: '6px', fontSize: '13px',
                fontWeight: userMgmtActive ? '600' : '400',
                color: userMgmtActive ? '#306196' : '#374151',
                backgroundColor: userMgmtActive && !usersOpen ? '#E8F0F8' : 'transparent',
                borderLeft: userMgmtActive && !usersOpen ? '2px solid #306196' : '2px solid transparent',
                transition: 'background 0.1s, color 0.1s',
                textAlign: 'left',
              }}
            >
              <Users size={14} color={userMgmtActive ? '#306196' : '#6B7280'} />
              <span style={{ flex: 1 }}>User Management</span>
              <ChevronDown size={12} color="#9CA3AF" style={{ transform: usersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Sub-items */}
            {usersOpen && (
              <div style={{ marginLeft: '16px', borderLeft: '1px solid #E5E7EB', paddingLeft: '4px' }}>
                <NavLink to="/users" end style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', margin: '1px 4px',
                  textDecoration: 'none', borderRadius: '5px', fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#306196' : '#374151',
                  backgroundColor: isActive ? '#E8F0F8' : 'transparent',
                  transition: 'background 0.1s',
                })}>
                  {({ isActive }) => (
                    <>
                      <Users size={12} color={isActive ? '#306196' : '#9CA3AF'} />
                      All Users
                    </>
                  )}
                </NavLink>
                <NavLink to="/users/import" style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', margin: '1px 4px',
                  textDecoration: 'none', borderRadius: '5px', fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#306196' : '#374151',
                  backgroundColor: isActive ? '#E8F0F8' : 'transparent',
                  transition: 'background 0.1s',
                })}>
                  {({ isActive }) => (
                    <>
                      <UserPlus size={12} color={isActive ? '#306196' : '#9CA3AF'} />
                      Bulk Import
                    </>
                  )}
                </NavLink>
              </div>
            )}

            {navItem('/requests', 'Access Requests', Inbox)}
            {navItem('/activity', 'Activity Log', ClipboardList)}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #E5E7EB' }}>
        {/* Account Settings */}
        <button
          onClick={() => navigate('/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '400', color: '#374151', width: '100%', textAlign: 'left', transition: 'background 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <User size={14} color="#6B7280" />
          Account Settings
        </button>

        {/* Sign out */}
        <div style={{ padding: '6px 16px 16px' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '7px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', transition: 'color 0.1s, background 0.1s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && createPortal(
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '400px', backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden' }}
          >
            {/* Gradient top band */}
            <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '28px 28px 32px', position: 'relative', overflow: 'hidden' }}>
              {/* decorative orb */}
              <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={() => setShowLogoutConfirm(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* icon + text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={22} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px', marginBottom: '4px' }}>Sign out</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>ORAD — GhIPSS Operations Portal</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* User card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#F7F8FA', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#306196', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || `@${user?.username}`}</div>
                </div>
                <div style={{ marginLeft: 'auto', padding: '3px 9px', backgroundColor: '#EEF4FF', border: '1px solid #C7DEFF', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: '#306196', textTransform: 'capitalize', flexShrink: 0 }}>
                  {user?.role}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 22px', textAlign: 'center' }}>
                Are you sure you want to sign out? You'll need to enter your credentials to access ORAD again.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  Stay signed in
                </button>
                <button
                  onClick={handleLogout}
                  style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#FFFFFF', cursor: 'pointer', transition: 'opacity 0.1s', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Yes, sign out
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
