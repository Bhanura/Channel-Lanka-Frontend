'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Plus, Building2, Save, Trash2, AlertCircle } from 'lucide-react';

export default function CenterRoomsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', charge: 0 });

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    setLoading(true);
    api.get(`/centers/${selectedCenter}/rooms`)
      .then(r => setRooms(r.data.data || []))
      .finally(() => setLoading(false));
  }, [selectedCenter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/centers/${selectedCenter}/rooms`, form);
    setShowForm(false);
    setForm({ name: '', charge: 0 });
    api.get(`/centers/${selectedCenter}/rooms`).then(r => setRooms(r.data.data || []));
  };

  return (
    <DashboardShell title="Manage Rooms" subtitle="Add and manage physical consulting rooms in your center">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Room</button>
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade-in">
          <div className="card-body">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>New Room</div>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Room Name / Number *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Room 101" required />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Base Charge (LKR) *</label>
                <input type="number" className="form-input" value={form.charge} onChange={e => setForm(f => ({ ...f, charge: parseFloat(e.target.value) }))} placeholder="500" required />
              </div>
              <button type="submit" className="btn btn-primary">Save Room</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {loading && selectedCenter ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading rooms…</div> : (
            <table>
              <thead><tr><th>Room Name / Number</th><th>Base Charge</th><th>Actions</th></tr></thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.room_id}>
                    <td><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16} color="var(--primary-500)" /> {r.name}</div></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>LKR {r.charge?.toFixed(2)}</td>
                    <td><button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} disabled><Trash2 size={14} /></button></td>
                  </tr>
                ))}
                {rooms.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No rooms configured. Add your first room!</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
