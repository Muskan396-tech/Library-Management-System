const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

// Get all available seats
router.get('/seats', verifyToken, (req, res) => {
    // Assuming simple date check for today's bookings
    const date = new Date().toISOString().split('T')[0];
    db.all(`
        SELECT s.*, 
        CASE WHEN b.id IS NULL THEN 1 ELSE 0 END as is_available
        FROM seats s
        LEFT JOIN bookings b ON s.id = b.resource_id AND b.type = 'seat' AND b.booking_date = ? AND b.status = 'active'
    `, [date], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Get all discussion rooms
router.get('/rooms', verifyToken, (req, res) => {
    const date = new Date().toISOString().split('T')[0];
    db.all(`
        SELECT r.*, 
        CASE WHEN b.id IS NULL THEN 1 ELSE 0 END as is_available
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.resource_id AND b.type = 'room' AND b.booking_date = ? AND b.status = 'active'
    `, [date], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Create a booking
router.post('/', verifyToken, (req, res) => {
    const { type, resource_id, date, time_slot } = req.body;
    const user_id = req.user.id;

    if (!type || !resource_id || !date || !time_slot) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Check for double booking
    db.get(`SELECT id FROM bookings WHERE type = ? AND resource_id = ? AND booking_date = ? AND time_slot = ? AND status = 'active'`,
        [type, resource_id, date, time_slot], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (row) return res.status(400).json({ error: 'Resource already booked for this slot' });

            db.run(`INSERT INTO bookings (user_id, type, resource_id, booking_date, time_slot) VALUES (?, ?, ?, ?, ?)`,
                [user_id, type, resource_id, date, time_slot], function(err) {
                    if (err) return res.status(500).json({ error: 'Failed to create booking' });
                    res.status(201).json({ message: 'Booking successful', bookingId: this.lastID });
                });
        });
});

// View my bookings
router.get('/my-bookings', verifyToken, (req, res) => {
    db.all(`
        SELECT b.*, 
        CASE WHEN b.type = 'seat' THEN s.seat_number ELSE r.room_number END as resource_name
        FROM bookings b
        LEFT JOIN seats s ON b.resource_id = s.id AND b.type = 'seat'
        LEFT JOIN rooms r ON b.resource_id = r.id AND b.type = 'room'
        WHERE b.user_id = ? AND b.status = 'active'
        ORDER BY b.booking_date DESC
    `, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Cancel a booking
router.delete('/:id', verifyToken, (req, res) => {
    db.run(`UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to cancel booking' });
        if (this.changes === 0) return res.status(404).json({ error: 'Booking not found or already cancelled' });
        res.json({ message: 'Booking cancelled successfully' });
    });
});

module.exports = router;
