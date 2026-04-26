'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingPageProps { params: { sessionId: string }; }

export default function BookingPage({ params }: BookingPageProps) {
  const { sessionId } = params;
  const { user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'payment' | 'confirm'>('details');
  const [appointmentResult, setAppointmentResult] = useState<any>(null);
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '', gender: 'male', dob: '' });
  const [cardForm, setCardForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/sessions/${sessionId}/detail`),
      api.get(`/payments/breakdown/${sessionId}`),
    ]).then(([s, b]) => {
      setSession(s.data.data);
      setBreakdown(b.data.data);
    }).finally(() => setLoading(false));
  }, [sessionId]);

  const handleBook = async () => {
    setProcessing(true); setError('');
    try {
      const payload = {
        sessionId,
        patientDetails: user ? undefined : guestForm,
      };
      const apptRes = await api.post('/appointments/book', payload);
      const appt = apptRes.data.data;

      // Process payment
      const payRes = await api.post('/payments/process', {
        appointmentId: appt.appointment.appointment_id,
        paymentMethod: 'card',
        cardDetails: cardForm,
      });

      setAppointmentResult({ ...appt, payment: payRes.data.data });
      setStep('confirm');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Booking failed. Please try again.');
    } finally { setProcessing(false); }
  };

  if (loading) return (
    <div><PublicNavbar /><div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading session details…</div></div>
  );

  if (!session) return (
    <div><PublicNavbar /><div style={{ textAlign: 'center', padding: 80, color: 'var(--danger)' }}>Session not found.</div></div>
  );

  const isFull = (session.appointments?.length || 0) >= session.patient_limit;

  return (
    <div>
      <PublicNavbar />
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Book Appointment</h1>

        {step === 'confirm' && appointmentResult ? (
          <div className="card animate-fade-in">
            <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
              <CheckCircle size={56} color="var(--success)" style={{ marginBottom: 16 }} />
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Booking Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Your appointment #{appointmentResult.appointmentNumber} has been booked.
              </p>
              <div style={{ background: 'var(--primary-50)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--primary-700)' }}>Booking Summary</div>
                <div style={{ fontSize: 14, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Doctor</span><span style={{ fontWeight: 600 }}>{session.doctors?.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Center</span><span style={{ fontWeight: 600 }}>{session.rooms?.channeling_centers?.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Date</span><span style={{ fontWeight: 600 }}>{session.date}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Time</span><span style={{ fontWeight: 600 }}>{session.start_time}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Token #</span><span style={{ fontWeight: 600, color: 'var(--primary-600)', fontSize: 18 }}>#{appointmentResult.appointmentNumber}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span><span style={{ fontWeight: 700, color: 'var(--success)' }}>LKR {appointmentResult.payment?.breakdown?.total?.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Ref</span><span style={{ fontSize: 12, fontFamily: 'monospace' }}>{appointmentResult.payment?.transactionRef}</span></div>
                </div>
              </div>
              {appointmentResult.tempPassword && (
                <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#2e7d32', marginBottom: 6 }}>🎉 Account Created for You!</div>
                  <div style={{ fontSize: 13, color: '#1b5e20' }}>An account was created with your email. Temporary password: <strong style={{ fontFamily: 'monospace', background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{appointmentResult.tempPassword}</strong></div>
                  <div style={{ fontSize: 12, color: '#388e3c', marginTop: 6 }}>Log in to manage your appointments and change your password.</div>
                </div>
              )}
              <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
            {/* Left: Form */}
            <div>
              {/* Session Info Card */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{session.doctors?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{session.doctors?.specialization}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />{session.date}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <Clock size={14} />{session.start_time} – {session.end_time}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <Users size={14} />{session.appointments?.length || 0} / {session.patient_limit} booked
                    </div>
                  </div>
                  {isFull && <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 12, display: 'flex', gap: 8 }}><AlertCircle size={14} />This session is fully booked.</div>}
                </div>
              </div>

              {error && <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

              {/* Guest Form (only if not logged in) */}
              {!user && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header"><div style={{ fontWeight: 600 }}>Patient Details</div></div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={guestForm.name} onChange={e => setGuestForm(f => ({ ...f, name: e.target.value }))} required /></div>
                      <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={guestForm.email} onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))} required /></div>
                      <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={guestForm.phone} onChange={e => setGuestForm(f => ({ ...f, phone: e.target.value }))} required /></div>
                      <div className="form-group"><label className="form-label">Gender</label><select className="form-input form-select" value={guestForm.gender} onChange={e => setGuestForm(f => ({ ...f, gender: e.target.value }))}><option value="male">Male</option><option value="female">Female</option></select></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="card">
                <div className="card-header">
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={18} /> Payment Details
                    <span style={{ fontSize: 11, background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>DEMO GATEWAY</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="form-group"><label className="form-label">Card Number</label><input className="form-input" value={cardForm.cardNumber} onChange={e => setCardForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Expiry</label><input className="form-input" value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: e.target.value }))} placeholder="MM/YY" /></div>
                    <div className="form-group"><label className="form-label">CVV</label><input className="form-input" value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value }))} placeholder="123" maxLength={4} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Cardholder Name</label><input className="form-input" value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="As on card" /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                    💡 This is a demonstration payment gateway. Any values accepted. No real money charged.
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 20, fontSize: 16 }}
                onClick={handleBook} disabled={processing || isFull}>
                {processing ? 'Processing…' : `Confirm & Pay LKR ${breakdown?.total?.toFixed(2) || '—'}`}
              </button>
            </div>

            {/* Right: Fee Breakdown */}
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="card-header"><div style={{ fontWeight: 600 }}>Fee Breakdown</div></div>
              <div className="card-body">
                {breakdown ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { label: 'Doctor Fee', amount: breakdown.doctor_fee },
                      { label: 'Center Fee', amount: breakdown.center_fee },
                      { label: 'Platform Fee', amount: breakdown.platform_fee },
                      { label: 'Tax', amount: breakdown.tax },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span style={{ fontWeight: 600 }}>LKR {row.amount?.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: 'var(--primary-600)' }}>
                      <span>Total</span><span>LKR {breakdown.total?.toFixed(2)}</span>
                    </div>
                  </div>
                ) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
