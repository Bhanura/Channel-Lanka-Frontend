'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Settings } from 'lucide-react';

export default function PaymentConfigPage() {
  const [config, setConfig] = useState({ platform_fee_pct: 5, tax_pct: 2.5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/payment-config').then(r => { if (r.data.data) setConfig(r.data.data); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await api.post('/admin/payment-config', { platformFeePct: config.platform_fee_pct, taxPct: config.tax_pct });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const example = { doctorFee: 2000, centerFee: 500 };
  const platform = (example.doctorFee + example.centerFee) * config.platform_fee_pct / 100;
  const tax = (example.doctorFee + example.centerFee) * config.tax_pct / 100;
  const total = example.doctorFee + example.centerFee + platform + tax;

  return (
    <DashboardShell title="Payment Configuration" subtitle="Set platform fee and tax percentages">
      <div style={{ maxWidth: 560 }}>
        {saved && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✅ Configuration saved successfully!</div>}

        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18} /> Fee Configuration</div></div>
          <div className="card-body">
            {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Platform Fee (%)</label>
                  <input type="number" className="form-input" value={config.platform_fee_pct} step="0.1" min="0" max="50"
                    onChange={e => setConfig(c => ({ ...c, platform_fee_pct: parseFloat(e.target.value) }))} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Applied as percentage of (doctor fee + center fee)</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (%)</label>
                  <input type="number" className="form-input" value={config.tax_pct} step="0.1" min="0" max="50"
                    onChange={e => setConfig(c => ({ ...c, tax_pct: parseFloat(e.target.value) }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Configuration'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="card mt-4">
          <div className="card-header"><div style={{ fontWeight: 600 }}>Live Preview</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Based on example: Doctor LKR 2000 + Center LKR 500</div></div>
          <div className="card-body">
            {[
              { label: 'Doctor Fee', amount: example.doctorFee },
              { label: 'Center Fee', amount: example.centerFee },
              { label: `Platform Fee (${config.platform_fee_pct}%)`, amount: platform },
              { label: `Tax (${config.tax_pct}%)`, amount: tax },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>LKR {row.amount.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 16, color: 'var(--primary-600)' }}>
              <span>Total</span><span>LKR {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
