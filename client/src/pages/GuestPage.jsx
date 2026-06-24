import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
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
  PDF:  { color: '#DC2626', bg: '#FEE2E2', grad: 'linear-gradient(135deg,#FEE2E2,#FCA5A5)' },
  DOCX: { color: '#2563EB', bg: '#DBEAFE', grad: 'linear-gradient(135deg,#DBEAFE,#93C5FD)' },
  DOC:  { color: '#2563EB', bg: '#DBEAFE', grad: 'linear-gradient(135deg,#DBEAFE,#93C5FD)' },
  XLSX: { color: '#059669', bg: '#D1FAE5', grad: 'linear-gradient(135deg,#D1FAE5,#6EE7B7)' },
  XLS:  { color: '#059669', bg: '#D1FAE5', grad: 'linear-gradient(135deg,#D1FAE5,#6EE7B7)' },
  PPTX: { color: '#D97706', bg: '#FEF3C7', grad: 'linear-gradient(135deg,#FEF3C7,#FCD34D)' },
  PNG:  { color: '#7C3AED', bg: '#EDE9FE', grad: 'linear-gradient(135deg,#EDE9FE,#C4B5FD)' },
  JPG:  { color: '#7C3AED', bg: '#EDE9FE', grad: 'linear-gradient(135deg,#EDE9FE,#C4B5FD)' },
  ZIP:  { color: '#6B7280', bg: '#F3F4F6', grad: 'linear-gradient(135deg,#F3F4F6,#D1D5DB)' },
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
  const extStyle = EXT_COLOR[ext] || { color: '#6B7280', bg: '#F3F4F6', grad: 'linear-gradient(135deg,#F3F4F6,#D1D5DB)' };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060F1E 0%, #0D2240 50%, #0A1A30 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: 'inherit',
    }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(48,97,150,0.12) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,97,150,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,58,92,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <img src="/ghipss-icon.svg" alt="GhIPSS" style={{ width: '52px', height: '52px', filter: 'drop-shadow(0 4px 16px rgba(48,97,150,0.6))' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1 }}>ORAD — GhIPSS</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '500', marginTop: '3px', letterSpacing: '0.04em' }}>Operations Portal · Secure Document Sharing</div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(48,97,150,0.15)',
        }}>
          {/* Top gradient band */}
          <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '28px 32px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* decorative circles */}
            <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '-30px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', width: '60%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', width: '40%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '6px' }} />
                </div>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={24} color="#FCA5A5" />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', marginBottom: '3px' }}>Link Unavailable</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>This document link could not be found</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* File type icon */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: extStyle.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                    <FileText size={26} color={extStyle.color} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: '#FFFFFF', border: `1.5px solid ${extStyle.bg}`, borderRadius: '5px', padding: '1px 5px', fontSize: '8px', fontWeight: '800', color: extStyle.color, letterSpacing: '0.05em' }}>
                    {ext}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{formatSize(data.sizeBytes)}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{ext} file</span>
                    {data.label && (
                      <>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', color: 'rgba(111,168,214,0.9)', fontWeight: '600' }}>{data.label}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div style={{ padding: '28px 32px 32px' }}>
            {loading ? (
              <div>
                <div style={{ height: '48px', borderRadius: '12px', backgroundColor: '#F3F4F6', marginBottom: '20px' }} />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: '12px', width: '70px', borderRadius: '6px', backgroundColor: '#F3F4F6' }} />)}
                </div>
              </div>
            ) : error ? (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500', margin: 0, lineHeight: 1.6 }}>{error}</p>
              </div>
            ) : (
              <>
                {/* Shared with label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '20px' }}>
                  <ShieldCheck size={14} color="#306196" />
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    This file was securely shared via <strong style={{ color: '#306196' }}>ORAD GhIPSS Operations Portal</strong>
                  </span>
                </div>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading || done}
                  style={{
                    width: '100%', padding: '15px',
                    background: done
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 50%, #306196 100%)',
                    color: '#FFFFFF', border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '700',
                    cursor: downloading || done ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                    boxShadow: done ? '0 4px 16px rgba(5,150,105,0.35)' : '0 4px 20px rgba(48,97,150,0.45)',
                    transition: 'all 0.2s', letterSpacing: '-0.2px',
                  }}
                  onMouseEnter={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 8px 28px rgba(48,97,150,0.6)'; }}
                  onMouseLeave={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 4px 20px rgba(48,97,150,0.45)'; }}
                >
                  {done ? <CheckCircle2 size={17} /> : <Download size={17} />}
                  {done ? 'Downloaded successfully' : downloading ? 'Preparing download…' : 'Download File'}
                </button>

                {/* Trust badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Encrypted</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Time-limited</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>© GhIPSS</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: '28px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '500', margin: 0 }}>
          Ghana Interbank Payment & Settlement Systems · ORAD Operations Portal
        </p>
      </div>
    </div>
  );
}
