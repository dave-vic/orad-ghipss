import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, FileText, X, Check } from 'lucide-react';
import api from '../../api/axios.js';

export default function AcknowledgementModal({ doc, onAcknowledged, onClose }) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post(`/documents/${doc.id}/acknowledge`);
      onAcknowledged();
    } catch {
      onAcknowledged();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(11,24,44,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '460px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '24px 24px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px', marginBottom: '3px' }}>Acknowledgement Required</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Review required before accessing this document</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 24px' }}>
          {/* Document name card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '18px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={15} color="#306196" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Document</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 16px' }}>
            This document requires your acknowledgement before you can download it. Your confirmation will be permanently recorded with a timestamp.
          </p>

          {/* Checkbox */}
          <label
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', backgroundColor: checked ? '#EEF4FF' : '#F7F8FA', border: `1.5px solid ${checked ? '#306196' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${checked ? '#306196' : '#D1D5DB'}`, backgroundColor: checked ? '#306196' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.15s' }}>
              {checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
            </div>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ display: 'none' }} />
            <span style={{ fontSize: '13px', color: checked ? '#112235' : '#374151', lineHeight: 1.55, fontWeight: checked ? '600' : '400', transition: 'color 0.15s' }}>
              I confirm that I have read, understood, and agree to comply with the contents of this document. I understand this acknowledgement is recorded.
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '600', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F8FA'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!checked || loading}
              style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '10px', backgroundColor: checked && !loading ? '#306196' : '#E5E7EB', color: checked && !loading ? '#FFFFFF' : '#9CA3AF', cursor: checked && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', boxShadow: checked && !loading ? '0 4px 12px rgba(48,97,150,0.25)' : 'none' }}
              onMouseEnter={e => { if (checked && !loading) e.currentTarget.style.backgroundColor = '#245078'; }}
              onMouseLeave={e => { if (checked && !loading) e.currentTarget.style.backgroundColor = '#306196'; }}
            >
              {loading ? 'Confirming…' : 'I acknowledge & continue'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
