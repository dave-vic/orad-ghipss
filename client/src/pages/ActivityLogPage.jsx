import { useState, useEffect, useCallback } from 'react';
import { Download, Eye, LogIn, Activity } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import TopBar from '../components/layout/TopBar.jsx';
import LogTable from '../components/activity/LogTable.jsx';
import useIsMobile from '../hooks/useIsMobile.js';

function StatCard({ label, value, Icon, color, bg }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 16px', flex: 1, minWidth: '120px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#112235', lineHeight: 1, marginBottom: '3px' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{label}</div>
      </div>
    </div>
  );
}

export default function ActivityLogPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', from: '', to: '' });

  const isAdmin = user?.role === 'admin';
  const endpoint = isAdmin ? '/logs' : '/logs/me';

  const loadLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (filters.action) params.set('action', filters.action);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);

    api.get(`${endpoint}?${params}`)
      .then(res => {
        if (isAdmin) {
          setLogs(res.data.logs || []);
          setTotal(res.data.total || 0);
        } else {
          setLogs(Array.isArray(res.data) ? res.data : []);
          setTotal(Array.isArray(res.data) ? res.data.length : 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [endpoint, page, filters, isAdmin]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const downloads = logs.filter(l => l.action === 'download').length;
  const views = logs.filter(l => l.action === 'view').length;
  const logins = logs.filter(l => l.action === 'login').length;

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Activity Log" icon={Activity} breadcrumb={[{ label: 'Tracking' }, { label: 'Activity Log' }]} />
      <div style={{ padding: isMobile ? '16px' : '28px', flex: 1 }}>
        <div style={{ display: 'flex', gap: isMobile ? '10px' : '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <StatCard label="Downloads" value={downloads} Icon={Download} color="#306196" bg="#EEF4FF" />
          <StatCard label="Views"     value={views}     Icon={Eye}      color="#306196" bg="#EEF4FF" />
          <StatCard label="Logins"    value={logins}    Icon={LogIn}    color="#306196" bg="#EEF4FF" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading...</div>
        ) : (
          <LogTable
            logs={logs}
            isAdmin={isAdmin}
            filters={filters}
            onFiltersChange={f => { setFilters(f); setPage(1); }}
            page={page}
            totalPages={totalPages}
            onPage={setPage}
          />
        )}
      </div>
    </div>
  );
}
