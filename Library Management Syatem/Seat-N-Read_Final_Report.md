# Project Report: Seat-N-Read
**A Comprehensive Digital Library Management & Resource Allocation System**

---

## 1. Introduction
Libraries have traditionally been hubs of knowledge and collaboration. However, as educational institutions grow and student populations increase, managing the physical and intellectual resources of a library becomes increasingly complex. "Seat-N-Read" is a modern, full-stack web application designed to digitize and streamline library operations. It bridges the gap between students and library administrators by offering real-time seat tracking, discussion room reservations, and a smart, demand-driven book request system. 

This report outlines the aim, problem statement, proposed solution, and the technical architecture used to bring Seat-N-Read to life.

---

## 2. Problem Statement
In traditional university and public libraries, several recurring issues hinder the user experience and administrative efficiency:
1. **The "Wandering" Problem:** Students frequently waste time walking through different floors or sections of a library trying to find an empty seat or a vacant discussion room during peak hours.
2. **Resource Hoarding:** Students may leave their belongings on a chair to "reserve" it for hours while they are away, preventing others from utilizing the space.
3. **Inefficient Book Procurement:** When a book is missing or not available in the library, students often write their requests in a physical ledger. Administrators have no automated way to track exactly how many students are demanding the same book, leading to guesswork when purchasing new inventory.
4. **Lack of Analytics:** Library staff lack real-time data on library utilization, making it difficult to allocate resources, manage staff scheduling, or justify budget expansions.

---

## 3. Aim of the Project
The primary aim of Seat-N-Read is to modernize the library experience by building a centralized, digital platform that:
*   Provides students with real-time visibility into seat and room availability.
*   Empowers students to reserve specific resources for dedicated time slots.
*   Creates an automated, mathematical system to track student demand for missing books.
*   Provides administrators with an analytical dashboard to monitor system usage and prioritize inventory purchases based on aggregated data.

---

## 4. Proposed Solution (Solving the Problem)
Seat-N-Read solves the aforementioned problems through a unified web interface split into user and admin modules:

*   **Real-time Seat Booking:** The application features a visual grid of library seats. Students can see which seats are available (highlighted dynamically) and reserve them for specific time slots. This eliminates wandering and provides a fair, first-come-first-serve digital reservation system.
*   **Discussion Room Allocation:** Similar to seats, high-capacity discussion rooms can be booked in advance, ensuring groups have guaranteed collaborative spaces.
*   **Smart Book Requests (Demand Threshold):** Instead of a physical ledger, students submit book requests digitally. The system groups identical requests (ignoring case sensitivity). Once a specific book reaches a predefined "Demand Threshold" (e.g., 5 requests), the system visually flags it as "High Demand" with a progress meter for students, and automatically alerts the library admins on their dashboard.
*   **Admin Dashboard:** Administrators are provided with a protected interface where they can view a consolidated log of all active bookings and manage book requests. They can mark highly demanded books as "Ordered," closing the feedback loop with the students.

---

## 5. Technology Stack & Concepts Used
Seat-N-Read is built using a modern JavaScript stack, ensuring high performance, scalability, and an excellent developer experience. 

### 5.1. Frontend Technologies (Client-Side)
The frontend is responsible for everything the user interacts with visually. It was built with a focus on a "Premium Dark Mode" aesthetic, utilizing Glassmorphism and micro-animations.
*   **React.js:** A JavaScript library for building user interfaces. It was chosen because it allows for the creation of a Single Page Application (SPA), meaning the page does not need to reload when navigating between the Dashboard, Booking, and Request pages.
*   **React Router (`react-router-dom`):** Handles the client-side routing, ensuring secure navigation and URL management.
*   **React Context API (`AuthContext`):** Used for global state management. Instead of passing user authentication status down through multiple layers of components (prop drilling), the Context API allows any component to instantly know if the user is logged in and what their role is.
*   **Axios:** A promise-based HTTP client used to send asynchronous REST API requests (GET, POST, PUT, DELETE) to the backend server.
*   **Vanilla CSS:** Custom CSS was written to implement a modern design system. It heavily utilizes CSS Variables (Custom Properties), CSS Grid/Flexbox for responsive layouts, and Keyframe Animations for smooth transitions.

