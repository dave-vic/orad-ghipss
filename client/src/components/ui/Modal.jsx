import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ title, subtitle, onClose, footer, children, width = 460, danger = false }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(10,20,40,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          width: '100%',
          maxWidth: `${width}px`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          overflow: 'hidden',
          animation: 'modalIn 0.18s ease',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '18px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: danger ? '#DC2626' : '#112235', lineHeight: 1.3 }}>{title}</h2>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: 'none', border: '1px solid #E5E7EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9CA3AF', transition: 'all 0.1s', marginTop: '-2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
            flexShrink: 0, backgroundColor: '#FAFAFA',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── Shared button styles ─────────────────────────────── */
export const cancelBtnStyle = {
  padding: '8px 18px', fontSize: '13px', fontWeight: '600',
  backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB',
  borderRadius: '8px', color: '#374151', cursor: 'pointer',
};
export const primaryBtnStyle = {
  padding: '8px 18px', fontSize: '13px', fontWeight: '700',
  backgroundColor: '#306196', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
};
export const dangerBtnStyle = {
  padding: '8px 18px', fontSize: '13px', fontWeight: '700',
  backgroundColor: '#DC2626', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
};
