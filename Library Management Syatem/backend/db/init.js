const db = require('./database');
const bcrypt = require('bcryptjs');

const initDB = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table: roles can be 'student' or 'admin'
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'student',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Seats table
            db.run(`
                CREATE TABLE IF NOT EXISTS seats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    seat_number TEXT UNIQUE NOT NULL,
                    is_available BOOLEAN DEFAULT 1
                )
            `);

            // Rooms table
            db.run(`
                CREATE TABLE IF NOT EXISTS rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_number TEXT UNIQUE NOT NULL,
                    capacity INTEGER DEFAULT 4,
                    is_available BOOLEAN DEFAULT 1
                )
            `);

            // Bookings table: polymorphic type = 'seat' or 'room'
            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    type TEXT CHECK(type IN ('seat', 'room')) NOT NULL,
                    resource_id INTEGER NOT NULL,
                    booking_date DATE NOT NULL,
                    time_slot TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            `);

            // Book requests table
            db.run(`
                CREATE TABLE IF NOT EXISTS book_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    book_title TEXT NOT NULL,
                    author TEXT,
                    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending',
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            `, (err) => {
                if (err) return reject(err);
                
                // Seed admin user and initial data
                seedData();
                resolve();
            });
        });
    });
};

const seedData = async () => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
            if (!err && row.count === 0) {
                db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    ['Admin', 'admin@silicon.ac.in', hashedPassword, 'admin']);
                console.log('Seeded default admin user: admin@silicon.ac.in / admin123');
            }
        });

        db.get("SELECT COUNT(*) as count FROM seats", (err, row) => {
            if (!err && row.count === 0) {
                const stmt = db.prepare("INSERT INTO seats (seat_number) VALUES (?)");
                for (let i = 1; i <= 20; i++) {
                    stmt.run(`S-${i.toString().padStart(2, '0')}`);
                }
                stmt.finalize();
                console.log('Seeded 20 library seats.');
            }
        });

        db.get("SELECT COUNT(*) as count FROM rooms", (err, row) => {
            if (!err && row.count === 0) {
                const stmt = db.prepare("INSERT INTO rooms (room_number, capacity) VALUES (?, ?)");
                for (let i = 1; i <= 5; i++) {
                    stmt.run(`R-${i.toString().padStart(2, '0')}`, i % 2 === 0 ? 6 : 4);
                }
                stmt.finalize();
                console.log('Seeded 5 discussion rooms.');
            }
        });
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

initDB().then(() => {
    console.log("Database initialization completed.");
}).catch(console.error);
