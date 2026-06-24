import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useSidebar } from '../../context/SidebarContext.jsx';
import useIsMobile from '../../hooks/useIsMobile.js';
import SearchBar from '../ui/SearchBar.jsx';
import NotificationBell from './NotificationBell.jsx';
import { User, LogOut, ChevronDown, ChevronRight, Menu } from 'lucide-react';

const ROLE_BADGE = {
  admin:  { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA',  avatarBg: '#306196'  },
  member: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0',  avatarBg: '#306196'  },
  viewer: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A',  avatarBg: '#306196'  },
};

export default function TopBar({ title, subtitle, icon: PageIcon, breadcrumb, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const { setSidebarOpen } = useSidebar();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const role = ROLE_BADGE[user?.role] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', avatarBg: '#6B7280' };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { setOpen(false); await logout(); navigate('/login'); };

  const menuItem = (Icon, label, onClick, danger) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        width: '100%', padding: '8px 12px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left',
        fontSize: '13px', fontWeight: '500',
        color: danger ? '#DC2626' : '#374151',
        borderRadius: '6px', transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = danger ? '#FEF2F2' : '#F7F8FA'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: danger ? '#FEE2E2' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={danger ? '#DC2626' : '#6B7280'} />
      </div>
      {label}
    </button>
  );

  return (
    <div style={{
      height: '65px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Left: icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'none', border: '1px solid #E5E7EB',
              cursor: 'pointer', flexShrink: 0, color: '#374151',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu size={18} color="#374151" />
          </button>
        )}
        {PageIcon && (
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EEF4FF', border: '1px solid #D6E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PageIcon size={17} color="#306196" />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1px' }}>
          {breadcrumb && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {breadcrumb.map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i > 0 && <ChevronRight size={11} color="#C4C9D4" />}
                  {crumb.to ? (
                    <Link to={crumb.to} style={{ fontSize: '11px', fontWeight: '600', color: '#306196', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >{crumb.label}</Link>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: '600', color: '#1D3A5A', margin: 0, letterSpacing: '-0.2px' }}>{title}</h1>
            {subtitle && (
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actions}
        {!isMobile && <SearchBar />}
        <NotificationBell />
        <div style={{ width: '1px', height: '22px', backgroundColor: '#E5E7EB', margin: '0 2px' }} />

        {/* User trigger */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', cursor: 'pointer',
              padding: '5px 10px 5px 5px',
              borderRadius: '10px',
              border: `1px solid ${open ? '#D1D5DB' : 'transparent'}`,
              backgroundColor: open ? '#F7F8FA' : 'transparent',
              transition: 'background 0.1s, border-color 0.1s',
            }}
            onMouseEnter={e => { if (!open) { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#E5E7EB'; } }}
            onMouseLeave={e => { if (!open) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
          >
            {/* Avatar */}
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
              backgroundColor: role.avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '800', color: '#FFFFFF',
            }}>
              {initials}
            </div>

            {/* Name only — hidden on mobile */}
            {!isMobile && (
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#112235', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </span>
            )}

            <ChevronDown size={12} color="#9CA3AF" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '220px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              {/* Profile header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: role.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || `@${user?.username}`}</div>
                </div>
              </div>

              {/* Role badge strip */}
              <div style={{ padding: '8px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Role</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: role.color, backgroundColor: role.bg, border: `1px solid ${role.border}`, borderRadius: '4px', padding: '1px 6px', textTransform: 'capitalize', letterSpacing: '0.03em' }}>
                  {user?.role}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '6px' }}>
                {menuItem(User, 'Account Settings', () => { setOpen(false); navigate('/profile'); })}
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', padding: '6px' }}>
                {menuItem(LogOut, 'Sign out', handleLogout, true)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
