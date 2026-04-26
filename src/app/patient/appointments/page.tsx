'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import Link from 'next/link';
import { Calendar, Clock, MapPin, XCircle, Star } from 'lucide-react';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [ratingAppt, setRatingAppt] = useState<any>(null);
  const [docRating, setDocRating] = useState(5);
  const [docReview, setDocReview] = useState("");
  const [centerRating, setCenterRating] = useState(5);
  const [centerReview, setCenterReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    api.get('/patients/appointments').then(r => setAppointments(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/cancel`);
    setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status: 'cancelled' } : a));
  };

  const submitRating = async () => {
    setIsSubmittingRating(true);
    try {
      if (ratingAppt) {
        await Promise.all([
          api.post('/patients/rate/doctor', {
            doctorId: ratingAppt.channel_sessions?.doctors?.doctor_id,
            rateValue: docRating,
            review: docReview
          }),
          api.post('/patients/rate/center', {
            centerId: ratingAppt.channel_sessions?.rooms?.channeling_centers?.center_id,
            rateValue: centerRating,
            review: centerReview
          })
        ]);
        alert('Thank you for your rating!');
        setRatingAppt(null);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const statusBadge: Record<string, string> = { booked: 'badge-warning', confirmed: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger', no_show: 'badge-danger' };
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <DashboardShell title="My Appointments" subtitle="View and manage your bookings">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'booked', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: filter === s ? 'var(--primary-600)' : 'var(--primary-50)', color: filter === s ? '#fff' : 'var(--text-secondary)' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(a => (
            <div key={a.appointment_id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.channel_sessions?.doctors?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--primary-600)' }}>{a.channel_sessions?.doctors?.specialization}</div>
                    </div>
                    <span className={`badge ${statusBadge[a.status] || 'badge-muted'}`}>{a.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={13} />{a.channel_sessions?.date}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Clock size={13} />{a.channel_sessions?.start_time}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={13} />{a.channel_sessions?.rooms?.channeling_centers?.name}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 20, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Token: <strong>#{a.appointment_number}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount: <strong style={{ color: a.payments?.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>LKR {a.payments?.total_amount || '—'}</strong></span>
                  </div>
                </div>
                {a.status === 'booked' && (
                  <button className="btn btn-sm" style={{ background: '#ffebee', color: 'var(--danger)' }} onClick={() => cancel(a.appointment_id)}>
                    <XCircle size={14} /> Cancel
                  </button>
                )}
                {a.status === 'completed' && (
                  <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => {
                    setRatingAppt(a);
                    setDocRating(5);
                    setDocReview("");
                    setCenterRating(5);
                    setCenterReview("");
                  }}>
                    <Star size={14} /> Rate Experience
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No appointments found.</div>}
        </div>
      )}

      {ratingAppt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Rate Your Experience</h3>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Dr. {ratingAppt.channel_sessions?.doctors?.name}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={24} fill={star <= docRating ? '#facc15' : 'none'} color={star <= docRating ? '#facc15' : '#ccc'} style={{ cursor: 'pointer' }} onClick={() => setDocRating(star)} />
                ))}
              </div>
              <textarea className="form-input" placeholder="Review for doctor (optional)" rows={2} value={docReview} onChange={e => setDocReview(e.target.value)} />
            </div>

            <div style={{ marginBottom: 24, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>{ratingAppt.channel_sessions?.rooms?.channeling_centers?.name}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={24} fill={star <= centerRating ? '#facc15' : 'none'} color={star <= centerRating ? '#facc15' : '#ccc'} style={{ cursor: 'pointer' }} onClick={() => setCenterRating(star)} />
                ))}
              </div>
              <textarea className="form-input" placeholder="Review for center (optional)" rows={2} value={centerReview} onChange={e => setCenterReview(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setRatingAppt(null)} disabled={isSubmittingRating}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={isSubmittingRating}>
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
