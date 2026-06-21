# Seat-N-Read: Viva Preparation Guide

This guide breaks down the entire workflow of your project from a technical perspective so you can confidently answer questions during your viva. 

---

## 1. High-Level Architecture (The Stack)
**Question: What technology stack did you use and why?**
*   **Frontend:** React.js. Used for building a dynamic, Single Page Application (SPA) where components update without reloading the page.
*   **Backend:** Node.js with Express.js. Provides a fast, asynchronous REST API.
*   **Database:** SQLite. A lightweight, file-based relational database. It's excellent for this project because it doesn't require a separate server process and supports standard SQL and relational foreign keys.

---

## 2. Flow 1: User Registration & Login (Authentication Flow)

### Step A: Registration
1.  **Frontend:** The user fills out the `Register.js` form. React (`useState`) captures the name, email, and password. Axios sends a `POST` request to `/api/auth/register`.
2.  **Backend:** 
    *   The backend receives the data. 
    *   **Crucial Step:** It uses the `bcryptjs` library to **hash** the password. *Never store plain-text passwords in a database.* Hashing turns the password into an irreversible string.
    *   The data is inserted into the SQLite `users` table. If the email already exists, SQLite throws a `UNIQUE` constraint error, which the backend catches and sends back to the frontend.

### Step B: Login & JWT (JSON Web Tokens)
1.  **Backend:** When the user logs in, the backend searches the database for the email. If found, it uses `bcrypt.compare()` to check if the entered password matches the stored hash.
2.  **Token Generation:** If successful, the backend generates a **JWT (JSON Web Token)**. This token contains a "payload" (the user's ID, name, and role: 'student' or 'admin') and is cryptographically signed using a secret key (`secret_key_seat_n_read`).
3.  **Frontend:** React receives this token and stores it in the browser's `localStorage`. The `AuthContext` updates the global state to indicate the user is logged in.
4.  **Subsequent Requests:** For every action (like booking a seat), Axios intercepts the request and attaches this JWT to the `Authorization` header as a "Bearer" token.

---

## 3. Flow 2: Reserving a Library Seat or Room

1.  **Fetching Availability:** When the user visits `/book-seat`, the frontend makes a `GET` request to `/api/bookings/seats`. 
2.  **Backend Logic (SQL Joins):** The backend executes an SQL query with a `LEFT JOIN` between the `seats` table and the `bookings` table for the *current date*. It uses a `CASE` statement: if a booking exists and is 'active', `is_available` is set to `0` (false), otherwise `1` (true).
3.  **Making the Booking:** The user selects an available seat and clicks confirm.
4.  **Middleware Verification:** The request hits the `verifyToken` middleware (in `auth.js`). This middleware extracts the JWT from the header, verifies the cryptographic signature, and extracts the `user_id`. *If the token is missing or fake, it blocks the request (401 Unauthorized).*
5.  **Database Insert:** The backend checks the database one last time to prevent double-booking (race condition). If safe, it `INSERT`s a new row into the `bookings` table, linking the `user_id` and the `resource_id` (the seat).

---

## 4. Flow 3: Requesting a Book (The Demand System)

1.  **Submission:** The user submits a book title in `/request-book`.
2.  **Duplicate Check:** The backend checks if *this specific user* has already requested *this specific book*. If so, it blocks the request.
3.  **Demand Tracking:** If it's a new request, it's inserted into the `book_requests` table.
4.  **Calculation:** When the user fetches their request history, the backend uses a Subquery: `(SELECT COUNT(*) FROM book_requests WHERE book_title = br.book_title)` to count the total demand for that book across *all* users.
5.  **Frontend UI:** React takes this `total_demand` number and dynamically fills the progress bar. If it hits 5, the UI shows "Threshold Reached".

---

## 5. Flow 4: The Admin Dashboard

1.  **Protected Route:** In React, the `/admin` route is wrapped in a `<ProtectedRoute requireAdmin={true}>` component. It checks the global `AuthContext` state. If `user.role !== 'admin'`, it redirects them away.
2.  **Backend Authorization:** The backend has a `verifyAdmin` middleware. Even if a clever student bypassed the React frontend, the backend middleware checks `if (req.user.role === 'admin')`. If not, it rejects the request (403 Forbidden).
3.  **Analytics Dashboard:** The backend aggregates data using SQL functions (like `COUNT`) and `GROUP BY` to send statistics to the admin about high-demand books and recent bookings.

---

## 📝 Common Viva Questions & How to Answer Them

**Q: How do you know who is making a booking if the HTTP protocol is stateless?**
> "We use JWT (JSON Web Tokens). When a user logs in, the server gives them a signed token. The React frontend saves this in LocalStorage and sends it in the Header of every subsequent API request. The backend verifies the signature and extracts the user's ID from the token payload, allowing us to know exactly who is making the request without maintaining server-side sessions."

**Q: What happens if two students try to book the exact same seat at the exact same second?**
> "The backend handles this to prevent double-booking. Before executing the `INSERT` query into the bookings table, it runs a `SELECT` query to check if an active booking already exists for that specific date, time slot, and resource ID. If it does, the second request is rejected with a 400 Bad Request error."

**Q: Why use Context API in React instead of just passing props?**
> "Authentication state (like whether the user is logged in, their name, and their role) is needed by almost every component—the Navbar, the routing system, and the individual pages. If we used props, we would have to pass this data down through every single component layer (prop drilling). Context API allows us to create a global state that any component can access directly."

**Q: How did you secure user passwords?**
> "Passwords are never stored in plain text. When a user registers, the backend uses the `bcryptjs` library to hash the password with a 'salt' before saving it to the SQLite database. When they log in, `bcrypt` hashes the entered password and compares it to the stored hash."
