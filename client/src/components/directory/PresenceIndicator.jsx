import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export default function PresenceIndicator({ folderId }) {
  const { user } = useAuth();
  const [viewers, setViewers] = useState([]);
  const esRef = useRef(null);

  useEffect(() => {
    const es = new EventSource(`/api/folders/${folderId}/presence`, { withCredentials: true });
    esRef.current = es;

    es.addEventListener('presence', (e) => {
      setViewers(JSON.parse(e.data));
    });

    es.onerror = () => { es.close(); };

    return () => { es.close(); };
  }, [folderId]);

  const others = viewers.filter(v => v.id !== user?.id);

  if (others.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A9E5E', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '12px', color: '#6B849A' }}>
          {others.length === 1
            ? `${others[0].name} is also here`
            : `${others.length} others here`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {others.slice(0, 3).map(v => (
          <div key={v.id} title={v.name} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F1C2E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', border: '2px solid #FFFFFF' }}>
            {v.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
