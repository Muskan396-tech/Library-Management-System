const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, 'secret_key_seat_n_read', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized!' });
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Require Admin Role!' });
    }
};

module.exports = { verifyToken, verifyAdmin };
