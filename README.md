# Library-Management-System
# 📚 Seat-N-Read

**Seat-N-Read** is a modern, full-stack digital platform designed to optimize library resource utilization. It eliminates the need for physical queues and overcrowding by allowing students to reserve seats/discussion rooms in advance, request missing books, and trace demand trends. The system includes an admin panel for library staff to configure seating rules and track real-time booking statistics.

---

## 🚀 Key Features

*   **User Authentication & Security:** Secure registration and login using JWT (JSON Web Tokens) and password hashing with `bcryptjs`.
*   **Seat & Room Booking System:** Interactive grid layout showing real-time availability of seats and discussion rooms.
*   **Prevent Overlapping & Double-Bookings:** Robust database-level constraint verification.
*   **Book Demand System:** Allows students to request new books. The system aggregates requests across users and alerts admins when demand for a book crosses a specified threshold.
*   **Admin Dashboard:** Comprehensive analytics for administrators to monitor bookings and procurement requests.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, React Router, Axios, Lucide React, CSS (Modern Premium Styling)
*   **Backend:** Node.js, Express.js (RESTful API architecture)
*   **Database:** SQLite (Lightweight, serverless relational database)
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs

---

## 📂 Project Structure

```text
ET-PROJECT/
├── backend/
│   ├── db/
│   │   ├── database.js          # SQLite connection setup
│   │   ├── init.js              # Database tables initialization script
│   │   └── seat-n-read.db       # SQLite database file
│   ├── middleware/
│   │   └── auth.js              # JWT validation middleware
│   ├── routes/
│   │   ├── admin.js             # Admin analytics & metrics endpoints
│   │   ├── auth.js              # User authentication endpoints
│   │   ├── bookings.js          # Booking & resource availability endpoints
│   │   └── requests.js          # Book procurement requests endpoints
│   ├── package.json
│   └── server.js                # Express app entry point
│
└── seat-n-read/                 # React Frontend
    ├── public/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js   # Global Authentication Context
    │   ├── pages/
    │   │   ├── Admin.js         # Admin dashboard view
    │   │   ├── BookSeat.js      # Interactive Seat Booking view
    │   │   ├── Home.js          # User dashboard / home view
    │   │   ├── Login.js         # User login screen
    │   │   └── Register.js      # User registration screen
    │   ├── services/
    │   │   └── api.js           # Centralized Axios interceptor for JWT
    │   ├── App.js               # Application routes & layout
    │   └── index.js             # React application entry point
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd "ET PROJECT"
```

### 3. Setup Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the SQLite database (this creates tables and seed data if not present):
   ```bash
   npm run init
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 4. Setup Frontend
1. Open a new terminal and navigate to the `seat-n-read` folder:
   ```bash
   cd seat-n-read
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *The application will open in your default browser at `http://localhost:3000`.*

---

## 🔒 Security & API Flow

1. **Authentication:** 
   * Passwords are hashed with `bcryptjs` before being stored in the `users` table.
   * On successful login, the server responds with a signed **JWT**.
   * The React client saves the token in `localStorage`.
2. **HTTP Interceptor:**
   * Axios request interceptor (`src/services/api.js`) automatically attaches the JWT to the `Authorization: Bearer <token>` header of every outgoing API request.
3. **Route Protection:**
   * Frontend: Protected components verify user credentials and roles via React Context.
   * Backend: Middleware (`verifyToken` & `verifyAdmin`) protects endpoints on the server.

---
