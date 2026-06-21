import { useState, useEffect } from 'react';
import { FileText, Image, Video, Table2, AlignLeft, Paperclip, Download, Trash2, Link2, ShieldCheck, MessageSquare, History, Eye, LayoutGrid, List, Tag, HardDrive, Calendar, User, Upload } from 'lucide-react';
import api from '../../api/axios.js';
import AcknowledgementModal from './AcknowledgementModal.jsx';
import GuestLinkModal from './GuestLinkModal.jsx';
import CommentsPanel from './CommentsPanel.jsx';
import VersionModal from './VersionModal.jsx';
import TagsEditor from './TagsEditor.jsx';
import InlinePdfViewer from './InlinePdfViewer.jsx';
import {
  TableCheckbox, KebabMenu, PaginationBar,
  SearchInput, SortBtn, InitialsAvatar, BulkBar, GhostBtn,
} from '../ui/TablePrimitives.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('application/pdf')) return FileText;
  if (mimeType?.startsWith('image/')) return Image;
  if (mimeType?.startsWith('video/')) return Video;
  if (mimeType?.startsWith('application/vnd')) return Table2;
  if (mimeType?.startsWith('text/')) return AlignLeft;
  return Paperclip;
}

function formatSize(bytes) {
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function getTypeLabel(mimeType) {
  if (!mimeType) return 'FILE';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'XLSX';
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return 'DOCX';
  if (mimeType.includes('presentationml') || mimeType.includes('powerpoint')) return 'PPTX';
  if (mimeType.startsWith('text/')) return 'TXT';
  if (mimeType.startsWith('image/')) return 'IMG';
  if (mimeType.startsWith('video/')) return 'VID';
  return 'FILE';
}

function TypeBadge({ mimeType }) {
  const label = getTypeLabel(mimeType);
  const palette = {
    PDF:  { bg: '#FEE2E2', color: '#DC2626' },
    XLSX: { bg: '#D1FAE5', color: '#059669' },
    DOCX: { bg: '#DBEAFE', color: '#1D4ED8' },
    PPTX: { bg: '#FEF3C7', color: '#D97706' },
    TXT:  { bg: '#F3F4F6', color: '#6B7280' },
    IMG:  { bg: '#EDE9FE', color: '#7C3AED' },
    VID:  { bg: '#FEF3C7', color: '#D97706' },
    FILE: { bg: '#F3F4F6', color: '#6B7280' },
  };
  const { bg, color } = palette[label] || palette.FILE;
  return (
    <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

// ─── Grid card view ───────────────────────────────────────────────────────────
function DocCard({ doc, onDownload, onComments, userRole, onShare, onHistory, onAckToggle, onDelete }) {
  const FileIcon = getFileIcon(doc.mimeType);
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
        boxShadow: hov ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'box-shadow 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileIcon size={18} color="#6B7280" />
        </div>
        <TypeBadge mimeType={doc.mimeType} />
      </div>
      <div>
        <div style={{ fontWeight: '600', color: '#112235', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{formatSize(doc.sizeBytes)} · {timeAgo(doc.uploadedAt)}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => onDownload(doc)}
          style={{ flex: 1, padding: '5px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Download size={11} /> Download
        </button>
      </div>
    </div>
  );
}

// ─── TH Base ─────────────────────────────────────────────────────────────────
const TH_BASE = {
  padding: '0 18px', height: '48px', textAlign: 'left', fontSize: '12px',
  fontWeight: '500', color: '#6B7280', backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #E5E7EB', borderTop: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
};

// ─── DocumentTable ────────────────────────────────────────────────────────────
export default function DocumentTable({ documents, userRole, onDelete, onToast, onRefresh, onUpload }) {
  const [selected, setSelected]     = useState(new Set());
  const [hoveredId, setHoveredId]   = useState(null);
  const [shareDoc, setShareDoc]     = useState(null);
  const [ackDoc, setAckDoc]         = useState(null);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [commentDoc, setCommentDoc] = useState(null);
  const [versionDoc, setVersionDoc] = useState(null);
  const [viewerDoc, setViewerDoc]   = useState(null);
  const [view, setView]             = useState('list');
  const [search, setSearch]         = useState('');
  const [sortCol, setSortCol]       = useState(null);
  const [sortDir, setSortDir]       = useState('asc');
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(10);

  useEffect(() => { setSelected(new Set()); }, [documents]);

  const handleSort = (col) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortCol(null); setSortDir('asc'); }
    } else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const q = search.toLowerCase();
  const filtered = documents.filter(d => !q || d.name?.toLowerCase().includes(q));
  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const va = a[sortCol] ?? '', vb = b[sortCol] ?? '';
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return sortDir === 'asc' ? cmp : -cmp;
  }) : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const allSelected = selected.size > 0 && paginated.every(d => selected.has(d.id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map(d => d.id)));
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const triggerDownload = async (doc) => {
    if (doc.mimeType === 'application/pdf') {
      const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
      window.location.href = `${base}/documents/${doc.id}/download`;
    } else {
      try {
        const { data } = await api.get(`/documents/${doc.id}/download`);
        const a = document.createElement('a');
        a.href = data.url; a.download = doc.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch { onToast({ message: 'Failed to download document', type: 'error' }); }
    }
  };

  const handleDownload = async (doc) => {
    if (doc.requiresAck) {
      try {
        const { data } = await api.get(`/documents/${doc.id}/acknowledged`);
        if (!data.acknowledged) { setPendingDownload(doc); setAckDoc(doc); return; }
      } catch {
        // If check fails, show the popup anyway to be safe
        setPendingDownload(doc); setAckDoc(doc); return;
      }
    }
    triggerDownload(doc);
  };

  const handleAckComplete = () => {
    const doc = pendingDownload;
    setAckDoc(null); setPendingDownload(null);
    if (doc) triggerDownload(doc);
  };

  const handleAckToggle = async (doc) => {
    try {
      await api.patch(`/documents/${doc.id}/requires-ack`, { requiresAck: !doc.requiresAck });
      onToast({ message: `Acknowledgement ${!doc.requiresAck ? 'enabled' : 'removed'}`, type: 'success' });
      onRefresh();
    } catch { onToast({ message: 'Failed to update acknowledgement setting', type: 'error' }); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} documents?`)) return;
    try {
      await api.post('/documents/bulk-delete', { ids: [...selected] });
      setSelected(new Set()); onRefresh();
      onToast({ message: `${selected.size} documents deleted`, type: 'success' });
    } catch { onToast({ message: 'Bulk delete failed', type: 'error' }); }
  };

  const sortProps = { sortCol, sortDir, onSort: handleSort };

  const thCell = (label, Icon, col) => (
    <th style={TH_BASE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Icon && <Icon size={12} color="#9CA3AF" strokeWidth={2} />}
        <span>{label}</span>
        {col && <SortBtn col={col} {...sortProps} />}
      </div>
    </th>
  );

  const emptyEl = (
    <tr>
      <td colSpan={8} style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><FileText size={28} color="#D1D5DB" /></div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
          {search ? `No results for "${search}"` : 'No documents in this folder'}
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          {search ? 'Try a different search or clear filters' : 'Upload the first document to get started'}
        </div>
        {search && <button onClick={() => setSearch('')} style={{ fontSize: '13px', color: '#306196', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>}
      </td>
    </tr>
  );

  return (
    <div>
      {/* Bulk bar */}
      {userRole === 'admin' && (
        <BulkBar
          count={selected.size}
          actions={
            <button onClick={handleBulkDelete}
              style={{ padding: '5px 12px', backgroundColor: '#FEE2E2', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', fontSize: '13px', color: '#DC2626', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Trash2 size={12} />Delete Selected
            </button>
          }
          onClear={() => setSelected(new Set())}
        />
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search documents…" />
          <GhostBtn>↕ Sort</GhostBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #D1D5DB', borderRadius: '6px', overflow: 'hidden' }}>
            {[{ key: 'list', Icon: List }, { key: 'grid', Icon: LayoutGrid }].map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{ width: '32px', height: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: view === key ? '#306196' : '#FFFFFF', color: view === key ? '#FFFFFF' : '#6B7280', transition: 'background 0.1s' }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          <GhostBtn>▽ Filters</GhostBtn>
          {userRole === 'admin' && (
            <button
              onClick={onUpload}
              style={{ padding: '7px 14px', backgroundColor: '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#245078'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#306196'}
            >
              <Upload size={13} /> Upload
            </button>
          )}
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' ? (
        <div>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px' }}>No documents found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {sorted.map(doc => (
                <DocCard key={doc.id} doc={doc} userRole={userRole}
                  onDownload={handleDownload}
                  onComments={() => setCommentDoc(doc)}
                  onShare={() => setShareDoc(doc)}
                  onHistory={() => setVersionDoc(doc)}
                  onAckToggle={() => handleAckToggle(doc)}
                  onDelete={() => onDelete(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* List / table view */}
          <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px' }}>
              <colgroup>
                {userRole === 'admin' && <col style={{ width: '44px' }} />}
                <col />
                <col style={{ width: '80px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
              <thead>
                <tr>
                  {userRole === 'admin' && (
                    <th style={{ ...TH_BASE, padding: '0 18px' }}>
                      <TableCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                    </th>
                  )}
                  {thCell('Document', FileText, 'name')}
                  {thCell('Type', Tag, null)}
                  {thCell('Size', HardDrive, 'sizeBytes')}
                  {thCell('Uploaded', Calendar, 'uploadedAt')}
                  {thCell('Uploaded by', User, null)}
                  <th style={{ ...TH_BASE, width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? emptyEl : paginated.map((doc, idx) => {
                  const FileIcon = getFileIcon(doc.mimeType);
                  const isChecked = selected.has(doc.id);
                  const isHovered = hoveredId === doc.id;
                  const isSelected = isChecked;
                  const rowBg = isSelected ? '#EEF5FF' : isHovered ? '#F5F8FC' : '#FFFFFF';
                  const td = { padding: '0 18px', height: '60px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #E5E7EB', backgroundColor: rowBg, transition: 'background 100ms ease', verticalAlign: 'middle' };

                  const kebabItems = userRole === 'admin' ? [
                    { label: 'Share / Guest link', Icon: Link2, onClick: () => setShareDoc(doc) },
                    { label: doc.requiresAck ? 'Remove Ack requirement' : 'Require acknowledgement', Icon: ShieldCheck, onClick: () => handleAckToggle(doc) },
                    { label: 'Version history', Icon: History, onClick: () => setVersionDoc(doc) },
                    '---',
                    { label: 'Delete', Icon: Trash2, onClick: () => onDelete(doc.id), danger: true },
                  ] : [];

                  return (
                    <tr key={doc.id}
                      onMouseEnter={() => setHoveredId(doc.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {userRole === 'admin' && (
                        <td style={{ ...td, padding: '0 18px', verticalAlign: 'middle' }}>
                          <TableCheckbox checked={isChecked} onChange={() => toggleOne(doc.id)} />
                        </td>
                      )}

                      {/* Document */}
                      <td style={{ ...td, height: 'auto', padding: '12px 18px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                            <FileIcon size={13} color="#6B7280" />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#112235', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                            {doc.uploadedAt && <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{timeAgo(doc.uploadedAt)}</div>}
                            {(userRole === 'admin' || doc.tags?.length > 0) && (
                              <div style={{ marginTop: '6px' }}>
                                {userRole === 'admin'
                                  ? <TagsEditor doc={doc} onUpdated={onRefresh} />
                                  : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      {doc.tags.map(t => (
                                        <span key={t} style={{ padding: '2px 7px', backgroundColor: '#E8F0F8', borderRadius: '4px', fontSize: '10px', color: '#306196', fontWeight: '600' }}>{t}</span>
                                      ))}
                                    </div>
                                  )
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td style={{ ...td, verticalAlign: 'middle' }}><TypeBadge mimeType={doc.mimeType} /></td>

                      {/* Size */}
                      <td style={{ ...td, color: '#6B7280', fontSize: '12px', verticalAlign: 'middle' }}>{formatSize(doc.sizeBytes)}</td>

                      {/* Uploaded date */}
                      <td style={{ ...td, color: '#6B7280', fontSize: '12px', verticalAlign: 'middle' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Uploaded by */}
                      <td style={{ ...td, verticalAlign: 'middle' }}>
                        {doc.uploadedBy ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <InitialsAvatar name={doc.uploadedBy.name || doc.uploadedBy.username} role={doc.uploadedBy.role} size={20} />
                            <span style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.uploadedBy.name || doc.uploadedBy.username}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ ...td, padding: '0 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[
                            { Icon: Eye, title: 'View', onClick: () => setViewerDoc(doc) },
                            { Icon: Download, title: 'Download', onClick: () => handleDownload(doc) },
                            { Icon: MessageSquare, title: 'Comments', onClick: () => setCommentDoc(doc) },
                          ].map(({ Icon, title, onClick }) => (
                            <button
                              key={title}
                              onClick={onClick}
                              title={title}
                              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: '#6B7280', transition: 'background 0.1s, color 0.1s' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#112235'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                            >
                              <Icon size={14} />
                            </button>
                          ))}
                          {kebabItems.length > 0 && (
                            <KebabMenu items={kebabItems} rowHovered={isHovered} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationBar page={page} totalPages={totalPages} perPage={perPage} onPage={setPage} onPerPage={p => { setPerPage(p); setPage(1); }} />
        </>
      )}

      {commentDoc && <CommentsPanel doc={commentDoc} onClose={() => setCommentDoc(null)} />}
      {shareDoc   && <GuestLinkModal doc={shareDoc} onClose={() => setShareDoc(null)} />}
      {versionDoc && <VersionModal doc={versionDoc} onClose={() => setVersionDoc(null)} />}
      {viewerDoc  && <InlinePdfViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />}
      {ackDoc && (
        <AcknowledgementModal
          doc={ackDoc}
          onClose={() => { setAckDoc(null); setPendingDownload(null); }}
          onAcknowledged={handleAckComplete}
        />
      )}
    </div>
  );
}
