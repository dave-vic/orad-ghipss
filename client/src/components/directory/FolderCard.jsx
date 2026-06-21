import {
  Lock, Edit2, Trash2, ArrowUpRight,
  Folder, FileText, BookOpen, ShieldCheck, BarChart2, Briefcase,
  Key, ClipboardList, Archive, Bookmark, Lightbulb, Star,
  Users, Settings, TrendingUp, Building2, FileBadge,
  Globe, Layers, Database, FileCode, Bell, Package,
  Handshake, GraduationCap, ShieldAlert,
} from 'lucide-react';
import RoleBadge from '../ui/RoleBadge.jsx';
import FavouriteButton from '../ui/FavouriteButton.jsx';

const ICON_MAP = {
  Folder, FileText, BookOpen, ShieldCheck, BarChart2, Briefcase,
  Key, ClipboardList, Archive, Bookmark, Lightbulb, Star,
  Users, Settings, TrendingUp, Building2, FileBadge,
  Globe, Layers, Database, FileCode, Bell, Package,
  // legacy id-based fallbacks
  'f-sop':      FileText,
  'f-manuals':  BookOpen,
  'f-partner':  Handshake,
  'f-onboard':  GraduationCap,
  'f-internal': ShieldAlert,
};

const FOLDER_ICON_COLORS = {
  'f-sop':      '#306196',
  'f-manuals':  '#059669',
  'f-partner':  '#D97706',
  'f-onboard':  '#2563EB',
  'f-internal': '#DC2626',
};

export default function FolderCard({ folder, locked, isAdmin, onClick, onEdit, onDelete }) {
  const Icon = (folder.icon && ICON_MAP[folder.icon]) || ICON_MAP[folder.id] || Folder;
  const iconColor = FOLDER_ICON_COLORS[folder.id] || '#306196';

  return (
    <div
      onClick={locked ? undefined : onClick}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        padding: '20px',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.5 : 1,
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(48,97,150,0.4)'; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
    >
      {/* Locked chip */}
      {locked && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: '700', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Lock size={9} /> Restricted
        </div>
      )}

      {/* Top row: icon + admin actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: locked ? '#F3F4F6' : `${iconColor}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {locked
            ? <Lock size={16} color="#9CA3AF" />
            : <Icon size={18} color={iconColor} />
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
          {!locked && <FavouriteButton type="folder" targetId={folder.id} targetName={folder.name} size={13} />}
          {isAdmin && !locked && (
            <>
              <button onClick={onEdit} title="Edit" style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#9CA3AF'; }}
              >
                <Edit2 size={11} />
              </button>
              <button onClick={onDelete} title="Delete" style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: '14px', fontWeight: '700', color: '#112235', marginBottom: '3px' }}>{folder.name}</div>
      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '14px', fontWeight: '400' }}>
        {locked ? 'Access restricted' : `${folder._count?.documents ?? 0} document${folder._count?.documents !== 1 ? 's' : ''}`}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {folder.allowedRoles?.map(role => <RoleBadge key={role} role={role} />)}
        </div>
        {!locked && (
          <ArrowUpRight size={13} color="#9CA3AF" />
        )}
      </div>
    </div>
  );
}
