import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/requests/stats');
      setStats(res.data);
    } catch (e) {
      toast.error('Failed to load stats');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data);
    } catch (e) {
      toast.error('Failed to load bookings');
    }
  };

  const updateBookStatus = async (title, status) => {
    try {
      await api.put('/admin/requests/status', { book_title: title, status });
      toast.success(`Status updated for ${title}`);
      fetchStats();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '32px', fontSize: '2rem' }}>Admin Dashboard</h2>

      <div className="grid-2">
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📘 High-Demand Book Requests</h3>
          <p style={{ marginBottom: '24px' }}>Books requested by students, aggregated by count.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '20px', 
                borderRadius: '12px', 
                borderLeft: stat.demand_count >= 5 ? '4px solid var(--danger)' : '4px solid var(--primary)',
                borderTop: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{stat.book_title}</strong> {stat.author && <span style={{ color: 'var(--text-muted)' }}>({stat.author})</span>}
                    <br/><small style={{ display: 'inline-block', marginTop: '8px', color: 'var(--text-main)' }}>Demand: <strong>{stat.demand_count} requests</strong></small>
                    {stat.demand_count >= 5 && <span className="badge danger" style={{ marginLeft: '12px' }}>🔥 High Demand</span>}
                  </div>
                  <div>
                    <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => updateBookStatus(stat.book_title, 'ordered')}>Mark Ordered</button>
                  </div>
                </div>
              </div>
            ))}
            {stats.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px' }}>No book requests found.</p>}
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📅 System Booking Logs</h3>
          <p style={{ marginBottom: '24px' }}>Recent seat and room bookings across the library.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
            {bookings.map(b => (
              <div key={b.id} style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{b.resource_name} ({b.type})</strong>
                  <span className={`badge ${b.status === 'active' ? 'success' : ''}`} style={{ 
                    color: b.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                    background: b.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                    border: 'none'
                  }}>{b.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-main)' }}>{b.user_name}</span> ({b.email}) <br/>
                  <div style={{ marginTop: '4px' }}>{b.booking_date} | {b.time_slot}</div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px' }}>No bookings found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
