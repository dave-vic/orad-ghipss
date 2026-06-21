import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import api from '../../api/axios.js';

export default function TagsEditor({ doc, onUpdated }) {
  const [tags, setTags] = useState(doc.tags || []);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const addTag = async () => {
    const tag = input.trim().toLowerCase();
    if (!tag || tags.includes(tag)) { setInput(''); return; }
    const newTags = [...tags, tag];
    setTags(newTags);
    setInput('');
    await api.patch(`/documents/${doc.id}/tags`, { tags: newTags });
    onUpdated?.();
  };

  const removeTag = async (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    await api.patch(`/documents/${doc.id}/tags`, { tags: newTags });
    onUpdated?.();
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
      {tags.map(tag => (
        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#E5E7EB', borderRadius: '999px', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>
          <Tag size={9} /> {tag}
          <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', lineHeight: 1 }}><X size={10} /></button>
        </span>
      ))}
      {open ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } if (e.key === 'Escape') setOpen(false); }}
            placeholder="tag name"
            style={{ padding: '2px 8px', border: '1px solid #D1D5DB', borderRadius: '999px', fontSize: '11px', outline: 'none', width: '80px' }}
          />
          <button onClick={addTag} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A9E5E', padding: 0 }}><Plus size={13} /></button>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}><X size={13} /></button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', border: '1px dashed #D1D5DB', borderRadius: '999px', fontSize: '11px', color: '#6B7280', background: 'none', cursor: 'pointer' }}>
          <Plus size={10} /> tag
        </button>
      )}
    </div>
  );
}
