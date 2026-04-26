'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Users, CheckCircle, XCircle, ArrowLeft, Clock, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function SessionQueuePage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const [apptRes, sessRes] = await Promise.all([
        api.get(`/appointments/session/${sessionId}`),
        api.get(`/sessions/${sessionId}/detail`)
      ]);
      setAppointments(apptRes.data.data || []);
      setSession(sessRes.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [sessionId]);

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  // Logic: Next patient is the lowest appointment number among those who have 'confirmed' (arrived)
  const arrivedPatients = appointments
    .filter(a => a.status === 'confirmed')
    .sort((a, b) => a.appointment_number - b.appointment_number);
  
  const currentPatient = arrivedPatients[0];

  const upcomingPatients = appointments
    .filter(a => a.status === 'booked')
    .sort((a, b) => a.appointment_number - b.appointment_number);

  return (
    <DashboardShell title="Live Queue Management" subtitle={session ? `${session.date} | ${session.start_time} - ${session.end_time}` : 'Loading...'}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.back()} className="btn btn-outline" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <ArrowLeft size={16} /> Back to Sessions
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading Queue...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
          <div>
            {/* CURRENT PATIENT SECTION */}
            <div className="card" style={{ padding: 24, marginBottom: 32, border: '2px solid var(--primary-200)', backgroundColor: 'var(--primary-50)' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-700)' }}>
                <Clock size={20} /> Now Calling / In Consultation
              </h3>
              {currentPatient ? (
                <div style={{ padding: 20, backgroundColor: '#fff', borderRadius: 12, marginTop: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Token Number</div>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary-600)', lineHeight: 1 }}>#{currentPatient.appointment_number}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{currentPatient.patients?.name || 'Guest Patient'}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{currentPatient.patients?.phone || 'No phone provided'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button onClick={() => handleUpdateStatus(currentPatient.appointment_id, 'completed')} className="btn btn-primary" style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', flex: 1, height: 48 }}>
                      <CheckCircle size={18} /> Mark as Completed
                    </button>
                    <button onClick={() => handleUpdateStatus(currentPatient.appointment_id, 'no_show')} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', flex: 1 }}>
                      <XCircle size={18} /> No Show
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#fff', borderRadius: 12, marginTop: 16, border: '1px dashed var(--border)' }}>
                  <Users size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <div>No patients in the waiting room.</div>
                  <div style={{ fontSize: 13 }}>Mark a patient as "Arrived" from the list below to call them in.</div>
                </div>
              )}
            </div>

            {/* WAITING ROOM SECTION */}
            <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} /> Waiting Room ({arrivedPatients.length})
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 'auto' }}>Sorted by token number</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {arrivedPatients.slice(currentPatient ? 1 : 0).map(a => (
                <div key={a.appointment_id} className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--success)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--success-700)' }}>
                      {a.appointment_number}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.patients?.name || 'Guest'}</div>
                      <div style={{ fontSize: 12, color: 'var(--success-600)', fontWeight: 600 }}>READY / ARRIVED</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleUpdateStatus(a.appointment_id, 'completed')} className="btn btn-outline btn-sm">Complete</button>
                  </div>
                </div>
              ))}
              {arrivedPatients.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Waiting room is empty.</div>
              )}
            </div>

            {/* UPCOMING / NOT ARRIVED SECTION */}
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Upcoming Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingPatients.map(a => (
                <div key={a.appointment_id} className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      {a.appointment_number}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.patients?.name || 'Guest'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Not yet arrived</div>
                    </div>
                  </div>
                  <button onClick={() => handleUpdateStatus(a.appointment_id, 'confirmed')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--primary-600)' }}>
                    <UserCheck size={14} /> Mark Arrived
                  </button>
                </div>
              ))}
              {upcomingPatients.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No more upcoming appointments.</div>}
            </div>

            {/* COMPLETED / OTHER SECTION */}
            {appointments.some(a => ['completed', 'no_show', 'cancelled'].includes(a.status)) && (
              <div style={{ marginTop: 48 }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: 16 }}>History (Completed / No-Show)</h4>
                <div style={{ opacity: 0.6 }}>
                   {appointments.filter(a => ['completed', 'no_show', 'cancelled'].includes(a.status)).map(a => (
                     <div key={a.appointment_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                        <span>#{a.appointment_number} {a.patients?.name}</span>
                        <span style={{ textTransform: 'capitalize' }}>{a.status}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="card" style={{ padding: 24, position: 'sticky', top: 24 }}>
              <h3 style={{ marginTop: 0 }}>Session Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Bookings</span>
                  <strong style={{ fontSize: 16 }}>{appointments.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>In Waiting Room</span>
                  <strong style={{ fontSize: 16, color: 'var(--success-600)' }}>{arrivedPatients.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Yet to Arrive</span>
                  <strong style={{ fontSize: 16, color: 'var(--primary-600)' }}>{upcomingPatients.length}</strong>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Consultations Done</span>
                  <strong style={{ fontSize: 16 }}>{appointments.filter(a => a.status === 'completed').length}</strong>
                </div>
              </div>
              
              <div style={{ marginTop: 24, padding: 16, backgroundColor: 'var(--bg-light)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Tip:</strong> The system automatically prioritizes the lowest token number among those who have arrived. If a late patient (#1) arrives while you are seeing #3, just mark them as "Arrived" and they will automatically be called next after the current session.
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
