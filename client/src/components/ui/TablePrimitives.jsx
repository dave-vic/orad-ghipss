import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Minus, MoreHorizontal } from 'lucide-react';

/* ─── TableCheckbox ──────────────────────────────────────────────────────────── */
export function TableCheckbox({ checked, indeterminate, onChange, disabled }) {
  const filled = checked || indeterminate;
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
        border: filled ? 'none' : '1.5px solid #9CA3AF',
        backgroundColor: filled ? '#112235' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', transition: 'background 0.1s',
      }}
    >
      {indeterminate && <Minus size={10} color="#FFFFFF" strokeWidth={3} />}
      {checked && !indeterminate && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
    </div>
  );
}

/* ─── ToggleSwitch ───────────────────────────────────────────────────────────── */
export function ToggleSwitch({ on, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: '36px', height: '20px', borderRadius: '10px',
        backgroundColor: on ? '#306196' : '#D1D5DB',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 150ms ease', flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: '2px', left: on ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        transition: 'left 150ms ease',
      }} />
    </div>
  );
}

/* ─── KebabMenu ──────────────────────────────────────────────────────────────── */
// items: [{ label, Icon, onClick, danger }] or '---' for divider
export function KebabMenu({ items, rowHovered }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const click = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc); };
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    setOpen(v => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        title="More actions"
        style={{
          width: '24px', height: '24px', borderRadius: '4px', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: open ? '#F3F4F6' : 'transparent',
          color: '#6B7280', cursor: 'pointer',
          opacity: 1,
          pointerEvents: 'auto',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
            backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            padding: '4px 0', minWidth: '160px',
          }}
        >
          {items.map((item, i) => {
            if (item === '---') return <div key={i} style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />;
            const { label, Icon, onClick, danger } = item;
            return (
              <button
                key={label}
                onClick={() => { setOpen(false); onClick(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 14px', fontSize: '13px',
                  color: danger ? '#DC2626' : '#374151',
                  backgroundColor: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = danger ? '#FEF2F2' : '#F5F8FC'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {Icon && <Icon size={14} color={danger ? '#DC2626' : '#6B7280'} />}
                {label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

/* ─── PaginationBar ──────────────────────────────────────────────────────────── */
const PER_PAGE_OPTS = [10, 20, 50];

export function PaginationBar({ page, totalPages, perPage, onPage, onPerPage }) {
  const atStart = page <= 1;
  const atEnd = page >= (totalPages || 1);
  const btnStyle = (disabled) => ({
    padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px',
    fontSize: '13px', color: '#374151', backgroundColor: '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 4px', height: '44px',
      borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => !atStart && onPage(page - 1)} disabled={atStart} style={btnStyle(atStart)}
          onMouseEnter={e => { if (!atStart) e.currentTarget.style.backgroundColor = '#F5F8FC'; }}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >‹ Prev</button>
        <span style={{ fontSize: '13px', color: '#6B7280', margin: '0 4px' }}>
          Page {page} of {totalPages || 1}
        </span>
        <button onClick={() => !atEnd && onPage(page + 1)} disabled={atEnd} style={btnStyle(atEnd)}
          onMouseEnter={e => { if (!atEnd) e.currentTarget.style.backgroundColor = '#F5F8FC'; }}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >Next ›</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {PER_PAGE_OPTS.map(n => (
          <span
            key={n}
            onClick={() => { onPerPage(n); onPage(1); }}
            style={{
              fontSize: '13px', cursor: 'pointer',
              color: perPage === n ? '#112235' : '#6B7280',
              fontWeight: perPage === n ? '600' : '400',
            }}
          >
            {perPage === n ? `${n} rows` : n}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── SearchInput ────────────────────────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder, width = 260 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', width }}>
      <span style={{
        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
        fontSize: '13px', color: '#9CA3AF', pointerEvents: 'none',
      }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '7px 12px 7px 32px',
          border: `1px solid ${focused ? '#306196' : '#D1D5DB'}`,
          borderRadius: '6px', fontSize: '13px', color: '#112235',
          backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 3px rgba(48,97,150,0.15)' : 'none',
          transition: 'border-color 0.1s, box-shadow 0.1s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

/* ─── SortBtn ────────────────────────────────────────────────────────────────── */
export function SortBtn({ col, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onSort(col); }}
      style={{
        marginLeft: 'auto', fontSize: '11px', cursor: 'pointer',
        color: active ? '#306196' : '#9CA3AF',
        paddingLeft: '6px', userSelect: 'none',
      }}
    >
      {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

/* ─── InitialsAvatar ─────────────────────────────────────────────────────────── */
const ROLE_AVATAR = {
  admin:  { bg: '#FEE2E2', color: '#DC2626' },
  member: { bg: '#D1FAE5', color: '#059669' },
  viewer: { bg: '#FEF3C7', color: '#D97706' },
};

export function InitialsAvatar({ name, role, size = 20 }) {
  const initials = (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const { bg, color } = ROLE_AVATAR[role] || { bg: '#E5E7EB', color: '#6B7280' };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.max(8, Math.floor(size * 0.42)) + 'px', fontWeight: '700', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ─── BulkBar ────────────────────────────────────────────────────────────────── */
export function BulkBar({ count, actions, onClear }) {
  if (!count) return null;
  return (
    <div style={{
      backgroundColor: '#EEF5FF', borderTop: '1px solid #306196', borderBottom: '1px solid #306196',
      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontSize: '13px', fontWeight: '600', color: '#306196' }}>{count} item{count !== 1 ? 's' : ''} selected</span>
      {actions}
      <button
        onClick={onClear}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '13px', color: '#6B7280', cursor: 'pointer' }}
      >
        Clear
      </button>
    </div>
  );
}

/* ─── GhostBtn ───────────────────────────────────────────────────────────────── */
export function GhostBtn({ children, onClick, style: extra }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '6px',
        fontSize: '13px', color: '#374151', backgroundColor: '#FFFFFF',
        cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px',
        ...extra,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
    >
      {children}
    </button>
  );
}
