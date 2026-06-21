import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder, FileText, BookOpen, ShieldCheck, BarChart2, Briefcase,
  Key, ClipboardList, Archive, Bookmark, Lightbulb, Star,
  Users, Settings, Lock, TrendingUp, Building2, FileBadge,
  Globe, Layers, Database, FileCode, Bell, Package,
  X, Check, FolderPlus, FolderOpen,
} from 'lucide-react';
import api from '../../api/axios.js';

const ROLES = [
  { id: 'admin',  label: 'Admin',  description: 'Full access to all folders and admin tools', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', selBg: '#FFF5F5' },
  { id: 'member', label: 'Member', description: 'Can upload and manage documents',             color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', selBg: '#F0FDF4' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access to permitted folders',       color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', selBg: '#FFFBEB' },
];

const ICON_OPTIONS = [
  { key: 'Folder',        Icon: Folder        },
  { key: 'FileText',      Icon: FileText      },
  { key: 'BookOpen',      Icon: BookOpen      },
  { key: 'ShieldCheck',   Icon: ShieldCheck   },
  { key: 'BarChart2',     Icon: BarChart2     },
  { key: 'Briefcase',     Icon: Briefcase     },
  { key: 'Key',           Icon: Key           },
  { key: 'ClipboardList', Icon: ClipboardList },
  { key: 'Archive',       Icon: Archive       },
  { key: 'Bookmark',      Icon: Bookmark      },
  { key: 'Lightbulb',    Icon: Lightbulb     },
  { key: 'Star',          Icon: Star          },
  { key: 'Users',         Icon: Users         },
  { key: 'Settings',      Icon: Settings      },
  { key: 'Lock',          Icon: Lock          },
  { key: 'TrendingUp',    Icon: TrendingUp    },
  { key: 'Building2',     Icon: Building2     },
  { key: 'FileBadge',     Icon: FileBadge     },
  { key: 'Globe',         Icon: Globe         },
  { key: 'Layers',        Icon: Layers        },
  { key: 'Database',      Icon: Database      },
  { key: 'FileCode',      Icon: FileCode      },
  { key: 'Bell',          Icon: Bell          },
  { key: 'Package',       Icon: Package       },
];

export default function FolderManagementModal({ folder, onClose, onSaved }) {
  const isEdit = !!folder;
  const [form, setForm] = useState({
    name: folder?.name || '',
    description: folder?.description || '',
    allowedRoles: folder?.allowedRoles || ['admin'],
    icon: folder?.icon || 'Folder',
    announcement: folder?.announcement || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [focused, setFocused] = useState('');

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      allowedRoles: f.allowedRoles.includes(role)
        ? f.allowedRoles.filter(r => r !== role)
        : [...f.allowedRoles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.allowedRoles.length === 0) { setError('Select at least one role'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) { await api.patch(`/folders/${folder.id}`, form); }
      else        { await api.post('/folders', form); }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save folder');
    } finally { setLoading(false); }
  };

  const selectedIconObj = ICON_OPTIONS.find(o => o.key === form.icon);
  const SelectedIcon = selectedIconObj?.Icon || Folder;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '520px', maxHeight: '90vh', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '24px 24px 28px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
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
            {/* Live preview icon */}
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
              <SelectedIcon size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>
                {isEdit ? 'Edit Folder' : 'New Folder'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                {form.name || 'Configure name, icon and access'}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 8px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>
              <X size={13} /> {error}
            </div>
          )}

          <form id="folder-form" onSubmit={handleSubmit}>
            {/* Name + Description */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Folder Name</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Legal Agreements"
                  style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${focused === 'name' ? '#306196' : '#E5E7EB'}`, borderRadius: '8px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box', backgroundColor: focused === 'name' ? '#FAFCFF' : '#FFFFFF', transition: 'all 0.15s' }}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Description <span style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                <input type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
                  style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${focused === 'desc' ? '#306196' : '#E5E7EB'}`, borderRadius: '8px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box', backgroundColor: focused === 'desc' ? '#FAFCFF' : '#FFFFFF', transition: 'all 0.15s' }}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Icon picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Folder Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px', backgroundColor: '#F7F8FA', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                {ICON_OPTIONS.map(({ key, Icon }) => {
                  const selected = form.icon === key;
                  return (
                    <button key={key} type="button"
                      onClick={() => setForm(f => ({ ...f, icon: key }))}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: `2px solid ${selected ? '#306196' : 'transparent'}`, backgroundColor: selected ? '#EEF4FF' : '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', boxShadow: selected ? '0 2px 6px rgba(48,97,150,0.2)' : 'none' }}
                      onMouseEnter={e => { if (!selected) { e.currentTarget.style.backgroundColor = '#F0F6FF'; e.currentTarget.style.borderColor = '#C7DEFF'; } }}
                      onMouseLeave={e => { if (!selected) { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = 'transparent'; } }}
                    >
                      <Icon size={16} color={selected ? '#306196' : '#6B7280'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Announcement */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                Announcement <span style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                value={form.announcement}
                onChange={e => setForm(f => ({ ...f, announcement: e.target.value }))}
                placeholder="Pin a message at the top of this folder (e.g. 'All documents must be approved before uploading')"
                rows={3}
                style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${focused === 'announcement' ? '#306196' : '#E5E7EB'}`, borderRadius: '8px', fontSize: '13px', color: '#112235', outline: 'none', boxSizing: 'border-box', backgroundColor: focused === 'announcement' ? '#FAFCFF' : '#FFFFFF', transition: 'all 0.15s', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                onFocus={() => setFocused('announcement')} onBlur={() => setFocused('')}
              />
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Shown as a pinned banner inside the folder for all users.</div>
            </div>

            {/* Access roles */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Who can access this folder?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ROLES.map(role => {
                  const sel = form.allowedRoles.includes(role.id);
                  return (
                    <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${sel ? role.border : '#E5E7EB'}`, backgroundColor: sel ? role.selBg : '#FAFAFA', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#F7F8FA'; } }}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; } }}
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: sel ? role.bg : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                        <Users size={15} color={sel ? role.color : '#9CA3AF'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: sel ? role.color : '#374151' }}>{role.label}</div>
                        <div style={{ fontSize: '11px', color: sel ? role.color : '#9CA3AF', marginTop: '2px', fontWeight: '500', opacity: sel ? 0.8 : 1 }}>{role.description}</div>
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: sel ? role.color : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {sel && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ height: '1px', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
        <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            Cancel
          </button>
          <button type="submit" form="folder-form" disabled={loading}
            style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: loading ? '#9CA3AF' : '#306196', color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.1s', boxShadow: loading ? 'none' : '0 4px 12px rgba(48,97,150,0.25)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#245078'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#306196'; }}
          >
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create folder'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
