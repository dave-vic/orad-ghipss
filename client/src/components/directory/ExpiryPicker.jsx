import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import api from '../../api/axios.js';

export default function ExpiryPicker({ doc, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(doc.expiresAt ? new Date(doc.expiresAt).toISOString().slice(0,16) : '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await api.patch(`/documents/${doc.id}/expiry`, { expiresAt: value || null });
    setSaving(false);
    setOpen(false);
    onUpdated?.();
  };

  const isExpired = doc.expiresAt && new Date() > new Date(doc.expiresAt);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} title="Set expiry" style={{ padding: '5px 8px', backgroundColor: isExpired ? '#FDECEA' : doc.expiresAt ? '#FFF3DC' : '#E5E7EB', border: `1px solid ${isExpired ? '#C0392B' : doc.expiresAt ? '#E8971A' : '#D1D5DB'}`, borderRadius: '6px', cursor: 'pointer', color: isExpired ? '#C0392B' : doc.expiresAt ? '#E8971A' : '#6B7280', display: 'flex', alignItems: 'center', fontSize: '11px', gap: '3px', fontWeight: '600' }}>
        <Clock size={11} /> {isExpired ? 'Expired' : doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : 'Expiry'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <input type="datetime-local" value={value} onChange={e => setValue(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '11px', outline: 'none' }} />
      <button onClick={save} disabled={saving} style={{ padding: '4px 8px', backgroundColor: '#112235', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Save</button>
      <button onClick={() => { setValue(''); save(); }} style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B' }} title="Clear expiry"><X size={12} /></button>
      <button onClick={() => setOpen(false)} style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={12} /></button>
    </div>
  );
}
