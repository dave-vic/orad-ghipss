import { useState, useEffect } from 'react';
import { X, Settings, Users, BarChart2, Shield, ClipboardList, Plug, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

/* ─── Shared primitives ─── */
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

function SettingRow({ label, desc, action, last }) {
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

const ghostBtn = (label) => (
  <button style={{ padding: '7px 14px', fontSize: '13px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'border-color 0.1s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
  >{label}</button>
);

const selStyle = { padding: '7px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#112235', cursor: 'pointer', outline: 'none' };

/* ─── Left Nav ─── */
const LEFT_NAV = [
  { group: 'Workspace', items: [
    { key: 'general',   Icon: Settings,      label: 'General' },
    { key: 'members',   Icon: Users,         label: 'Members' },
    { key: 'analytics', Icon: BarChart2,     label: 'Analytics' },
  ]},
  { group: 'Security', items: [
    { key: 'permissions', Icon: Shield,        label: 'Access & Permissions' },
    { key: 'audit',       Icon: ClipboardList, label: 'Audit Logs' },
    { key: 'api',         Icon: Plug,          label: 'API & Integrations' },
  ]},
  { group: 'Billing', items: [
    { key: 'billing', Icon: CreditCard,  label: 'Billing' },
    { key: 'usage',   Icon: TrendingUp,  label: 'Usage' },
  ]},
];

/* ─── Right panel sections ─── */
function SectionGeneral() {
  const [editing, setEditing] = useState({});
  const [vals, setVals] = useState({
    name: 'MojoPay Operations Portal',
    url: 'ops.mojopay.com',
    tz: 'Africa/Accra (GMT+0)',
    lang: 'English',
  });
  const set = (k, v) => setVals(p => ({ ...p, [k]: v }));
  const inp = { padding: '7px 12px', fontSize: '13px', border: '1.5px solid #306196', borderRadius: '6px', color: '#112235', outline: 'none', width: '240px' };
  const valChip = (k, v) => editing[k]
    ? <input autoFocus value={v} onChange={e => set(k, e.target.value)} onBlur={() => setEditing(p => ({ ...p, [k]: false }))} onKeyDown={e => e.key === 'Enter' && setEditing(p => ({ ...p, [k]: false }))} style={inp} />
    : <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#374151' }}>{v}</span>
        <button onClick={() => setEditing(p => ({ ...p, [k]: true }))} style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer' }}>Edit</button>
      </div>;
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>General</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Basic portal settings and configuration</p>
      <Divider />
      <SettingRow label="Portal name" desc="Displayed in the browser tab and emails" action={valChip('name', vals.name)} />
      <SettingRow label="Portal URL" action={valChip('url', vals.url)} />
      <SettingRow label="Timezone" action={valChip('tz', vals.tz)} />
      <SettingRow label="Default language" action={valChip('lang', vals.lang)} last />
    </>
  );
}

function SectionMembers() {
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Members</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage member access and invitations</p>
      <Divider />
      <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '32px 0', textAlign: 'center' }}>Member management is available on the User Management page.</div>
    </>
  );
}

function SectionAnalytics() {
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Analytics</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Platform usage insights and reporting</p>
      <Divider />
      <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '32px 0', textAlign: 'center' }}>Analytics coming soon.</div>
    </>
  );
}

function SectionPermissions() {
  const [defaultRole, setDefaultRole] = useState('viewer');
  const [selfReg, setSelfReg]         = useState(false);
  const [timeout, setTimeout_]        = useState('90');
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Access & Permissions</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Control who can access ORAD and how</p>
      <Divider />
      <SettingRow label="Default role" desc="Role assigned to new users on creation"
        action={<select value={defaultRole} onChange={e => setDefaultRole(e.target.value)} style={selStyle}><option value="viewer">Viewer</option><option value="member">Member</option><option value="admin">Admin</option></select>} />
      <SettingRow label="Self-registration" desc="Allow users to create their own accounts" action={<Toggle value={selfReg} onChange={setSelfReg} />} />
      <SettingRow label="Inactive timeout" desc="Automatically deactivate users after this period"
        action={<select value={timeout} onChange={e => setTimeout_(e.target.value)} style={selStyle}><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option><option value="180">180 days</option></select>} last />
    </>
  );
}

