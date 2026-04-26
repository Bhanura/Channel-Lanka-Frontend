'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import api from '@/lib/api';
import { Star, MapPin, Calendar, Clock, Stethoscope, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PublicDoctorProfile() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/doctors/${id}/public`).then(r => r.data.data),
      api.get(`/sessions/available?doctorId=${id}`).then(r => r.data.data)
    ]).then(([docData, sessData]) => {
      setDoctor(docData);
      setSessions(sessData || []);
    }).catch(err => {
      console.error(err);
      if (err.response?.status === 404) router.push('/search');
    }).finally(() => setLoading(false));
  }, [id, router]);

  const StarRating = ({ rating }: { rating: string | null }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Star size={16} fill={rating ? '#ffab00' : 'none'} color={rating ? '#ffab00' : '#ccc'} />
      <span style={{ fontSize: 14, fontWeight: 600, color: rating ? '#e65100' : 'var(--text-muted)' }}>
        {rating || 'No ratings'}
      </span>
    </div>
  );

  if (loading) return <div><PublicNavbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading profile...</div></div>;
  if (!doctor) return null;

  return (
    <div style={{ background: 'var(--bg-light)', minHeight: '100vh', paddingBottom: 60 }}>
      <PublicNavbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Profile Header */}
        <div className="card" style={{ padding: 32, marginBottom: 32, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
            {doctor.avatar_url ? <img src={doctor.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👨‍⚕️'}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0' }}>{doctor.name}</h1>
            <div style={{ fontSize: 16, color: 'var(--primary-600)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={16} /> {doctor.specialization}
            </div>
            <StarRating rating={doctor.avg_rating} />
            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span className="badge badge-success">Medical License: {doctor.license_number}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {/* About Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--primary-600)" /> About
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                {doctor.bio || 'No bio provided.'}
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="var(--primary-600)" /> Qualifications
              </h3>
              {doctor.doctor_qualifications?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {doctor.doctor_qualifications.map((q: any) => (
                    <li key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-500)', marginTop: 8 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{q.qualification}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.institute} • {q.year_obtained}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No qualifications listed.</div>
              )}
            </div>
          </div>

          {/* Sessions & Booking Section */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--primary-600)" /> Available Sessions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session.session_id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--text-main)' }}>
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <Clock size={14} /> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <MapPin size={14} /> {session.rooms?.channeling_centers?.name} — {session.rooms?.channeling_centers?.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                      Rs. {(session.doctor_fee + session.rooms?.charge).toFixed(2)}
                    </div>
                    {session.is_full ? (
                      <span className="badge badge-warning">Fully Booked</span>
                    ) : (
                      <Link href={`/book/${session.session_id}`}>
                        <button className="btn btn-primary btn-sm">Book Now</button>
                      </Link>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-main)', borderRadius: 12, color: 'var(--text-muted)' }}>
                  No upcoming sessions available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
