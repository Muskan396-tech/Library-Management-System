# Seat-N-Read: Ultimate Viva Master Guide

This document is the exhaustive, end-to-end breakdown of your project. It explains the "what", "why", and "how" for every single part of the application, from the database up to the user interface. Use this to prepare for deep technical questions during your viva.

---

## 1. Project Initialization & Architecture

### What is the architecture?
The project follows a **Client-Server Architecture**. 
*   **Client (Frontend):** A React.js Single Page Application (SPA).
*   **Server (Backend):** A Node.js/Express.js REST API.
*   **Database:** A local SQLite relational database.

### Why this architecture?
It strictly separates concerns. The frontend only cares about displaying UI and capturing user input. The backend only cares about processing data, security, and database management. They communicate purely through JSON over HTTP, meaning you could swap out the React frontend for a Mobile App later without changing the backend.

---

## 2. The Database Layer (SQLite3)

### What is used?
*   `sqlite3` (npm package) for interacting with the database.
*   `backend/db/init.js` for creating tables and inserting initial data.
*   `backend/db/database.js` for establishing the connection.

### How are requirements fulfilled?
The project requires storing data securely and relating different entities (a user has bookings, a room has a capacity). 
1.  **Normalization:** The data is broken down into 5 distinct tables (`users`, `seats`, `rooms`, `bookings`, `book_requests`) to avoid data redundancy.
2.  **Foreign Keys:** In `database.js`, we run `db.run('PRAGMA foreign_keys = ON')`. This ensures **Referential Integrity**. For example, the `bookings` table has a `user_id` column. If a user doesn't exist in the `users` table, the database physically rejects the booking.

---

## 3. The Backend Layer (Node.js & Express.js)

### What is used?
*   **Node.js:** The environment that runs the server.
*   **Express.js:** The framework used to create the server, define routes (URLs), and handle HTTP requests/responses.

### How are requirements fulfilled?
The backend must handle requests, ensure security, and talk to the database.
1.  **Routing (`backend/routes/`)**: Express groups related endpoints. For example, all booking logic goes in `bookings.js`. This makes the code modular and maintainable.
2.  **RESTful API Design**: We use standard HTTP methods:
    *   `POST /api/auth/register` (Create data)
    *   `GET /api/bookings/seats` (Read data)
    *   `PUT /api/admin/requests/status` (Update data)
    *   `DELETE /api/bookings/:id` (Delete data)

### 3.1 Security Concepts Used (Authentication & Authorization)
*   **Bcrypt.js (Hashing):** When a user registers, their password is not saved directly. Bcrypt applies a mathematical algorithm and a "salt" (random data) to turn the password into a scrambled hash. If the database is hacked, the passwords cannot be read. During login, `bcrypt.compare()` checks if the entered password matches the hash.
*   **JSON Web Tokens (JWT):** HTTP is "stateless" (it forgets who you are after every request). After a successful login, the server signs a JWT containing the user's ID and role, and sends it to the frontend.
*   **Middleware (`auth.js`):** Functions that run *before* the main route logic. 
    *   `verifyToken`: Checks the HTTP headers for the JWT. If the token is fake or expired, it rejects the request (`401 Unauthorized`).
    *   `verifyAdmin`: Checks if the decoded JWT payload contains `role: 'admin'`. If not, it rejects the request (`403 Forbidden`).

---

## 4. The Frontend Layer (React.js)

### What is used?
*   **React:** A component-based UI library.
*   **React Router (`react-router-dom`):** Allows navigation without reloading the browser.
*   **Axios:** An HTTP client to send requests to the Express backend.

### How are requirements fulfilled?
The frontend must be interactive, maintain user sessions, and look professional.
1.  **Single Page Application (SPA):** React loads a single HTML page. When you click a link, JavaScript swaps out the components dynamically. This makes the app feel extremely fast.
2.  **State Management (React Hooks):**
    *   `useState`: Stores temporary data like what the user is typing in a form or the list of seats retrieved from the backend.
    *   `useEffect`: Runs functions automatically when a component loads (e.g., fetching seat availability from the backend as soon as the `BookSeat` page opens).
3.  **Global State (Context API):** `AuthContext.js` holds the user's login status globally. This means the `Navbar` knows to show the "Logout" button, and the routing system knows whether to allow access to the `/book-seat` page, without having to pass variables manually between every component.
4.  **Protected Routes:** A custom component in `App.js` checks the Context API. If a user tries to access `/admin` but their role is not 'admin', it uses the `Navigate` component to force them back to the home page.

---

## 5. Detailed Module Breakdown & SQL Logic

### Module 1: The Booking System (Concurrency & Joins)
**The Requirement:** Show available resources and prevent double-booking.
*   **How it works (Frontend):** It displays a grid. Green means available, Red means unavailable.
*   **How it works (Backend - SQL JOIN):** To find available seats, we don't just select seats. We do a `LEFT JOIN` between `seats` and `bookings` for the current date. If a seat has a matching active booking row, the SQL `CASE` statement marks `is_available` as 0. 
*   **Concurrency Control:** Right before inserting a new booking, the backend runs a `SELECT` query to check if that exact seat and time slot is already taken. This stops two students from clicking "Book" at the exact same millisecond and breaking the system.

### Module 2: The Demand Threshold System (Aggregation)
**The Requirement:** Track how many students want a missing book and alert admins.
*   **How it works (Backend - Subqueries):** When a user views their requests, the database runs a Subquery: `(SELECT COUNT(*) FROM book_requests WHERE book_title = br.book_title)`. This counts identical requests across the entire database dynamically.
*   **How it works (Frontend - Math & UI):** The frontend receives this total demand. It uses `Math.min(demand, 5)` to cap the progress bar at 5. It uses a ternary operator (`condition ? true : false`) to change the progress bar color to green and display a "High Demand" badge if the count hits 5.

### Module 3: The Admin Dashboard (Analytics)
**The Requirement:** Admins need to see system usage and manage high-demand books.
*   **How it works (Backend - GROUP BY):** The backend uses `GROUP BY book_title` and `COUNT(*) as demand_count`. This takes hundreds of individual requests and groups them into clean statistics.
*   **How it works (Frontend):** It maps over this aggregated data. Admins can click "Mark Ordered", which triggers an Axios `PUT` request to update the status of the book in the database, closing the administrative loop.

---

## 6. UI/UX Design Concepts
*   **Glassmorphism:** A modern UI trend used in the project. It uses `backdrop-filter: blur()` in CSS to make panels look like frosted glass over a dark gradient background.
*   **Micro-animations:** Using CSS `@keyframes` and transitions (`transform: translateY(-4px)`), buttons and cards slightly lift and glow when hovered over. This gives the user immediate visual feedback that an element is interactive.
*   **Responsive Grid:** Utilizing CSS `display: grid` ensures that whether the user is on a phone or a 4K monitor, the layout automatically adjusts its columns to fit the screen without breaking.
