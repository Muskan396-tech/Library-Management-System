import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function BookSeat() {
  const [seats, setSeats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:00');
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    fetchResources();
    fetchMyBookings();
  }, []);

  const fetchResources = async () => {
    try {
      const [seatsRes, roomsRes] = await Promise.all([
        api.get('/bookings/seats'),
        api.get('/bookings/rooms')
      ]);
      setSeats(seatsRes.data);
      setRooms(roomsRes.data);
    } catch (e) {
      toast.error('Failed to load resources');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setMyBookings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBooking = async () => {
    if (!selectedResource) return toast.error('Please select a seat or room');
    
    try {
      await api.post('/bookings', {
        type: selectedResource.type,
        resource_id: selectedResource.id,
        date: new Date().toISOString().split('T')[0],
        time_slot: timeSlot
      });
      toast.success('Successfully booked!');
      setSelectedResource(null);
      fetchResources();
      fetchMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchResources();
      fetchMyBookings();
    } catch (error) {
      toast.error('Could not cancel booking');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '32px', fontSize: '2rem' }}>Reserve Your Space</h2>
      
      <div className="grid-2">
        {/* Booking Selection */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>1. Choose Time Slot (Today)</h3>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            <option>09:00 - 11:00</option>
            <option>11:00 - 13:00</option>
            <option>14:00 - 16:00</option>
            <option>16:00 - 18:00</option>
          </select>

          <h3 style={{ marginTop: '32px', fontSize: '1.25rem', color: 'var(--primary)' }}>2. Available Library Seats</h3>
          <div style={styles.gridContainer}>
            {seats.map(seat => (
              <div 
                key={`seat-${seat.id}`} 
                style={{
                  ...styles.box, 
                  background: !seat.is_available ? 'rgba(239, 68, 68, 0.1)' :
                              (selectedResource?.id === seat.id && selectedResource?.type === 'seat' ? 'var(--primary)' : 'rgba(255,255,255,0.05)'),
                  borderColor: !seat.is_available ? 'var(--danger)' :
                              (selectedResource?.id === seat.id && selectedResource?.type === 'seat' ? 'var(--primary)' : 'var(--border)'),
                  color: !seat.is_available ? 'var(--danger)' : 'var(--text-main)',
                  cursor: seat.is_available ? 'pointer' : 'not-allowed',
                  boxShadow: selectedResource?.id === seat.id && selectedResource?.type === 'seat' ? '0 0 15px var(--primary-glow)' : 'none'
                }}
                onClick={() => seat.is_available && setSelectedResource({ type: 'seat', id: seat.id, name: seat.seat_number })}
              >
                {seat.seat_number}
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '32px', fontSize: '1.25rem', color: 'var(--primary)' }}>3. Available Discussion Rooms</h3>
          <div style={styles.gridContainer}>
            {rooms.map(room => (
              <div 
                key={`room-${room.id}`} 
                style={{
                  ...styles.box, 
                  width: '90px',
                  background: !room.is_available ? 'rgba(239, 68, 68, 0.1)' :
                              (selectedResource?.id === room.id && selectedResource?.type === 'room' ? 'var(--warning)' : 'rgba(255,255,255,0.05)'),
                  borderColor: !room.is_available ? 'var(--danger)' :
                              (selectedResource?.id === room.id && selectedResource?.type === 'room' ? 'var(--warning)' : 'var(--border)'),
                  color: !room.is_available ? 'var(--danger)' : 'var(--text-main)',
                  cursor: room.is_available ? 'pointer' : 'not-allowed',
                  boxShadow: selectedResource?.id === room.id && selectedResource?.type === 'room' ? '0 0 15px var(--warning-glow)' : 'none'
                }}
                onClick={() => room.is_available && setSelectedResource({ type: 'room', id: room.id, name: room.room_number })}
              >
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>{room.room_number}</span> 
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cap: {room.capacity}</span>
              </div>
            ))}
          </div>

          <button 
            className="primary" 
            style={{ marginTop: '40px' }}
            onClick={handleBooking}
            disabled={!selectedResource}
          >
            Confirm Booking {selectedResource ? `(${selectedResource.name})` : ''}
          </button>
        </div>

        {/* My Bookings */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>My Active Bookings</h3>
          {myBookings.length === 0 ? <p style={{ textAlign: 'center', marginTop: '40px' }}>You have no active bookings.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myBookings.map(b => (
                <div key={b.id} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  borderLeft: '4px solid var(--primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease',
                  border: '1px solid var(--border)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div>
                    <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>{b.resource_name}</strong> 
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', marginRight: '8px' }}>{b.type}</span>
                    <br/>
                    <small style={{ color: 'var(--text-muted)', display: 'inline-block', marginTop: '8px' }}>{b.booking_date} | {b.time_slot}</small>
                  </div>
                  <button className="danger" style={{ padding: '8px 16px', width: 'auto', fontSize: '0.85rem' }} onClick={() => handleCancelBooking(b.id)}>
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  gridContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px'
  },
  box: {
    width: '64px',
    height: '64px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: 'Outfit, sans-serif'
  }
};

export default BookSeat;