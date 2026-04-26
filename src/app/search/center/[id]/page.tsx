'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import api from '@/lib/api';
import { Star, MapPin, Calendar, Clock, Phone, Building2, HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default function PublicCenterProfile() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [center, setCenter] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/centers/${id}/public`).then(r => r.data.data),
      api.get(`/sessions/available?centerId=${id}`).then(r => r.data.data)
    ]).then(([cenData, sessData]) => {
      setCenter(cenData);
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

  if (loading) return <div><PublicNavbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading center profile...</div></div>;
  if (!center) return null;

  return (
    <div style={{ background: 'var(--bg-light)', minHeight: '100vh', paddingBottom: 60 }}>
      <PublicNavbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Profile Header */}
        <div className="card" style={{ padding: 32, marginBottom: 32, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 100, height: 100, borderRadius: 16, background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)', flexShrink: 0 }}>
            {center.logo_url ? <img src={center.logo_url} style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} /> : <Building2 size={40} />}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px 0' }}>{center.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="var(--primary-600)" /> {center.location}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={16} color="var(--primary-600)" /> {center.phone}
              </div>
            </div>
            <StarRating rating={center.avg_rating} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {/* About & Facilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>About Center</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                {center.description || 'No description provided.'}
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartPulse size={18} color="var(--primary-600)" /> Facilities
              </h3>
              {center.center_facilities?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {center.center_facilities.map((cf: any, i: number) => (
                    <span key={i} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {cf.facilities?.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No facilities listed.</div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions Section */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--primary-600)" /> Upcoming Sessions Here
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session.session_id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {session.doctors?.avatar_url ? <img src={session.doctors.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👨‍⚕️'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{session.doctors?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--primary-600)', fontWeight: 600 }}>{session.doctors?.specialization}</div>
                    </div>
                  </div>
                  
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text-main)' }}>
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <Clock size={14} /> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
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
