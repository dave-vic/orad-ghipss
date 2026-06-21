import { useEffect, useState, useRef } from 'react';
import { X, Download, Loader } from 'lucide-react';
import api from '../../api/axios.js';

export default function InlinePdfViewer({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    api.get(`/documents/${doc.id}/view-blob`, { responseType: 'blob' })
      .then(res => {
        const url = URL.createObjectURL(res.data);
        urlRef.current = url;
        setBlobUrl(url);
      })
      .catch(() => setError('Failed to load PDF.'));

    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [doc.id]);

  const handleSaveLocal = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.name;
    a.click();
  };

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '55vw', minWidth: '520px', height: '100vh', backgroundColor: '#FFFFFF', borderLeft: '2px solid #D0DCE8', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #EBF1F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, backgroundColor: '#F8FAFC' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C2D3E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '360px' }}>{doc.name}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {blobUrl && (
            <button onClick={handleSaveLocal} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#0F1C2E', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              <Download size={12} /> Download
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B849A', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!blobUrl && !error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B849A', gap: '10px', fontSize: '14px' }}>
          <Loader size={18} /> Loading PDF…
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#C0392B', fontSize: '14px' }}>
          <span>{error}</span>
        </div>
      )}

      {blobUrl && (
        <embed
          src={blobUrl}
          type="application/pdf"
          style={{ flex: 1, width: '100%', border: 'none' }}
        />
      )}
    </div>
  );
}
