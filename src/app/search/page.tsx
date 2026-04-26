'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import api from '@/lib/api';
import Link from 'next/link';
import { Star, MapPin, Stethoscope, Building2, Calendar, Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'doctors') as 'doctors' | 'centers';
  const specialization = searchParams.get('specialization') || '';

  const [activeTab, setActiveTab] = useState(type);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState(q);

  const fetchDoctors = (query: string, spec: string) => {
    api.get(`/search/doctors?q=${query}&specialization=${spec}`).then(r => setDoctors(r.data.data.doctors || []));
  };
  const fetchCenters = (query: string) => {
    api.get(`/search/centers?q=${query}`).then(r => setCenters(r.data.data.centers || []));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDoctors(q, specialization), fetchCenters(q)]).finally(() => setLoading(false));
  }, [q, specialization]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQ)}&type=${activeTab}`);
  };

  const StarRating = ({ rating }: { rating: string | null }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Star size={14} fill={rating ? '#ffab00' : 'none'} color={rating ? '#ffab00' : '#ccc'} />
      <span style={{ fontSize: 13, fontWeight: 600, color: rating ? '#e65100' : 'var(--text-muted)' }}>
        {rating || 'No ratings'}
      </span>
    </div>
  );

  return (
    <div>
      <PublicNavbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Find {activeTab === 'doctors' ? 'Doctors' : 'Centers'}</h1>

        {/* Search + Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input className="form-input" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={activeTab === 'doctors' ? 'Name or specialization…' : 'Center name or location…'} style={{ flex: 1, maxWidth: 360 }} />
            <button type="submit" className="btn btn-primary btn-sm"><Search size={14} /> Search</button>
          </form>
          <div style={{ display: 'flex', gap: 4, background: 'var(--primary-50)', padding: 4, borderRadius: 8 }}>
            {(['doctors', 'centers'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '6px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: activeTab === t ? 'var(--primary-600)' : 'transparent', color: activeTab === t ? '#fff' : 'var(--text-secondary)' }}>
                {t === 'doctors' ? '👨‍⚕️ Doctors' : '🏥 Centers'}
              </button>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Searching…</div>}

        {/* Doctors Grid */}
        {!loading && activeTab === 'doctors' && (
          <div className="grid-3">
            {doctors.map(d => (
              <Link key={d.doctor_id} href={`/search/doctor/${d.doctor_id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {d.avatar_url ? <img src={d.avatar_url} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} /> : '👨‍⚕️'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--primary-600)', fontWeight: 600 }}>{d.specialization}</div>
                      <StarRating rating={d.avg_rating} />
                    </div>
                  </div>
                  {d.doctor_qualifications?.[0] && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {d.doctor_qualifications[0].qualification} — {d.doctor_qualifications[0].institute}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className="badge badge-success">Available</span>
                    <span style={{ fontSize: 12, color: 'var(--primary-600)', fontWeight: 600 }}>View & Book →</span>
                  </div>
                </div>
              </Link>
            ))}
            {doctors.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No doctors found. Try a different search.</div>}
          </div>
        )}

        {/* Centers Grid */}
        {!loading && activeTab === 'centers' && (
          <div className="grid-3">
            {centers.map(c => (
              <Link key={c.center_id} href={`/search/center/${c.center_id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                    <MapPin size={13} /> {c.location}
                  </div>
                  <StarRating rating={c.avg_rating} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16 }}>
                    <span style={{ fontSize: 12, color: 'var(--primary-600)', fontWeight: 600 }}>View Sessions →</span>
                  </div>
                </div>
              </Link>
            ))}
            {centers.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No centers found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div style={{padding:40,textAlign:'center'}}>Loading…</div>}><SearchContent /></Suspense>;
}
