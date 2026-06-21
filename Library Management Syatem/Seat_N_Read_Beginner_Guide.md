# 📚 Seat-N-Read: A Beginner's Guide

Welcome! If you are new to programming and want to understand how your project works, this guide is for you. We will break down **Seat-N-Read** using simple analogies so you can easily explain it to anyone.

---

## 1. The Big Picture
Think of **Seat-N-Read** like a busy restaurant.
Our goal is to let students (customers) reserve a library seat (table) or request a new book without having to stand in line.

To build this, we used three main pieces that work together:
1. **The Frontend** *(The Dining Area / Menu)*
2. **The Backend** *(The Kitchen / Manager)*
3. **The Database** *(The Filing Cabinet / Ledger)*

---

## 2. The Frontend (What the user sees)
*Built with: **React***

The frontend is the "face" of your app. It handles the colors, buttons, and text on the screen. 
In our restaurant analogy, this is the dining area where customers look at the menu and give their orders to the waiter.

* **Where is this code?** It is located in the `seat-n-read/src/` folder.
* **Important Files:**
  * `App.js`: This is like the map of the restaurant. It tells the app "If the user goes to `/login`, show them the Login screen. If they go to `/book-seat`, show them the Seat Booking screen."
  * `pages/BookSeat.js`, `pages/Home.js`: These are the actual visual screens the user interacts with.

---

## 3. The Backend (The brain behind the scenes)
*Built with: **Node.js & Express***

The backend is invisible to the user. It is the "brain" or the "kitchen" of the restaurant. 
When a user clicks "Book Seat" on the frontend, the frontend sends a message (called an **API request**) to the backend. The backend's job is to check the rules: *"Is this person logged in? Is this seat already taken?"*

* **Where is this code?** It is located in the `backend/` folder.
* **Important Files:**
  * `server.js`: This is the restaurant manager. It starts the server, listens for incoming requests, and routes them to the right department.
  * `routes/bookings.js`: The department that only handles seat and room reservations.
  * `routes/requests.js`: The department that handles book requests and counts how many people want the same book.

---

## 4. The Database (The memory)
*Built with: **SQLite***

The backend has no memory of its own. It needs a filing cabinet to save information permanently. This is the **Database**. It remembers who registered accounts, which seats are taken today, and what books were requested. 

* **Where is this code?** It is located in the `backend/db/` folder.
* **Important Files:**
  * `seat-n-read.db`: The actual file where all the data is saved (like an Excel spreadsheet).
  * `init.js`: The script we ran to create the empty tables (rows and columns) for Users, Seats, and Bookings before we started.

---

## 5. How Everything Works Together (An Example)

Let's look at what happens when a student tries to book **Seat #5**:

1. **(Frontend)** The student opens the website, sees the green "Seat 5" button, and clicks it.
2. **(The Waiter)** The React app sends a secret message over the internet to the Backend saying: *"Student Bob wants Seat 5"*.
3. **(Backend)** The Node.js server receives this message. It opens the SQLite Database and asks: *"Is Seat 5 empty today?"*
4. **(Database)** The database replies: *"Yes, Seat 5 is empty."*
5. **(Backend)** The server tells the database: *"Great, write down that Bob owns Seat 5 now."* Then it replies back to the Frontend: *"Success!"*
6. **(Frontend)** The website shows a success popup, and Seat 5 instantly turns Red so no one else can click it.

---

## Summary for Your Teacher
If your teacher asks you how the project works, you can say:

> "My project is a Full-Stack Web Application. I used **React** for the user interface so students can easily navigate the website. When a student takes an action, React talks to my **Node.js/Express API** backend. My backend checks the business logic (like making sure double-bookings don't happen) and saves or retrieves the data from my **SQLite Database**."
