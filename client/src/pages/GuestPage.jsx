import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import api from '../api/axios.js';

function formatSize(bytes) {
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function getExt(name) {
  return name?.split('.').pop().toUpperCase() || 'FILE';
}

const EXT_COLOR = {
  PDF:  { color: '#DC2626', bg: '#FEE2E2' },
  DOCX: { color: '#2563EB', bg: '#DBEAFE' },
  DOC:  { color: '#2563EB', bg: '#DBEAFE' },
  XLSX: { color: '#059669', bg: '#D1FAE5' },
  XLS:  { color: '#059669', bg: '#D1FAE5' },
  PPTX: { color: '#D97706', bg: '#FEF3C7' },
  PNG:  { color: '#7C3AED', bg: '#EDE9FE' },
  JPG:  { color: '#7C3AED', bg: '#EDE9FE' },
  ZIP:  { color: '#6B7280', bg: '#F3F4F6' },
};

export default function GuestPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/guest/${token}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || 'This link is not available.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = data.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => { setDownloading(false); setDone(true); }, 1000);
  };

  const ext = getExt(data?.name);
  const extStyle = EXT_COLOR[ext] || { color: '#6B7280', bg: '#F3F4F6' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#040C18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* Background dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(48,97,150,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      {/* Glow orbs */}
      <div style={{ position: 'absolute', left: '-150px', top: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,97,150,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: '-100px', bottom: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(17,34,53,0.6) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Brand header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
        <img src="/ghipss-icon.svg" alt="GhIPSS" style={{ width: '36px', height: '36px', filter: 'drop-shadow(0 2px 8px rgba(48,97,150,0.4))' }} />
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1 }}>ORAD</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>GhIPSS Operations Portal</div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 64px rgba(0,0,0,0.55)' }}>

          {/* Gradient top line */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #1A3A5C, #306196 40%, #6FA8D6 60%, #306196)' }} />

          <div style={{ padding: '32px 36px 36px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#F3F4F6' }} />
                <div style={{ height: '18px', width: '70%', backgroundColor: '#F3F4F6', borderRadius: '6px' }} />
                <div style={{ height: '13px', width: '40%', backgroundColor: '#F3F4F6', borderRadius: '6px' }} />
              </div>

            ) : error ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '12px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={28} color="#DC2626" />
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#112235', letterSpacing: '-0.3px' }}>Link Unavailable</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>{error}</div>
              </div>

            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

                {/* File icon */}
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '18px', backgroundColor: extStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={32} color={extStyle.color} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', backgroundColor: extStyle.bg, border: `2px solid #FFFFFF`, borderRadius: '6px', padding: '2px 5px', fontSize: '9px', fontWeight: '800', color: extStyle.color, letterSpacing: '0.05em' }}>
                    {ext}
                  </div>
                </div>

                {/* Label */}
                {data.label && (
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Shared with you
                  </div>
                )}

                {/* File name */}
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#112235', letterSpacing: '-0.3px', marginBottom: '6px', wordBreak: 'break-word', lineHeight: 1.3 }}>
                  {data.name}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{formatSize(data.sizeBytes)}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#D1D5DB' }} />
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{ext} file</span>
                </div>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading || done}
                  style={{ width: '100%', padding: '14px', background: done ? '#059669' : 'linear-gradient(135deg, #1A3A5C 0%, #306196 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: downloading || done ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: done ? '0 4px 16px rgba(5,150,105,0.3)' : '0 4px 18px rgba(48,97,150,0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 6px 24px rgba(48,97,150,0.55)'; }}
                  onMouseLeave={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 4px 18px rgba(48,97,150,0.4)'; }}
                >
                  <Download size={16} />
                  {done ? 'Downloaded' : downloading ? 'Downloading…' : 'Download File'}
                </button>

                {/* Trust row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={11} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Secure link</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={11} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Time-limited</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>GhIPSS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
