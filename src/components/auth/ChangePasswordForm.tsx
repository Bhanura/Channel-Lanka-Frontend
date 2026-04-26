'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyRound size={18} /> Change Password
        </div>
      </div>
      <div className="card-body">
        {msg.text && (
          <div style={{ background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} 
            {msg.text}
          </div>
        )}
        <form onSubmit={handleChangePassword}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Re-type new password"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
