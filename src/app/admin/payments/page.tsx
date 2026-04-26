'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { CreditCard } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/payments/all?page=${page}&limit=30`).then(r => {
      setPayments(r.data.data.payments || []);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <DashboardShell title="Platform Payments" subtitle="System-wide payment ledger and revenue tracking">
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(to right, var(--primary-800), var(--primary-600))', color: '#fff' }}>
        <div className="card-body" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Total Platform Revenue (Demo)</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>LKR {payments.reduce((acc, p) => acc + (p.platform_fee || 0), 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr><th>Transaction Ref</th><th>Date</th><th>Amount</th><th>Platform Fee</th><th>Tax</th><th>Status</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.payment_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CreditCard size={14} color="var(--primary-400)" />
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{p.transaction_reference || 'MANUAL'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>LKR {p.total_amount?.toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>LKR {p.platform_fee?.toFixed(2)}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>LKR {p.tax?.toFixed(2)}</td>
                    <td><span className={`badge ${p.payment_status === 'paid' ? 'badge-success' : p.payment_status === 'refunded' ? 'badge-muted' : 'badge-danger'}`}>{p.payment_status}</span></td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No payments recorded yet</td></tr>}
              </tbody>
            </table>
          )}
        </div>
        {payments.length === 30 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