function SectionAudit() {
  const [retention, setRetention] = useState('12');
  const [autoExport, setAutoExport] = useState(false);
  const [fmt, setFmt]              = useState('csv');
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Audit Logs</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Configure audit log retention and export settings</p>
      <Divider />
      <SettingRow label="Log retention" desc="How long activity logs are kept"
        action={<select value={retention} onChange={e => setRetention(e.target.value)} style={selStyle}><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select>} />
      <SettingRow label="Auto-export" desc="Automatically export logs on a schedule" action={<Toggle value={autoExport} onChange={setAutoExport} />} />
      <SettingRow label="Export format"
        action={<select value={fmt} onChange={e => setFmt(e.target.value)} style={selStyle}><option value="csv">CSV</option><option value="json">JSON</option></select>} last />
    </>
  );
}

function SectionAPI() {
  const [apiAccess, setApiAccess] = useState(false);
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>API & Integrations</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Manage API access and external integrations</p>
      <Divider />
      <SettingRow label="API access" desc="Allow external systems to interact with ORAD via API" action={<Toggle value={apiAccess} onChange={setApiAccess} />} />
      <SettingRow label="Webhook URL" desc="Receive real-time event notifications"
        action={<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ fontSize: '13px', color: '#9CA3AF' }}>Not configured</span>{ghostBtn('Configure')}</div>} last />
    </>
  );
}

function SectionBilling() {
  const rows = [
    { label: 'Current plan', value: 'Starter' },
    { label: 'Next billing date', value: '—' },
    { label: 'Payment method', value: '—' },
  ];
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Billing</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Subscription and payment details</p>
      <Divider />
      {rows.map((r, i) => (
        <SettingRow key={r.label} label={r.label}
          action={<span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{r.value}</span>}
          last={i === rows.length - 1} />
      ))}
    </>
  );
}

function SectionUsage() {
  const rows = [
    { label: 'Users', value: '5 of 50' },
    { label: 'Storage', value: '120 MB of 10 GB' },
    { label: 'API calls this month', value: '—' },
    { label: 'Audit log entries', value: '—' },
  ];
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#112235', margin: 0 }}>Usage</h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: '32px' }}>Current resource usage</p>
      <Divider />
      {rows.map((r, i) => (
        <SettingRow key={r.label} label={r.label}
          action={<span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{r.value}</span>}
          last={i === rows.length - 1} />
      ))}
    </>
  );
}

/* ─── Main export ─── */
export default function SettingsModal({ onClose }) {
  const [activeKey, setActiveKey] = useState('general');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

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
      case 'general':     return <SectionGeneral />;
      case 'members':     return <SectionMembers />;
      case 'analytics':   return <SectionAnalytics />;
      case 'permissions': return <SectionPermissions />;
      case 'audit':       return <SectionAudit />;
      case 'api':         return <SectionAPI />;
      case 'billing':     return <SectionBilling />;
      case 'usage':       return <SectionUsage />;
      default:            return null;
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 'min(1100px, 95vw)', height: 'min(720px, 90vh)', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden' }}>

        {/* ✕ */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', borderRadius: '4px', transition: 'color 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#374151'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
        ><X size={18} /></button>

        {/* Left nav */}
        <div style={{ width: '260px', flexShrink: 0, padding: '20px 12px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
          {LEFT_NAV.map((group, gi) => (
            <div key={group.group} style={{ marginTop: gi === 0 ? '0' : '12px' }}>
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{group.group}</div>
              {group.items.map(({ key, Icon, label }) => (
                <button key={key} onClick={() => setActiveKey(key)} style={navItemStyle(key)}
                  onMouseEnter={e => { if (activeKey !== key) e.currentTarget.style.backgroundColor = '#F7F8FA'; }}
                  onMouseLeave={e => { if (activeKey !== key) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icon size={16} color={activeKey === key ? '#374151' : '#6B7280'} />
                  <span>{label}</span>
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
    </div>
  );
}
