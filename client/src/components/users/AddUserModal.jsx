import { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, X, User, Mail, AtSign, Lock, Shield } from 'lucide-react';
import api from '../../api/axios.js';

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'Can view and download documents', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { value: 'member', label: 'Member', desc: 'Can upload and manage own documents', color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
  { value: 'admin',  label: 'Admin',  desc: 'Full access to all platform features', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
];

function Field({ label, icon: Icon, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Icon size={11} color="#9CA3AF" /> {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '500' }}>{error}</span>}
    </div>
  );
}

export default function AddUserModal({ onClose, onCreated, onToast }) {
  const [form, setForm]     = useState({ name: '', email: '', username: '', password: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [focused, setFocused] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '9px 12px',
    border: `1.5px solid ${focused === field ? '#306196' : '#E5E7EB'}`,
    borderRadius: '8px', fontSize: '13px', color: '#112235',
    outline: 'none', boxSizing: 'border-box',
    backgroundColor: focused === field ? '#FAFCFF' : '#FFFFFF',
    transition: 'border-color 0.15s, background 0.15s',
  });

  const selectedRole = ROLES.find(r => r.value === form.role);

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '480px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden' }}
      >
        {/* Header */}
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
              <UserPlus size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>Add New User</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Create an account and assign a role</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>
              <X size={13} color="#DC2626" /> {error}
            </div>
          )}

          <form id="add-user-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Field label="Full Name" icon={User}>
                <input type="text" required value={form.name} onChange={set('name')} placeholder="Jane Smith"
                  style={inputStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
              </Field>
              <Field label="Username" icon={AtSign}>
                <input type="text" required value={form.username} onChange={set('username')} placeholder="jsmith"
                  style={inputStyle('username')} onFocus={() => setFocused('username')} onBlur={() => setFocused('')} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Field label="Email" icon={Mail}>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="jane@example.com"
                  style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              </Field>
              <Field label="Password" icon={Lock}>
                <input type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
                  style={inputStyle('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} />
              </Field>
            </div>

            {/* Role selector */}
            <Field label="Role" icon={Shield}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '2px' }}>
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: role.value }))}
                    style={{
                      padding: '10px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                      border: `1.5px solid ${form.role === role.value ? role.border : '#E5E7EB'}`,
                      backgroundColor: form.role === role.value ? role.bg : '#F7F8FA',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (form.role !== role.value) e.currentTarget.style.borderColor = '#D1D5DB'; }}
                    onMouseLeave={e => { if (form.role !== role.value) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', color: form.role === role.value ? role.color : '#374151', marginBottom: '2px' }}>{role.label}</div>
                    <div style={{ fontSize: '10px', color: form.role === role.value ? role.color : '#9CA3AF', lineHeight: 1.4, fontWeight: '500', opacity: form.role === role.value ? 0.85 : 1 }}>{role.desc}</div>
                  </button>
                ))}
              </div>
            </Field>
          </form>
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
          <button type="submit" form="add-user-form" disabled={loading}
            style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: loading ? '#9CA3AF' : '#306196', color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.1s', boxShadow: loading ? 'none' : '0 4px 12px rgba(48,97,150,0.25)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#245078'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#306196'; }}
          >
            {loading ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
