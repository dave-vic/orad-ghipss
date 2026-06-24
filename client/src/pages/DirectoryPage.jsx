import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, BookOpen, ShieldAlert, Folder, Lock, Filter, Search, X, SlidersHorizontal, Edit2, Trash2, MoreHorizontal, ArrowRight, Files, ShieldCheck, BarChart2, Briefcase, Key, ClipboardList, Archive, Bookmark, Lightbulb, Star, Users, Settings, TrendingUp, Building2, FileBadge, Globe, Layers, Database, FileCode, Bell, Package } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import TopBar from '../components/layout/TopBar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import FolderManagementModal from '../components/directory/FolderManagementModal.jsx';
import AccessRequestModal from '../components/directory/AccessRequestModal.jsx';
import Toast from '../components/ui/Toast.jsx';
import RoleBadge from '../components/ui/RoleBadge.jsx';

/* ─── Icon lookup map ─── */
const ICON_MAP = {
  Folder, FileText, BookOpen, ShieldCheck, ShieldAlert, BarChart2, Briefcase,
  Key, ClipboardList, Archive, Bookmark, Lightbulb, Star,
  Users, Settings, Lock, TrendingUp, Building2, FileBadge,
  Globe, Layers, Database, FileCode, Bell, Package,
};
function getFolderIcon(folder) {
  const Icon = ICON_MAP[folder.icon] || Folder;
  const color = folder.color || '#306196';
  return { Icon, color };
}

