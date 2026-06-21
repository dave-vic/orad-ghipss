import { useState, useEffect } from 'react';
import { X, User, SlidersHorizontal, Bell, Link2, Lock, Monitor, AlertTriangle, KeyRound, Smartphone } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../hooks/useAuth.js';
import TwoFactorSetup from './TwoFactorSetup.jsx';

/* ─── Shared primitives ─── */
const ROLE_META = {
  admin:  { color: '#DC2626', bg: '#FEE2E2' },
  member: { color: '#059669', bg: '#D1FAE5' },
  viewer: { color: '#D97706', bg: '#FEF3C7' },
};

function Avatar({ name, role, size = 56 }) {
  const m = ROLE_META[role] || { color: '#6B7280', bg: '#F3F4F6' };
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: m.bg, border: `2px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: '800', color: m.color, flexShrink: 0, letterSpacing: '-1px' }}>
      {name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch" aria-checked={value} onClick={() => onChange(!value)}
      style={{ width: '40px', height: '22px', borderRadius: '11px', backgroundColor: value ? '#306196' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms ease', flexShrink: 0, padding: 0 }}
    >
      <span style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function Divider() { return <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '12px 0 20px' }} />; }

function SecRow({ label, desc, action, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: last ? 'none' : '1px solid #E5E7EB' }}>
      <div style={{ flex: 1, marginRight: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#112235' }}>{label}</div>
        {desc && <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{desc}</div>}
      </div>
      {action}
    </div>
  );
}

const ghostAction = (label, onClick) => (
  <button onClick={onClick || (() => {})}
    style={{ padding: '7px 14px', fontSize: '13px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'border-color 0.1s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
  >{label}</button>
);

const dangerAction = (label, onClick) => (
  <button onClick={onClick || (() => {})}
    style={{ padding: '7px 14px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
  >{label}</button>
);

/* ─── Left Nav ─── */
const LEFT_NAV = [
  { group: 'Account', items: [
    { key: 'profile',       Icon: User,             isUserRow: true },
    { key: 'preferences',   Icon: SlidersHorizontal, label: 'Preferences' },
    { key: 'notifications', Icon: Bell,              label: 'Notifications' },
    { key: 'connections',   Icon: Link2,             label: 'Connections' },
  ]},
  { group: 'Security', items: [
    { key: 'security',   Icon: Lock,          label: 'Password & Security' },
    { key: 'sessions',   Icon: Monitor,       label: 'Sessions' },
    { key: 'danger',     Icon: AlertTriangle, label: 'Danger Zone' },
  ]},
];

/* ─── Right panel sections ─── */
function SectionProfile({ data, onRefresh }) {
  const [name, setName]       = useState(data?.name || '');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const role = ROLE_META[data?.role] || { color: '#6B7280', bg: '#F3F4F6' };

  const saveName = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      onRefresh();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Profile</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage your profile, login information, and devices</p>

      <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235' }}>Account</div>
      <Divider />

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Avatar name={data?.name} role={data?.role} size={56} />
          <button style={{ fontSize: '12px', color: '#306196', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Change photo</button>
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Preferred name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            style={{ width: '220px', padding: '8px 12px', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#306196'}
          />
          {saved && <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Saved</div>}
        </div>
      </div>

      {/* Info rows */}
      {[
        { label: 'Email address', value: data?.email },
        { label: 'Username', value: `@${data?.username}` },
        { label: 'Member since', value: data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
      ].map(r => (
        <div key={r.label} style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#112235', marginBottom: '2px' }}>{r.label}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{r.value}</div>
        </div>
      ))}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#112235', marginBottom: '6px' }}>Role</div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: role.color, backgroundColor: role.bg }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: role.color }} />
          {data?.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : ''}
        </span>
      </div>

      {/* Account security */}
      <div style={{ marginTop: '40px', fontSize: '15px', fontWeight: '700', color: '#112235' }}>Account security</div>
      <Divider />
      <SecRow label="Email" desc={data?.email} action={ghostAction('Manage emails')} />
      <SecRow label="Password" desc="Set a password for your account" action={ghostAction('Change password')} />
      <SecRow label="Two-step verification" desc="Add another layer of security to your account" action={ghostAction('Add verification method')} />
      <SecRow label="Passkeys" desc="Sign in with on-device biometric authentication" action={ghostAction('Add passkey')} last />

      {/* Support */}
      <SupportSection />

      {/* Danger */}
      <DangerSection />
    </>
  );
}

function SupportSection() {
  const [on, setOn] = useState(false);
  return (
    <>
      <div style={{ marginTop: '40px', fontSize: '15px', fontWeight: '700', color: '#112235' }}>Support</div>
      <Divider />
      <SecRow
        label="Support access"
        desc="Grant MojoPay ops team temporary access to troubleshoot your account. You can revoke access anytime."
        action={<Toggle value={on} onChange={setOn} />}
        last
      />
    </>
  );
}

function DangerSection() {
  return (
    <>
      <div style={{ marginTop: '40px', fontSize: '15px', fontWeight: '700', color: '#112235' }}>Delete my account</div>
      <Divider />
      <SecRow
        label="Delete my account"
        desc="Permanently delete your account. You will lose all access immediately."
        action={dangerAction('Delete my account')}
        last
      />
    </>
  );
}

function SectionPreferences() {
  const [lang, setLang]     = useState('English');
  const [tz, setTz]         = useState('Africa/Accra (GMT+0)');
  const [fmt, setFmt]       = useState('DD/MM/YYYY');

  const selStyle = { padding: '7px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#112235', cursor: 'pointer', outline: 'none' };

  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Preferences</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Customise your ORAD experience</p>
      <Divider />
      <SecRow label="Language" desc="Preferred display language" action={<select value={lang} onChange={e => setLang(e.target.value)} style={selStyle}><option>English</option><option>French</option></select>} />
      <SecRow label="Timezone" desc="Used for timestamps and reports" action={<select value={tz} onChange={e => setTz(e.target.value)} style={selStyle}><option>Africa/Accra (GMT+0)</option><option>UTC</option><option>Africa/Lagos (GMT+1)</option></select>} />
      <SecRow label="Date format" action={<select value={fmt} onChange={e => setFmt(e.target.value)} style={selStyle}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>} last />
    </>
  );
}

function SectionNotifications() {
  const [prefs, setPrefs] = useState({ email: true, download: true, login: true, digest: false });
  const set = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }));
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Notifications</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Control what notifications you receive</p>
      <Divider />
      <SecRow label="Email notifications" desc="Receive emails for key events" action={<Toggle value={prefs.email} onChange={set('email')} />} />
      <SecRow label="Download alerts" desc="Notify when your documents are downloaded" action={<Toggle value={prefs.download} onChange={set('download')} />} />
      <SecRow label="Login alerts" desc="Alert on new login from an unrecognised device" action={<Toggle value={prefs.login} onChange={set('login')} />} />
      <SecRow label="Weekly digest" desc="Summary of platform activity every Monday" action={<Toggle value={prefs.digest} onChange={set('digest')} />} last />
    </>
  );
}

function SectionSecurity({ data, onRefresh, onToast }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const changePw = async () => {
    if (form.next !== form.confirm) { setPwErr('Passwords do not match'); return; }
    if (form.next.length < 8)       { setPwErr('Must be at least 8 characters'); return; }
    setPwSaving(true); setPwErr('');
    try {
      await api.patch('/auth/password', { currentPassword: form.current, newPassword: form.next });
      setForm({ current: '', next: '', confirm: '' });
      onToast?.('Password changed successfully');
    } catch (err) { setPwErr(err.response?.data?.error || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  const inp = { width: '100%', padding: '8px 12px', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box' };

  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Password & Security</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage your password and two-factor authentication</p>

      <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235' }}>Change password</div>
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {[['current', 'Current password'], ['next', 'New password (min 8 chars)'], ['confirm', 'Confirm new password']].map(([k, lbl]) => (
          <div key={k}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</div>
            <input type="password" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inp}
              onFocus={e => e.target.style.borderColor = '#306196'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        ))}
        {pwErr && <div style={{ fontSize: '12px', color: '#DC2626' }}>{pwErr}</div>}
        <button onClick={changePw} disabled={pwSaving}
          style={{ alignSelf: 'flex-start', padding: '8px 18px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: pwSaving ? 0.6 : 1 }}>
          {pwSaving ? 'Saving…' : 'Update password'}
        </button>
      </div>

      <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235' }}>Two-factor authentication</div>
      <Divider />
      {data && <TwoFactorSetup user={data} onUpdated={onRefresh} />}
    </>
  );
}

function SectionSessions() {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/auth/sessions'), api.get('/auth/login-history').catch(() => ({ data: [] }))])
      .then(([s, h]) => { setSessions(s.data); setHistory(h.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id) => { await api.delete(`/auth/sessions/${id}`); load(); };

  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Sessions</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage active sessions and review login history</p>

      <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235' }}>Active sessions</div>
      <Divider />
      {loading ? <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Loading…</div> :
        sessions.length === 0 ? <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No active sessions found.</div> :
        sessions.map((s, idx) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: idx === sessions.length - 1 ? 'none' : '1px solid #E5E7EB' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#112235' }}>{s.userAgent?.split(' ')[0] || 'Unknown device'}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{s.ipAddress} · {new Date(s.createdAt).toLocaleString()}</div>
            </div>
            {idx === 0 ? (
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#059669', backgroundColor: '#D1FAE5' }}>Current</span>
            ) : (
              <button onClick={() => revoke(s.id)}
                style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', cursor: 'pointer' }}>
                Revoke
              </button>
            )}
          </div>
        ))
      }

      {history.length > 0 && (
        <>
          <div style={{ marginTop: '40px', fontSize: '15px', fontWeight: '700', color: '#112235' }}>Login history</div>
          <Divider />
          {history.slice(0, 10).map((h, idx) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx === Math.min(history.length, 10) - 1 ? 'none' : '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: h.action === 'login' ? '#D1FAE5' : '#FEE2E2', color: h.action === 'login' ? '#059669' : '#DC2626' }}>
                  {h.action?.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{h.ipAddress}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{new Date(h.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function SectionConnections() {
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Connections</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage connected apps and integrations</p>
      <Divider />
      <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '32px 0', textAlign: 'center' }}>No connections configured.</div>
    </>
  );
}

/* ─── Main export ─── */
export default function ProfileModal({ onClose }) {
  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState('profile');
  const [data, setData] = useState(null);
  const [toast, setToast] = useState('');

  const load = () => {
    api.get('/auth/profile').then(r => setData(r.data)).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const navItemStyle = (key) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '6px 10px', borderRadius: '6px',
    fontSize: '13px', fontWeight: activeKey === key ? '500' : '400',
    color: activeKey === key ? '#112235' : '#374151',
    backgroundColor: activeKey === key ? '#F7F8FA' : 'transparent',
    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
    transition: 'background 0.1s',
  });

  const rightContent = () => {
    switch (activeKey) {
      case 'profile':       return <SectionProfile data={data} onRefresh={load} />;
      case 'preferences':   return <SectionPreferences />;
      case 'notifications': return <SectionNotifications />;
      case 'connections':   return <SectionConnections />;
      case 'security':      return <SectionSecurity data={data} onRefresh={load} onToast={handleToast} />;
      case 'sessions':      return <SectionSessions />;
      case 'danger':        return (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Danger Zone</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Irreversible account actions</p>
          <Divider />
          <DangerSection />
        </>
      );
      default: return null;
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 'min(1100px, 95vw)', height: 'min(720px, 90vh)', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden' }}>

        {/* ✕ */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px', lineHeight: 1, padding: '4px', borderRadius: '4px', transition: 'color 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#374151'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
        ><X size={18} /></button>

        {/* Left nav */}
        <div style={{ width: '260px', flexShrink: 0, padding: '20px 12px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
          {LEFT_NAV.map((group, gi) => (
            <div key={group.group} style={{ marginTop: gi === 0 ? '0' : '12px' }}>
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{group.group}</div>
              {group.items.map(({ key, Icon, label, isUserRow }) => (
                <button key={key} onClick={() => setActiveKey(key)} style={navItemStyle(key)}
                  onMouseEnter={e => { if (activeKey !== key) e.currentTarget.style.backgroundColor = '#F7F8FA'; }}
                  onMouseLeave={e => { if (activeKey !== key) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {isUserRow ? (
                    <Avatar name={user?.name} role={user?.role} size={20} />
                  ) : (
                    <Icon size={16} color={activeKey === key ? '#374151' : '#6B7280'} />
                  )}
                  <span>{isUserRow ? (user?.name || 'My Profile') : label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 60px', maxWidth: '700px' }}>
          {rightContent()}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 700, backgroundColor: '#059669', color: '#FFFFFF', padding: '11px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
