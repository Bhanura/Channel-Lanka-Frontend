'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { CreditCard, Download } from 'lucide-react';

export default function CenterPaymentsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total_revenue: 0, this_month_revenue: 0, pending_payouts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    setLoading(true);
    Promise.all([
      api.get(`/centers/${selectedCenter}/payments`),
      api.get(`/centers/${selectedCenter}/stats`)
    ]).then(([p, s]) => {
      setPayments(p.data.data || []);
      setStats(s.data.data || { total_revenue: 0, this_month_revenue: 0, pending_payouts: 0 });
    }).finally(() => setLoading(false));
  }, [selectedCenter]);

  return (
    <DashboardShell title="Center Finances" subtitle="Revenue, payouts, and payment history">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24, background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
          <div style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Total Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-900)' }}>LKR {stats.total_revenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>This Month Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>LKR {stats.this_month_revenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Pending Payouts</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>LKR {stats.pending_payouts?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Recent Transactions</div>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export CSV</button>
        </div>
        <div className="table-wrapper">
          {loading && selectedCenter ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading payments…</div> : (
            <table>
              <thead><tr><th>Transaction Ref</th><th>Date</th><th>Gross Amount</th><th>Platform Fee & Tax</th><th>Center Net (LKR)</th><th>Status</th></tr></thead>
              <tbody>
                {payments.map(p => {
                  const net = p.total_amount - (p.platform_fee || 0) - (p.tax || 0);
                  return (
                    <tr key={p.payment_id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CreditCard size={14} color="var(--primary-400)" />
                          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{p.transaction_reference || 'MANUAL'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{p.total_amount?.toFixed(2)}</td>
                      <td style={{ fontSize: 13, color: 'var(--danger)' }}>- {(p.platform_fee + p.tax)?.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>{net.toFixed(2)}</td>
                      <td><span className={`badge ${p.payment_status === 'paid' ? 'badge-success' : 'badge-danger'}`}>{p.payment_status}</span></td>
                    </tr>
                  );
                })}
                {payments.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No transactions found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
