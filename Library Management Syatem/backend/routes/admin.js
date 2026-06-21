const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Apply middleware to all admin routes
router.use(verifyToken, verifyAdmin);

// Add a seat
router.post('/seats', (req, res) => {
    const { seat_number } = req.body;
    db.run(`INSERT INTO seats (seat_number) VALUES (?)`, [seat_number], function(err) {
        if (err) return res.status(400).json({ error: 'Seat may already exist' });
        res.status(201).json({ message: 'Seat added successfully' });
    });
});

// Remove a seat
router.delete('/seats/:id', (req, res) => {
    db.run(`DELETE FROM seats WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Seat removed successfully' });
    });
});

// Get consolidated book request stats
router.get('/requests/stats', (req, res) => {
    db.all(`
        SELECT book_title, MAX(author) as author, COUNT(*) as demand_count, MAX(request_date) as last_requested
        FROM book_requests
        GROUP BY book_title COLLATE NOCASE
        ORDER BY demand_count DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Update book request status (e.g. marked as 'ordered')
router.put('/requests/status', (req, res) => {
    const { book_title, status } = req.body;
    db.run(`UPDATE book_requests SET status = ? WHERE book_title COLLATE NOCASE = ?`, [status, book_title], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Status updated' });
    });
});

// Get all bookings (reporting)
router.get('/bookings', (req, res) => {
    db.all(`
        SELECT b.*, u.name as user_name, u.email,
        CASE WHEN b.type = 'seat' THEN s.seat_number ELSE r.room_number END as resource_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN seats s ON b.resource_id = s.id AND b.type = 'seat'
        LEFT JOIN rooms r ON b.resource_id = r.id AND b.type = 'room'
        ORDER BY b.booking_date DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
