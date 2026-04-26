'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/logs?page=${page}&limit=30`).then(r => {
      setLogs(r.data.data.logs || []);
      setTotal(r.data.data.total || 0);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <DashboardShell title="System Logs" subtitle="Audit trail of all platform admin actions">
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr><th>Action</th><th>Description</th><th>Performed By</th><th>Time</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><span className="badge badge-info">{log.action}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360 }}>{log.description}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.performed_by?.slice(0, 8)}…</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No logs found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
        {total > 30 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 12px' }}>Page {page}</span>
            <button className="btn btn-secondary btn-sm" disabled={logs.length < 30} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
