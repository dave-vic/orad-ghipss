const roleMeta = {
  admin:  { label: 'Admin',  color: '#DC2626', bg: '#FEE2E2', border: 'rgba(220,38,38,0.2)'  },
  member: { label: 'Member', color: '#059669', bg: '#D1FAE5', border: 'rgba(5,150,105,0.2)'  },
  viewer: { label: 'Viewer', color: '#D97706', bg: '#FEF3C7', border: 'rgba(217,119,6,0.2)'  },
};

export default function RoleBadge({ role }) {
  const meta = roleMeta[role] || { label: role, color: '#6B7280', bg: '#F3F4F6', border: 'rgba(107,114,128,0.2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: '600',
      color: meta.color, backgroundColor: meta.bg,
      border: `1px solid ${meta.border}`,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  );
}