/* ─── File type chip ─── */
const FILE_TYPE = {
  'application/pdf':                    { label: 'PDF', color: '#DC2626', bg: '#FEE2E2' },
  'application/vnd.ms-excel':           { label: 'XLS', color: '#059669', bg: '#D1FAE5' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLS', color: '#059669', bg: '#D1FAE5' },
  'application/msword':                 { label: 'DOC', color: '#2563EB', bg: '#DBEAFE' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOC', color: '#2563EB', bg: '#DBEAFE' },
  'text/plain':                         { label: 'TXT', color: '#6B7280', bg: '#F3F4F6' },
};
function fileTypeMeta(mimeType) {
  if (!mimeType) return { label: 'FILE', color: '#6B7280', bg: '#F3F4F6' };
  for (const [k, v] of Object.entries(FILE_TYPE)) { if (mimeType.startsWith(k)) return v; }
  if (mimeType.startsWith('image/')) return { label: 'IMG', color: '#7C3AED', bg: '#EDE9FE' };
  return { label: 'FILE', color: '#6B7280', bg: '#F3F4F6' };
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isMobile = useIsMobile();

  const [folders, setFolders] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editFolder, setEditFolder] = useState(null);
  const [requestFolder, setRequestFolder] = useState(null);
  const [toast, setToast] = useState(null);
  const [tableFilter, setTableFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [docSearch, setDocSearch] = useState('');
  const [showAllFolders, setShowAllFolders] = useState(false);
  const FOLDERS_VISIBLE = 7;
  const [docSearchVisible, setDocSearchVisible] = useState(false);

  const loadFolders = useCallback(() => {
    setLoading(true);
    api.get('/folders')
      .then(async (res) => {
        const accessible = res.data;
        setFolders(accessible);
        // Fetch recent documents from accessible folders (up to first 3 to keep requests low)
        const slice = accessible.slice(0, 4);
        try {
          const allDocs = await Promise.all(slice.map(f => api.get(`/folders/${f.id}/documents`).then(r => r.data)));
          const merged = allDocs.flat().sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 8);
          setRecentDocs(merged);
        } catch { /* no recent docs */ }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  const allFolders = folders.map(f => ({ ...f, locked: false }));

  const tableFolders = tableFilter === 'accessible'
    ? allFolders
    : tableFilter === 'restricted'
    ? []
    : allFolders;

  const filteredDocs = docSearch
    ? recentDocs.filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase()))
    : recentDocs;

  const handleDelete = (folder) => setDeleteTarget(folder);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/folders/${deleteTarget.id}`);
      setToast({ message: 'Folder deleted', type: 'success' });
      loadFolders();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Delete failed', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const sectionLabel = (text) => (
    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D3A5A' }}>{text}</div>
  );

  /* ── ZONE 1: Folder Cards Strip ── */
  const FolderCardStrip = ({ folder, locked }) => {
    const { Icon, color } = getFolderIcon(folder);
    const [hovered, setHovered] = useState(false);
    const docCount = folder._count?.documents ?? 0;

    if (locked) {
      return (
        <div
          onClick={() => setRequestFolder(folder)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${hovered ? '#FECACA' : '#E5E7EB'}`,
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            transition: 'all 0.18s',
            boxShadow: hovered ? '0 8px 24px rgba(220,38,38,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            transform: hovered ? 'translateY(-2px)' : 'none',
          }}
        >
          {/* Banner */}
          <div style={{ height: '100px', background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-18px', top: '-18px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(220,38,38,0.08)', pointerEvents: 'none' }} />
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <Lock size={22} color="#DC2626" />
            </div>
          </div>
          {/* Content */}
          <div style={{ padding: '12px 14px 14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{folder.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '5px' }}>Restricted</span>
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: '3px' }}>
                Request <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => navigate(`/directory/${folder.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${hovered ? `${color}50` : '#E5E7EB'}`,
          borderRadius: '14px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          transition: 'all 0.18s',
          boxShadow: hovered ? `0 8px 24px ${color}1A` : '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
      >
        {/* Colored banner */}
        <div style={{
          height: '100px',
          background: `linear-gradient(135deg, ${color}28 0%, ${color}42 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative orb */}
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: `${color}22`, pointerEvents: 'none' }} />
          {/* Doc count chip */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: 'rgba(255,255,255,0.88)', border: `1px solid ${color}30`, borderRadius: '6px', padding: '2px 7px', backdropFilter: 'blur(4px)' }}>
            <Files size={9} color={color} />
            <span style={{ fontSize: '10px', fontWeight: '700', color }}>{docCount}</span>
          </div>
          {/* Icon — solid color bg, white icon (matches modal preview) */}
          <div style={{ width: '54px', height: '54px', borderRadius: '14px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${color}55` }}>
            <Icon size={24} color="#FFFFFF" />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{docCount} {docCount === 1 ? 'document' : 'documents'}</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: '3px' }}>
              Open <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ── ZONE 2: Folder Table ── */
  const TableTab = ({ label, value }) => (
    <button
      onClick={() => setTableFilter(value)}
      style={{
        padding: '5px 14px', fontSize: '12px', fontWeight: '600',
        borderRadius: '6px', border: tableFilter === value ? 'none' : '1px solid #D1D5DB',
        backgroundColor: tableFilter === value ? '#306196' : '#FFFFFF',
        color: tableFilter === value ? '#FFFFFF' : '#374151',
        cursor: 'pointer', transition: 'all 0.1s',
      }}
    >
      {label}
    </button>
  );

  /* ── ZONE 3: Recent Doc Card ── */
  const DocCard = ({ doc }) => {
    const ft = fileTypeMeta(doc.mimeType);
    const [hovered, setHovered] = useState(false);
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${hovered ? 'rgba(48,97,150,0.35)' : '#E5E7EB'}`,
          borderRadius: '12px', overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: hovered ? '0 6px 20px rgba(48,97,150,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.15s',
          transform: hovered ? 'translateY(-1px)' : 'none',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px',
        }}
      >
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: ft.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: ft.color, letterSpacing: '0.02em' }}>{ft.label}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>{ft.label} · {timeAgo(doc.uploadedAt)}</div>
        </div>
        <ArrowRight size={13} color={hovered ? '#306196' : '#D1D5DB'} style={{ flexShrink: 0, transition: 'color 0.15s' }} />
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Documents" icon={Folder} breadcrumb={[{ label: 'Workspace' }, { label: 'Documents' }]} />

      <div style={{ padding: isMobile ? '16px' : '28px', flex: 1 }}>

        {/* ── ZONE 1: Folder Cards Strip ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '14px' }}>{sectionLabel('Folders')}</div>
          {loading ? (
            <div style={{ display: 'flex', gap: '14px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width: '210px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                  <div style={{ height: '100px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '13px', borderRadius: '6px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: '70%' }} />
                    <div style={{ height: '11px', borderRadius: '6px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: '45%' }} />
                  </div>
                </div>
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          ) : (() => {
            const visibleFolders = showAllFolders ? allFolders : allFolders.slice(0, FOLDERS_VISIBLE);
            const hiddenCount = allFolders.length - FOLDERS_VISIBLE;
            return (
              <>
                <div style={isMobile ? {
                  display: 'flex', gap: '12px',
                  overflowX: 'auto', paddingBottom: '8px',
                } : { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '14px' }}>
                  {visibleFolders.map(f => (
                    <div key={f.id} style={isMobile ? { flexShrink: 0, width: '150px' } : {}}>
                      <FolderCardStrip folder={f} locked={f.locked} />
                    </div>
                  ))}
                  {/* Admin: + New Folder card */}
                  {isAdmin && (showAllFolders || allFolders.length < FOLDERS_VISIBLE) && (
                    <NewFolderCard onClick={() => setShowCreate(true)} />
                  )}
                </div>

                {/* Show more / collapse toggle */}
                {allFolders.length > FOLDERS_VISIBLE && (
                  <button
                    onClick={() => setShowAllFolders(v => !v)}
                    style={{
                      marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 16px', borderRadius: '8px', border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF', color: '#306196', fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF4FF'; e.currentTarget.style.borderColor = '#306196'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    {showAllFolders
                      ? 'Show less'
                      : `+ ${hiddenCount} more folder${hiddenCount === 1 ? '' : 's'}`}
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {/* ── ZONE 2: Folder Table ── */}
        <div style={{ marginBottom: '32px' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            {sectionLabel('All Folders')}
            {isAdmin && (
              <button
                onClick={() => setShowCreate(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#245078'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#306196'}
              >
                <Plus size={13} /> Create Folder
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <TableTab label="All" value="all" />
            <TableTab label="Accessible" value="accessible" />
            <TableTab label="Restricted" value="restricted" />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <div style={{ backgroundColor: '#FFFFFF', minWidth: '540px', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ width: '40px', padding: '10px 16px', textAlign: 'left' }}>
                    <input type="checkbox" style={{ accentColor: '#306196', cursor: 'pointer' }} readOnly />
                  </th>
                  <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#1D3A5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
                  <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#1D3A5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access</th>
                  <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#1D3A5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Documents</th>
                  <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#1D3A5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Updated</th>
                  {isAdmin && <th style={{ width: '80px' }} />}
                </tr>
              </thead>
              <tbody>
                {tableFolders.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No folders found</td></tr>
                ) : tableFolders.map((folder, idx) => {
                  const isLast = idx === tableFolders.length - 1;
                  return (
                    <FolderTableRow
                      key={folder.id}
                      folder={folder}
                      isLast={isLast}
                      isAdmin={isAdmin}
                      onNavigate={() => !folder.locked && navigate(`/directory/${folder.id}`)}
                      onEdit={() => setEditFolder(folder)}
                      onDelete={() => handleDelete(folder)}
                      onRequest={() => folder.locked && setRequestFolder(folder)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        {/* ── ZONE 3: Recent Documents Grid ── */}
        <div>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            {sectionLabel('Recent Documents')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {docSearchVisible ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid #306196', borderRadius: '6px', backgroundColor: '#FFFFFF', width: '200px' }}>
                  <Search size={13} color="#9CA3AF" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search files…"
                    value={docSearch}
                    onChange={e => setDocSearch(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#112235', backgroundColor: 'transparent' }}
                  />
                  <button onClick={() => { setDocSearch(''); setDocSearchVisible(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDocSearchVisible(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer', transition: 'border-color 0.1s', fontWeight: '500' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                >
                  <Search size={13} color="#6B7280" /> Search
                </button>
              )}
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer', transition: 'border-color 0.1s', fontWeight: '500' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              >
                <Filter size={13} color="#6B7280" /> Filter
              </button>
              <button
                style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              >
                <SlidersHorizontal size={13} color="#6B7280" />
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '66px', borderRadius: '12px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', border: '1px solid #E5E7EB' }} />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '13px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
              {docSearch ? 'No matching documents' : 'No recent documents'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
              {filteredDocs.map(doc => <DocCard key={doc.id} doc={doc} />)}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showCreate && (
        <FolderManagementModal
          folder={null}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); loadFolders(); setToast({ message: 'Folder created', type: 'success' }); }}
        />
      )}
      {editFolder && (
        <FolderManagementModal
          folder={editFolder}
          onClose={() => setEditFolder(null)}
          onSaved={() => { setEditFolder(null); loadFolders(); setToast({ message: 'Folder updated', type: 'success' }); }}
        />
      )}
      {requestFolder && (
        <AccessRequestModal
          folder={requestFolder}
          onClose={() => setRequestFolder(null)}
          onSubmitted={() => { setRequestFolder(null); setToast({ message: 'Access request submitted', type: 'success' }); }}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete folder confirmation */}
      {deleteTarget && createPortal(
        <div
          onClick={() => setDeleteTarget(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '420px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden' }}
          >
            {/* Gradient header */}
            <div style={{ background: 'linear-gradient(135deg, #3D0A0A 0%, #7F1D1D 60%, #DC2626 100%)', padding: '22px 22px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={18} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px' }}>Delete folder</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>This action cannot be undone</div>
                  </div>
                </div>
                <button onClick={() => setDeleteTarget(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '14px' }}>
                <Folder size={16} color="#DC2626" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626' }}>{deleteTarget.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.7 }}>
                This will permanently remove the folder and <strong style={{ color: '#374151' }}>all its documents</strong>. There is no way to recover them after deletion.
              </p>
            </div>
            {/* Footer */}
            <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.3)', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#B91C1C'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#DC2626'; }}
              >
                Delete folder
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── New Folder Card ── */
function NewFolderCard({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        overflow: 'hidden',
        border: `1.5px dashed ${hovered ? '#306196' : '#CBD5E1'}`,
        backgroundColor: hovered ? '#EEF4FF' : '#FAFBFC',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(48,97,150,0.12)' : 'none',
        minHeight: '162px',
        padding: '0 16px',
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        backgroundColor: hovered ? '#306196' : '#E2EAF3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        boxShadow: hovered ? '0 4px 14px rgba(48,97,150,0.28)' : 'none',
      }}>
        <Plus size={20} color={hovered ? '#FFFFFF' : '#7B93A8'} strokeWidth={2.5} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: hovered ? '#306196' : '#1D3A5A', transition: 'color 0.15s', marginBottom: '3px' }}>
          New Folder
        </div>
        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
          Create a folder
        </div>
      </div>
    </div>
  );
}

/* ── Folder Table Row (needs hover state) ── */
function FolderTableRow({ folder, isLast, isAdmin, onNavigate, onEdit, onDelete, onRequest }) {
  const [hovered, setHovered] = useState(false);
  const { Icon, color } = getFolderIcon(folder);
  const tdStyle = {
    padding: '12px 18px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: isLast ? 'none' : '1px solid #E5E7EB',
    backgroundColor: hovered && !folder.locked ? '#F0F6FF' : 'transparent',
    transition: 'background 0.1s',
    opacity: folder.locked ? 0.6 : 1,
    verticalAlign: 'middle',
  };
  const clickable = !folder.locked;

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={clickable ? onNavigate : onRequest}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <td style={{ ...tdStyle, width: '40px', padding: '12px 16px' }}>
        <input type="checkbox" style={{ accentColor: '#306196', cursor: 'pointer' }} readOnly onClick={e => e.stopPropagation()} />
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: folder.locked ? '#F3F4F6' : `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {folder.locked ? <Lock size={14} color="#9CA3AF" /> : <Icon size={15} color={color} />}
          </div>
          <span style={{ fontWeight: '600', color: '#112235', fontSize: '13px' }}>{folder.name}</span>
        </div>
      </td>
      <td style={tdStyle}>
        {folder.locked ? (
          <span style={{ padding: '2px 8px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>No access</span>
        ) : (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(folder.allowedRoles || ['admin']).map(r => <RoleBadge key={r} role={r} />)}
          </div>
        )}
      </td>
      <td style={{ ...tdStyle, color: '#6B7280' }}>
        {folder.locked ? '—' : `${folder._count?.documents ?? 0} files`}
      </td>
      <td style={{ ...tdStyle, color: '#6B7280' }}>
        {folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
      </td>
      {isAdmin && (
        <td style={{ ...tdStyle, padding: '0 12px', width: '80px' }} onClick={e => e.stopPropagation()}>
          {!folder.locked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: hovered ? 1 : 0, transition: 'opacity 0.1s' }}>
              <button
                onClick={onEdit}
                title="Edit folder"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer', color: '#6B7280', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={onDelete}
                title="Delete folder"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer', color: '#6B7280', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </td>
      )}
    </tr>
  );
}
