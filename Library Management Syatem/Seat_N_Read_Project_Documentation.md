# Seat-N-Read: Project Documentation Report

**Student Name:** BISWA PRACHURJYA  
**Branch & Section:** CST(A-1)  
**Roll No:** 11  
**SIC:** 23BCTC51  
**Institution:** Silicon University

---

## 1. Project Overview & Objectives

**Seat-N-Read** is a comprehensive full-stack digital platform engineered to resolve inefficiencies in library resource utilization. Traditionally, securing a library seat or discussion room required premature physical presence leading to overcrowding. Furthermore, book requests were informal. Seat-N-Read bridges this gap by offering a fully digitized solution where:
- Students reserve library seats and discussion rooms in advance.
- Students digitally submit missing book requests that the system tracks.
- High-demand book requests are flagged dynamically for the administration.
- Staff utilize an Admin panel to configure seating parameters and observe live booking statistics.

---

## 2. Database Architecture (SQLite)

The backend utilizes structured, normalized entities connected through Primary and Foreign key references:

1. **`users` Table:** Stores all active credentials. Distinguishes users by the `role` column (`student` or `admin`).
2. **`seats` & `rooms` Tables:** Simple entity tables. Holds properties like `seat_number`, `room_number`, and `capacity`.
3. **`bookings` Table:** The most crucial relational table using a Polymorphic Association (`type` = 'seat' or 'room') to avoid redundant overlapping tables.
4. **`book_requests` Table:** Tracking system storing `book_title` as well as a status tag acting as the pipeline for library procurement. 

---

## 3. Backend Code & API Explanation (`Node.js/Express`)

The server is built using Node.js and uses the Express.js framework to build RESTful API endpoints. Each file handles a specific module of the project.

### 3.1. Authentication Middleware (`middleware/auth.js`)
This code ensures that restricted actions (like booking a seat or viewing admin analytics) stay protected.
```javascript
const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    
    // Automatically decrypt tokens signed by our secret key.
    jwt.verify(token.replace('Bearer ', ''), 'secret_key_seat_n_read', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized!' });
        req.user = decoded; // Store globally!
        next(); // Proceed to route logic
    });
};
```
**Explanation:** When an API request hits the server, `verifyToken` searches for the `Authorization` header containing the JWT token. It attempts to read it using the server's private secret key. If valid, it extracts the hidden user details `decoded` and assigns it to `req.user`, allowing further operations to know exactly *who* triggered the request.

### 3.2. Booking Validation Logic (`routes/bookings.js`)
Booking logic uses strict constraint checking to prevent two students from booking the identical resource.
```javascript
router.post('/', verifyToken, (req, res) => {
    const { type, resource_id, date, time_slot } = req.body;
    
    // 1. Double Booking Check
    db.get(`SELECT id FROM bookings WHERE type = ? AND resource_id = ? AND booking_date = ? AND time_slot = ? AND status = 'active'`,
        [type, resource_id, date, time_slot], (err, row) => {
            if (row) return res.status(400).json({ error: 'Resource already booked' });

            // 2. Insert Execution
            db.run(`INSERT INTO bookings (user_id, type, resource_id, booking_date, time_slot) VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, type, resource_id, date, time_slot], function(err) {
                    res.status(201).json({ message: 'Booking successful' });
                });
        });
});
```
**Explanation:** 
1. The server extracts the date, time slot, and target seat from the incoming React payload.
2. It queries `SELECT id FROM bookings` searching for any active bookings overlapping those exact variables.
3. If `row` exists, that means it is heavily populated, and immediately throws a 400 Error ("Already booked").
4. If empty, the backend executes the `INSERT` command natively capturing the user who sent it dynamically using `req.user.id` given by the `verifyToken` middleware.

### 3.3. Demand Threshold Logic (`routes/requests.js`)
The system analyzes if book requests meet library procurement minimum thresholds.
```javascript
db.run(`INSERT INTO book_requests...`, function(err) {
    // Check total threshold asynchronously right after inserting
    db.get(`SELECT COUNT(*) as count FROM book_requests WHERE book_title = ?`, [book_title], (err, result) => {
        if (result.count >= 5) {
            console.log(`🔔 NOTIFICATION: Demand for "${book_title}" has reached threshold.`);
            // Flag is hit! Real-World implementation could email library staff directly here.
        }
    });
});
```
**Explanation:** Once a book record is successfully stored, a localized SQL statement groups up all `book_requests` that match the name. Using `COUNT(*)`, it generates a number. If it exceeds 5 requests, a notification block is executed autonomously.

---

## 4. Frontend Code & Component Overview (`React.js`)

The frontend relies heavily on functional hooks such as `useState` and `useEffect` alongside the global states.

### 4.1. Global App Routing (`App.js`)
We restrict users from wandering into areas they shouldn't access using Context and React Router Guards.
```javascript
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useContext(AuthContext); // Global verification
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  
  return children; // Pass-through
};

// Routing definition
<Route path="/book-seat" element={<ProtectedRoute><BookSeat /></ProtectedRoute>} />
```
**Explanation:** React intercepts routing events. If a student tries to navigate to `/admin`, the `<ProtectedRoute requireAdmin={true}>` component scans the logged-in user variable located inside the context memory. Since `user.role` would equal "student", it returns `<Navigate to="/" />` sending them forcefully back to the home page seamlessly.

### 4.2. Book Seat Component (`pages/BookSeat.js`)
Handles rendering the interactive UI mapping the library layout.
```javascript
useEffect(() => {
    fetchResources(); // Grabs seat data the moment the page loads
}, []);

const fetchResources = async () => {
    const res = await api.get('/bookings/seats');
    setSeats(res.data); // Dump SQL json into local memory.
};

// JSX Rendering
{seats.map(seat => (
    <div 
      key={seat.id} 
      style={{ background: !seat.is_available ? 'red' : 'green' }}
      onClick={() => seat.is_available && setSelectedResource(seat.id)}
    >
      {seat.seat_number}
    </div>
))}
```
**Explanation:** 
1. `useEffect` is triggered automatically upon navigating to the page. It commands `fetchResources()` to ping the backend API `/bookings/seats`.
2. The server responds with an array mapping what is available today vs what isn't. The array is fed to `setSeats(res.data)` state.
3. The component re-renders instantly iterating over the `.map()` function. Every seat is rendered as an HTML DIV. 
4. The CSS styling checks `seat.is_available` dynamically. If available, it renders Green, otherwise Red.

### 4.3. Axios Networking Layer (`services/api.js`)
It centralizes our communication bridge with the backend, managing the JWT. 
```javascript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```
**Explanation:** By utilizing Axios interceptors, we fundamentally write a "proxy". Therefore inside our components, developers only have to type `api.post('/bookings')`, completely unaware of authentication headers. The interceptor quietly captures the outgoing request, snatches the JSON Web Token out of Local Storage safely, and stitches it into the `headers.Authorization` pipeline before sending it over the network. 

---

## 5. Conclusion & Evaluation Outcome

The completed iteration of the Seat-N-Read architecture perfectly aligns with the initial project goals. Through utilizing modern JWT security, Relational Databasing, and a Single Page Application (SPA) workflow via React DOM components, the resulting system effectively eliminates library queues, streamlines resource control, and leverages real-time internal triggers for threshold analytics.
