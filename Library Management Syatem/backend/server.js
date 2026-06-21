const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const requestsRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);

// General Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
