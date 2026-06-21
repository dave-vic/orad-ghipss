import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../api/axios.js';

export default function FavouriteButton({ type, targetId, targetName, initialState = false, size = 16 }) {
  const [faved, setFaved] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (faved) {
        await api.delete(`/favourites/${type}/${targetId}`);
      } else {
        await api.post('/favourites', { type, targetId, targetName });
      }
      setFaved(f => !f);
    } catch {} finally { setLoading(false); }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={faved ? 'Remove from favourites' : 'Add to favourites'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: faved ? '#E8971A' : '#D0DCE8', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
      onMouseEnter={e => { if (!faved) e.currentTarget.style.color = '#E8971A'; }}
      onMouseLeave={e => { if (!faved) e.currentTarget.style.color = '#D0DCE8'; }}
    >
      <Star size={size} fill={faved ? '#E8971A' : 'none'} />
    </button>
  );
}
