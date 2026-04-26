'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { User, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function CenterDoctorsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search logic for inviting new doctors
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [offer, setOffer] = useState('');
  const [sendingTo, setSendingTo] = useState('');

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  const fetchData = () => {
    if (!selectedCenter) return;
    setLoading(true);
    Promise.all([
      api.get(`/centers/${selectedCenter}/doctors`),
      api.get(`/centers/${selectedCenter}/doctors/requests`)
    ]).then(([d, r]) => {
      setDoctors(d.data.data || []);
      setRequests(r.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [selectedCenter]);

  const respondToRequest = async (id: string, status: string) => {
    await api.patch(`/centers/${selectedCenter}/doctors/requests/${id}/respond`, { status });
    fetchData();
  };

  const handleSearchDoctor = async () => {
    const res = await api.get(`/search/doctors?q=${search}`);
    setSearchResult(res.data.data.doctors || []);
  };

  const sendRequest = async (doctorId: string) => {
    await api.post(`/centers/${selectedCenter}/doctors/request`, { doctorId, offerDetails: offer });
    setSendingTo(''); setOffer(''); setShowSearch(false);
    fetchData();
  };

  return (
    <DashboardShell title="Center Doctors" subtitle="Manage doctors registered at your center and connection requests">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowSearch(v => !v)}><Search size={14} /> Find & Invite Doctor</button>
      </div>

      {showSearch && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
          <div className="card-body">
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--primary-800)' }}>Invite a Doctor</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors by name or specialization…" style={{ flex: 1, background: '#fff' }} />
              <button className="btn btn-primary btn-sm" onClick={handleSearchDoctor}><Search size={14} /> Search</button>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              {searchResult.map(d => (
                <div key={d.doctor_id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--primary-600)' }}>{d.specialization}</div>
                    
                    {sendingTo === d.doctor_id && (
                      <div style={{ marginTop: 12 }}>
                        <textarea className="form-input" value={offer} onChange={e => setOffer(e.target.value)} placeholder="Optional offer details or message..." rows={2} style={{ marginBottom: 8, width: 300 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => sendRequest(d.doctor_id)}>Send Request</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSendingTo('')}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  {sendingTo !== d.doctor_id && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setSendingTo(d.doctor_id)}>Invite</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        
        {/* Pending Requests */}
        {requests.length > 0 && (
          <div className="card" style={{ border: '1px solid var(--warning)' }}>
            <div className="card-header" style={{ background: '#fff8e1' }}>
              <div style={{ fontWeight: 600, color: '#f57f17' }}>Pending Requests ({requests.length})</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Doctor</th><th>Initiated By</th><th>Message / Offer</th><th>Actions</th></tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.doctors?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.doctors?.specialization}</div>
                      </td>
                      <td><span className={`badge ${r.initiated_by_role === 'center' ? 'badge-info' : 'badge-primary'}`}>{r.initiated_by_role === 'center' ? 'You (Center)' : 'Doctor'}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.offer_details || '—'}</td>
                      <td>
                        {r.request_status === 'pending' && r.initiated_by_role === 'doctor' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => respondToRequest(r.id, 'accepted')}><CheckCircle2 size={13} /> Accept</button>
                            <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => respondToRequest(r.id, 'rejected')}><XCircle size={13} /> Reject</button>
                          </div>
                        ) : (
                          <span className="badge badge-warning">Waiting for doctor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Registered Doctors */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 600 }}>Registered Doctors</div></div>
          <div className="table-wrapper">
            {loading && selectedCenter ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
              <table>
                <thead><tr><th>Doctor Name</th><th>Specialization</th><th>Status</th></tr></thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                          <div style={{ fontWeight: 600 }}>{d.doctors?.name}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.doctors?.specialization}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))}
                  {doctors.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No doctors currently registered to this center.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