### 5.2. Backend Technologies (Server-Side)
The backend acts as the brain of the application, handling business logic, database connections, and security.
*   **Node.js & Express.js:** Node.js executes the backend JavaScript, while Express.js provides a robust framework to build RESTful API endpoints. It handles incoming HTTP requests, processes them, and returns JSON responses.
*   **SQLite3:** A lightweight, relational database management system. It was chosen because it stores the entire database in a single local file (`seat-n-read.db`), requiring zero configuration while still supporting complex SQL queries, JOINs, and Foreign Key constraints.
*   **JSON Web Tokens (JWT):** The core of the authentication system. Because HTTP is stateless, the server needs a way to remember who is logged in. JWT provides a cryptographically signed token to the client upon login. The client sends this token back in the headers of every subsequent request, allowing the server to verify the user's identity securely.
*   **Bcrypt.js:** A cryptography library used for password hashing. When a user registers, their password is salted and hashed before being saved to the database. Even if the database is compromised, the original passwords remain secure.

---

## 6. System Architecture & Workflows

### 6.1. Database Schema
The SQLite database is structured into heavily normalized relational tables:
1.  **Users Table:** Stores `id`, `name`, `email`, hashed `password`, and `role` ('student' or 'admin').
2.  **Seats & Rooms Tables:** Stores the physical resources available in the library along with their capacities and active statuses.
3.  **Bookings Table:** A polymorphic table linking a user to a specific resource (either a seat or room) using a `resource_id`, a `type` column, and specific `date` and `time_slot` tracking. Foreign keys ensure a booking cannot exist without a valid user.
4.  **Book Requests Table:** Tracks individual book requests made by users, including the `book_title`, `author`, and `status`.

### 6.2. The Authentication Flow
1.  **Registration:** A user submits their details. The backend uses `bcrypt` to hash the password and inserts the user into the database.
2.  **Login:** The backend compares the submitted password with the database hash. If they match, a JWT is generated and sent to the client.
3.  **Protection:** Frontend routes are protected by a `ProtectedRoute` wrapper component. Backend API routes are protected by an Express middleware (`verifyToken`) that parses the JWT from the `Authorization` header and rejects unauthorized requests with a `401 Unauthorized` or `403 Forbidden` status.

### 6.3. The Booking Engine Workflow
To prevent double-booking, the system employs strict backend verification. When a user queries available seats, the backend runs a dynamic SQL query featuring a `LEFT JOIN`. It checks the `bookings` table for the current date and specific time slots. If an active booking exists for a seat, it is flagged as unavailable before the data ever reaches the frontend. When a user submits a booking, a final `SELECT` check is executed milliseconds before the `INSERT` query to prevent race conditions.

### 6.4. The Demand Aggregation Workflow
The book request system relies on SQL Subqueries and grouping. When a user views their request history, the backend executes `(SELECT COUNT(*) FROM book_requests WHERE book_title = br.book_title)`. This dynamically calculates the total demand across all users. The React frontend then uses `Math.min(demand, 5)` to calculate the width of a CSS progress bar, providing a visual "Demand Meter" that changes color when the threshold of 5 requests is reached.

---

## 7. Conclusion
Seat-N-Read successfully demonstrates how modern web technologies can be applied to solve traditional administrative and logistical challenges in educational environments. By leveraging a React frontend for a highly responsive user experience and a secure Node/Express/SQLite backend for robust data management, the project achieves its aim of creating a centralized, digital library hub. 

The implementation of JWT authentication, cryptographic password hashing, relational database design, and real-time resource allocation highlights a comprehensive understanding of full-stack software development principles. The resulting application is not only functional but highly scalable and ready for real-world deployment.
