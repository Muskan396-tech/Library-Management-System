const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

// Request a new book
router.post('/', verifyToken, (req, res) => {
    const { book_title, author } = req.body;
    if (!book_title) return res.status(400).json({ error: 'Book title is required' });

    // Prevent duplicate requests from the same user for the same book
    db.get(`SELECT id FROM book_requests WHERE user_id = ? AND book_title COLLATE NOCASE = ?`, 
        [req.user.id, book_title], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (row) return res.status(400).json({ error: 'You have already requested this book.' });

            db.run(`INSERT INTO book_requests (user_id, book_title, author) VALUES (?, ?, ?)`,
                [req.user.id, book_title, author || ''], function(err) {
                    if (err) return res.status(500).json({ error: 'Failed to request book' });
                    
                    // Simple demand threshold logic check (e.g. if 5 requests, trigger notification mock)
                    db.get(`SELECT COUNT(*) as count FROM book_requests WHERE book_title COLLATE NOCASE = ?`, [book_title], (err, result) => {
                        if (!err && result.count >= 5) {
                            console.log(`🔔 NOTIFICATION: Demand for "${book_title}" has reached threshold (${result.count} requests).`);
                            // We can update status to 'under review' or just keep it for admin
                        }
                    });

                    res.status(201).json({ message: 'Book requested successfully!' });
                });
    });
});

// Get user's own requests
router.get('/my-requests', verifyToken, (req, res) => {
    db.all(`
        SELECT br.*, 
               (SELECT COUNT(*) FROM book_requests WHERE book_title COLLATE NOCASE = br.book_title COLLATE NOCASE) as total_demand 
        FROM book_requests br 
        WHERE user_id = ? 
        ORDER BY request_date DESC
    `, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
