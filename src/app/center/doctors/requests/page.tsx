'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function DoctorRequestsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenterId(data[0].channeling_centers.center_id);
    }).catch(() => {});
  }, []);

  const fetchRequests = () => {
    if (!selectedCenterId) return;
    setLoading(true);
    api.get(`/centers/${selectedCenterId}/doctors/requests`)
      .then(r => setRequests(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [selectedCenterId]);

  const respond = async (requestId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await api.patch(`/centers/${selectedCenterId}/doctors/requests/${requestId}/respond`, { status });
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update request');
    }
  };

  return (
    <DashboardShell title="Doctor Requests" subtitle="Manage requests to and from doctors">
      {centers.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <select 
            className="form-input form-select" 
            style={{ width: 250 }} 
            value={selectedCenterId} 
            onChange={e => setSelectedCenterId(e.target.value)}
          >
            {centers.map(c => (
              <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>
                {c.channeling_centers.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Initiator</th>
                  <th>Offer Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                          {req.doctors?.name?.[0] || 'D'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{req.doctors?.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{req.doctors?.specialization}</td>
                    <td><span className="badge" style={{ background: '#f5f5f5', color: '#616161' }}>{req.initiated_by_role === 'center' ? 'Center' : 'Doctor'}</span></td>
                    <td style={{ fontSize: 13 }}>{req.offer_details || '-'}</td>
                    <td>
                      <span className={`badge ${req.request_status === 'accepted' ? 'badge-success' : req.request_status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {req.request_status}
                      </span>
                    </td>
                    <td>
                      {req.request_status === 'pending' && req.initiated_by_role === 'doctor' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => respond(req.id, 'accepted')}>
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => respond(req.id, 'rejected')}>
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                      {req.request_status === 'pending' && req.initiated_by_role === 'center' && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for doctor...</span>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                      No doctor requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
