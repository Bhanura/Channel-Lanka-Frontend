'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function DoctorCentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/centers')
      .then(r => setCenters(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell title="My Centers" subtitle="Hospitals and clinics you are officially registered with">
      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading centers…</div> : (
        <div className="grid-3">
          {centers.map(item => {
            const c = item.channeling_centers;
            return (
              <div key={item.id} className="card" style={{ padding: 24, transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ● Active Connection
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: 1, display: 'grid', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {c.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> {c.location}</div>}
                  {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> {c.phone}</div>}
                  {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> {c.email}</div>}
                  {c.description && <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>{c.description}</div>}
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', gap: 8 }}>
                  <Link href={`/doctor/messages?center=${c.center_id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Message Center
                  </Link>
                </div>
              </div>
            );
          })}
          {centers.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>
              <Building2 size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>No Centers Registered</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 8, maxWidth: 400, margin: '8px auto 20px' }}>
                You are not registered with any channeling centers yet. Connect with centers to start creating sessions.
              </div>
              <Link href="/doctor/requests" className="btn btn-primary">Find & Request Centers</Link>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
