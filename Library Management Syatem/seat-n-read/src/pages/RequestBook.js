import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { BookPlus } from 'lucide-react';

function RequestBook() {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests/my-requests');
      setMyRequests(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', { book_title: bookTitle, author });
      toast.success('Book request submitted successfully!');
      setBookTitle('');
      setAuthor('');
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to request book');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '32px', fontSize: '2rem' }}>Request a Missing Book</h2>

      <div className="grid-2">
        <div className="glass-panel">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '16px' }}>
              <BookPlus size={48} color="var(--primary)" />
            </div>
            <p style={{ marginTop: '8px', fontSize: '1.1rem' }}>Fill in details describing the book you need.</p>
          </div>

          <form onSubmit={handleRequest}>
            <div style={{ marginBottom: '16px' }}>
              <label>Book Title *</label>
              <input 
                type="text" 
                value={bookTitle} 
                onChange={e => setBookTitle(e.target.value)} 
                placeholder="e.g. Clean Code" 
                required 
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label>Author (Optional)</label>
              <input 
                type="text" 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                placeholder="e.g. Robert C. Martin" 
              />
            </div>
            <button type="submit" className="primary">Submit Request</button>
          </form>
        </div>

        <div className="glass-panel">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Request History</h3>
          <p style={{ marginBottom: '24px' }}>Track the status of the books you have requested.</p>
          
          {myRequests.length === 0 ? <p style={{ textAlign: 'center', marginTop: '40px' }}>You haven't requested any books yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myRequests.map(req => (
                <div key={req.id} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <strong style={{ fontSize: '1.1rem' }}>{req.book_title}</strong> {req.author && <span style={{ color: 'var(--text-muted)' }}>by {req.author}</span>}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge ${req.status === 'pending' ? 'pending' : 'success'}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Demand Meter */}
                  <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '500' }}>
                      <span>Purchase Threshold</span>
                      <span>{Math.min(req.total_demand || 1, 5)} / 5</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(Math.min(req.total_demand || 1, 5) / 5) * 100}%`, 
                        height: '100%', 
                        background: (req.total_demand || 1) >= 5 ? 'var(--success)' : 'var(--primary)',
                        boxShadow: (req.total_demand || 1) >= 5 ? '0 0 10px var(--success-glow)' : '0 0 10px var(--primary-glow)',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {(5 - (req.total_demand || 1)) > 0 
                        ? `${5 - (req.total_demand || 1)} more request(s) needed for library purchase.` 
                        : '🔥 Threshold reached! Pending admin procurement.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestBook;