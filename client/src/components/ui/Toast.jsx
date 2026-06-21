import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const TYPES = {
  success: { bg: '#059669', Icon: CheckCircle2 },
  error:   { bg: '#DC2626', Icon: AlertCircle },
  info:    { bg: '#112235', Icon: Info },
};

const DURATION = 5000;

export default function Toast({ message, type = 'success', onClose, onUndo }) {
  const t = TYPES[type] || TYPES.info;
  const { Icon } = t;
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    timerRef.current = setTimeout(onClose, DURATION);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [onClose]);

  const handleUndo = () => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    onUndo?.();
    onClose();
  };

  return (
    <div className="toast-in" style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
      backgroundColor: t.bg, color: '#FFFFFF',
      borderRadius: '10px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
      minWidth: '280px', maxWidth: '380px',
      overflow: 'hidden',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px' }}>
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', lineHeight: 1.4 }}>{message}</span>

        {onUndo && (
          <button
            onClick={handleUndo}
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '5px',
              cursor: 'pointer', color: '#FFFFFF', fontSize: '12px', fontWeight: '700',
              padding: '4px 9px', flexShrink: 0, transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          >
            Undo
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center',
            padding: '2px', borderRadius: '4px', flexShrink: 0, transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'rgba(255,255,255,0.5)',
          transition: 'width 0.1s linear',
        }} />
      </div>
    </div>
  );
}
