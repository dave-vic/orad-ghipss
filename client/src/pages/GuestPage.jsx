import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, ShieldCheck, Clock, CheckCircle2, EyeOff, Maximize2, Loader } from 'lucide-react';
import mammoth from 'mammoth';
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
  JPEG: { color: '#7C3AED', bg: '#EDE9FE', grad: 'linear-gradient(135deg,#EDE9FE,#C4B5FD)' },
  ZIP:  { color: '#6B7280', bg: '#F3F4F6', grad: 'linear-gradient(135deg,#F3F4F6,#D1D5DB)' },
};

const NATIVE_PREVIEW = ['PDF', 'PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'];
const DOCX_TYPES = ['DOCX', 'DOC'];
const UNSUPPORTED = ['XLSX', 'XLS', 'PPTX', 'PPT', 'ZIP'];

function DocxViewer({ viewUrl }) {
  const [html, setHtml] = useState('');
  const [renderLoading, setRenderLoading] = useState(true);
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    fetch(viewUrl, { credentials: 'omit' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then(buf => mammoth.convertToHtml({ arrayBuffer: buf }))
      .then(result => { setHtml(result.value); setRenderLoading(false); })
      .catch(err => { setRenderError(`Could not render document: ${err.message}`); setRenderLoading(false); });
  }, [viewUrl]);

  if (renderLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '10px', color: '#6B7280' }}>
      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '13px' }}>Loading document…</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  if (renderError) return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#DC2626', fontSize: '13px' }}>{renderError}</div>
  );
  return (
    <div
      style={{ padding: '32px 40px', fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.8', color: '#1F2937', overflowY: 'auto', height: '100%', backgroundColor: '#FFFFFF' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function GuestPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

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

  const canNativePreview = NATIVE_PREVIEW.includes(ext);
  const canDocxPreview = DOCX_TYPES.includes(ext);
  const canPreview = canNativePreview || canDocxPreview;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060F1E 0%, #0D2240 50%, #0A1A30 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: data?.viewOnly && canPreview ? 'flex-start' : 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: 'inherit',
    }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(48,97,150,0.12) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,97,150,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px', marginTop: data?.viewOnly && canPreview ? '16px' : '0' }}>
        <img src="/ghipss-icon.svg" alt="GhIPSS" style={{ width: '44px', height: '44px', filter: 'drop-shadow(0 4px 16px rgba(48,97,150,0.6))' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1 }}>ORAD — GhIPSS</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '500', marginTop: '3px' }}>Operations Portal · Secure Document Sharing</div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: data?.viewOnly && canPreview ? '900px' : '460px' }}>
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6)',
        }}>
          {/* Top gradient band */}
          <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '22px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '15px', width: '55%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '11px', width: '35%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '6px' }} />
                </div>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={22} color="#FCA5A5" />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', marginBottom: '3px' }}>Link Unavailable</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>This document link could not be found</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: extStyle.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                    <FileText size={24} color={extStyle.color} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#FFFFFF', border: `1.5px solid ${extStyle.bg}`, borderRadius: '5px', padding: '1px 5px', fontSize: '8px', fontWeight: '800', color: extStyle.color }}>
                    {ext}
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{formatSize(data.sizeBytes)}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{ext} file</span>
                    {data.viewOnly && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '5px', padding: '2px 7px' }}>
                        <EyeOff size={9} /> View only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px 28px' }}>
            {loading ? (
              <div>
                <div style={{ height: '44px', borderRadius: '10px', backgroundColor: '#F3F4F6', marginBottom: '16px' }} />
                <div style={{ height: '44px', borderRadius: '10px', backgroundColor: '#F3F4F6' }} />
              </div>
            ) : error ? (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500', margin: 0 }}>{error}</p>
              </div>
            ) : data.viewOnly ? (
              /* ── VIEW ONLY MODE ── */
              <div>
                {canPreview ? (
                  <>
                    {/* Viewer notice */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#EEF4FF', border: '1px solid #C7DEFF', borderRadius: '10px', marginBottom: '16px' }}>
                      <EyeOff size={13} color="#306196" />
                      <span style={{ fontSize: '12px', color: '#306196', fontWeight: '600' }}>This document is view only — downloading is not permitted</span>
                      <button
                        onClick={() => setFullscreen(v => !v)}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: '#306196', backgroundColor: '#FFFFFF', border: '1px solid #C7DEFF', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Maximize2 size={11} /> {fullscreen ? 'Compact' : 'Expand'}
                      </button>
                    </div>

                    {/* Inline viewer */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#F7F8FA', height: fullscreen ? '80vh' : '520px' }}>
                      {canDocxPreview ? (
                        <DocxViewer viewUrl={data.viewUrl} />
                      ) : ext === 'PDF' ? (
                        <iframe
                          src={`${data.viewUrl}#toolbar=0&navpanes=0`}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          title={data.name}
                        />
                      ) : (
                        <img
                          src={data.viewUrl}
                          alt={data.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  /* No preview available */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '32px 16px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: extStyle.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={26} color={extStyle.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#112235', marginBottom: '6px' }}>Preview not available</div>
                      <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
                        <strong>{ext}</strong> files cannot be previewed in the browser.<br />
                        This link is view only — downloading is not permitted.
                      </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                      <EyeOff size={13} color="#D97706" />
                      <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '600' }}>Contact the sender if you need access to this file</span>
                    </div>
                  </div>
                )}

                {/* Trust row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Encrypted</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <EyeOff size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>View only</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>© GhIPSS</span>
                </div>
              </div>
            ) : (
              /* ── DOWNLOAD MODE ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '20px' }}>
                  <ShieldCheck size={14} color="#306196" />
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    Securely shared via <strong style={{ color: '#306196' }}>ORAD GhIPSS Operations Portal</strong>
                  </span>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={downloading || done}
                  style={{
                    width: '100%', padding: '15px',
                    background: done ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 50%, #306196 100%)',
                    color: '#FFFFFF', border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '700',
                    cursor: downloading || done ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                    boxShadow: done ? '0 4px 16px rgba(5,150,105,0.35)' : '0 4px 20px rgba(48,97,150,0.45)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 8px 28px rgba(48,97,150,0.6)'; }}
                  onMouseLeave={e => { if (!downloading && !done) e.currentTarget.style.boxShadow = '0 4px 20px rgba(48,97,150,0.45)'; }}
                >
                  {done ? <CheckCircle2 size={17} /> : <Download size={17} />}
                  {done ? 'Downloaded successfully' : downloading ? 'Preparing download…' : 'Download File'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Encrypted</span>
                  </div>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#E5E7EB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Time-limited</span>
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
      <div style={{ position: 'relative', zIndex: 10, marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          Ghana Interbank Payment & Settlement Systems · ORAD Operations Portal
        </p>
      </div>
    </div>
  );
}
