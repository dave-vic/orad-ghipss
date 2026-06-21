import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Megaphone, ChevronRight, Trash2, X, MoreHorizontal, Pencil, Folder } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import TopBar from '../components/layout/TopBar.jsx';
import DocumentTable from '../components/directory/DocumentTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import FolderManagementModal from '../components/directory/FolderManagementModal.jsx';
import Toast from '../components/ui/Toast.jsx';
import PresenceIndicator from '../components/directory/PresenceIndicator.jsx';
import DragDropUpload from '../components/ui/DragDropUpload.jsx';

const ALL_FOLDERS_META = {
  'f-sop': 'Standard Operating Procedures',
  'f-manuals': 'Product Manuals',
  'f-partner': 'Partner Documents',
  'f-onboard': 'Onboarding Materials',
  'f-internal': 'Internal Admin Files',
};

export default function FolderPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const menuRef = useRef(null);

  const loadDocuments = () => {
    setLoading(true);
    Promise.all([
      api.get(`/folders/${folderId}/documents`),
      api.get(`/folders/${folderId}`).catch(() => ({ data: null })),
    ]).then(([docsRes, folderRes]) => {
      setDocuments(docsRes.data);
      if (folderRes.data) setFolder(folderRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadDocuments(); }, [folderId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', uploadFile);
    try {
      await api.post(`/folders/${folderId}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowUpload(false);
      setUploadFile(null);
      loadDocuments();
      setToast({ message: 'File uploaded successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      loadDocuments();
      setToast({ message: 'Document deleted', type: 'success' });
    } catch {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const handleDeleteFolder = async () => {
    setDeletingFolder(true);
    try {
      await api.delete(`/folders/${folderId}`);
      navigate('/directory');
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to delete folder', type: 'error' });
      setShowDeleteFolder(false);
    } finally {
      setDeletingFolder(false);
    }
  };

  const folderName = ALL_FOLDERS_META[folderId] || (folder?.name) || 'Folder';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={folderName}
        icon={Folder}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PresenceIndicator folderId={folderId} />
            {user?.role === 'admin' && (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: menuOpen ? '#F3F4F6' : '#FFFFFF', cursor: 'pointer', color: '#6B7280', transition: 'all 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  {editLoading ? <span style={{ fontSize: '11px', color: '#6B7280' }}>…</span> : <MoreHorizontal size={15} />}
                </button>
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                    <div style={{ position: 'absolute', top: '38px', right: 0, zIndex: 50, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '160px', overflow: 'hidden' }}>
                      <button
                        onClick={async () => {
                          setMenuOpen(false);
                          setEditLoading(true);
                          try {
                            const { data } = await api.get(`/folders/${folderId}`);
                            setFolder(data);
                            setShowEdit(true);
                          } catch {
                            setToast({ message: 'Could not load folder details', type: 'error' });
                          } finally {
                            setEditLoading(false);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Pencil size={13} color="#6B7280" /> Edit folder
                      </button>
                      <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '2px 0' }} />
                      <button
                        onClick={() => { setMenuOpen(false); setShowDeleteFolder(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#DC2626', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={13} color="#DC2626" /> Delete folder
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        }
      />
      <div style={{ padding: '28px', flex: 1 }}>

        {folder?.announcement && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', backgroundColor: '#FFF3DC', border: '1px solid #E8971A', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#112235' }}>
            <Megaphone size={15} color="#E8971A" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{folder.announcement}</span>
          </div>
        )}

        {loading ? (
          <div style={{ color: '#6B7280', textAlign: 'center', marginTop: '60px' }}>Loading documents...</div>
        ) : (
          <DocumentTable
            documents={documents}
            userRole={user?.role}
            onDelete={handleDelete}
            onToast={setToast}
            onRefresh={loadDocuments}
            onUpload={() => setShowUpload(true)}
          />
        )}

        {showUpload && (
          <Modal
            title="Upload Document"
            subtitle="Add a file to this folder"
            onClose={() => { setShowUpload(false); setUploadFile(null); }}
            footer={
              <>
                <button type="button" onClick={() => { setShowUpload(false); setUploadFile(null); }} style={{ padding: '8px 18px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleUpload} disabled={!uploadFile || uploading} style={{ padding: '8px 18px', backgroundColor: !uploadFile || uploading ? '#9CA3AF' : '#306196', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: !uploadFile || uploading ? 'not-allowed' : 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (uploadFile && !uploading) e.currentTarget.style.backgroundColor = '#245078'; }}
                  onMouseLeave={e => { if (uploadFile && !uploading) e.currentTarget.style.backgroundColor = '#306196'; }}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </>
            }
          >
            <DragDropUpload multiple={false} onFilesSelected={(files) => setUploadFile(files[0])} />
          </Modal>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>

      {/* Edit folder modal */}
      {showEdit && folder && (
        <FolderManagementModal
          folder={folder}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); loadDocuments(); setToast({ message: 'Folder updated', type: 'success' }); }}
        />
      )}

      {/* Delete folder confirmation */}
      {showDeleteFolder && (
        <Modal
          title="Delete folder"
          subtitle={`"${folderName}" will be permanently removed.`}
          onClose={() => setShowDeleteFolder(false)}
          danger
          width={420}
          footer={
            <>
              <button onClick={() => setShowDeleteFolder(false)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeleteFolder} disabled={deletingFolder} style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '8px', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: deletingFolder ? 'not-allowed' : 'pointer', opacity: deletingFolder ? 0.7 : 1 }}>
                {deletingFolder ? 'Deleting…' : 'Delete folder'}
              </button>
            </>
          }
        >
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626', marginBottom: '4px' }}>This cannot be undone</div>
            <div style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.8 }}>
              <div>• The folder and all its documents will be deleted</div>
              <div>• Shared links to these documents will stop working</div>
              <div>• Activity log entries will be retained</div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Are you sure you want to delete <strong style={{ color: '#112235' }}>"{folderName}"</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
