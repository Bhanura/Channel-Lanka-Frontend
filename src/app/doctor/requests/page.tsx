'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Search, Send, CheckCircle2, XCircle } from 'lucide-react';

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [offer, setOffer] = useState('');
  const [sendingTo, setSendingTo] = useState('');

  const fetchReqs = () => api.get('/doctors/requests').then(r => setRequests(r.data.data || []));
  useEffect(() => { fetchReqs(); }, []);

  const searchCenters = () => {
    api.get(`/search/centers?q=${search}`).then(r => setCenters(r.data.data.centers || []));
  };

  const sendRequest = async (centerId: string) => {
    await api.post('/doctors/requests/send', { centerId, offerDetails: offer });
    setShowSearch(false); setOffer(''); fetchReqs();
  };

  const respond = async (id: string, status: string) => {
    await api.patch(`/doctors/requests/${id}/respond`, { status });
    fetchReqs();
  };

  const statusColor: Record<string, string> = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' };

  return (
    <DashboardShell title="Center Requests" subtitle="Send and manage connection requests with channeling centers">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowSearch(v => !v)}><Search size={14} /> Find & Request a Center</button>
      </div>

      {showSearch && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search centers by name or location…" style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={searchCenters}><Search size={14} /> Search</button>
            </div>
            {centers.map(c => (
              <div key={c.center_id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.location}</div>
                {sendingTo === c.center_id ? (
                  <div style={{ marginTop: 10 }}>
                    <textarea className="form-input" value={offer} onChange={e => setOffer(e.target.value)} placeholder="Brief message / offer to the center…" rows={2} style={{ marginBottom: 8 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => sendRequest(c.center_id)}><Send size={13} /> Send Request</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSendingTo('')}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setSendingTo(c.center_id)}>Send Request</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 600 }}>All Requests</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Center</th><th>Initiated By</th><th>Offer</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.channeling_centers?.name}<div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.channeling_centers?.location}</div></td>
                  <td><span className={`badge ${r.initiated_by_role === 'doctor' ? 'badge-info' : 'badge-muted'}`}>{r.initiated_by_role}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200 }}>{r.offer_details || '—'}</td>
                  <td><span className={`badge ${statusColor[r.request_status]}`}>{r.request_status}</span></td>
                  <td>
                    {r.request_status === 'pending' && r.initiated_by_role === 'center' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => respond(r.id, 'accepted')}><CheckCircle2 size={13} /> Accept</button>
                        <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => respond(r.id, 'rejected')}><XCircle size={13} /> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No requests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
