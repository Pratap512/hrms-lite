# HRMS Lite - Full Stack Assessment

## 📖 Project Overview
HRMS Lite is a lightweight Human Resource Management System designed to streamline employee record keeping and attendance tracking. This application allows an admin to manage employee details and mark daily attendance statuses (Present/Absent).

It was built as a full-stack assessment to demonstrate capability in **FastAPI**, **React**, and **PostgreSQL**.

### 🌟 Key Features
* **Employee Management:** Add, view, and delete employee records with unique validation (Email/ID).
* **Attendance Tracking:** Mark employees as 'Present' or 'Absent' for the current date.
* **Real-time Analytics (Bonus):** Automatically calculates and displays the "Total Present Days" for each employee on the dashboard.
* **Responsive UI:** Clean, professional interface built with Tailwind CSS.

---

## 🔗 Live Deployment
* **Frontend (Live App):** https://hrms-lite-lime.vercel.app/
* **Backend (API):** https://hrms-backend-kgrz.onrender.com

> **Note:** The backend is hosted on Render's Free Tier. If the data takes a moment to load initially, please wait up to 60 seconds for the server to "wake up."

---

## 🛠 Tech Stack

### Frontend
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios
* **Icons:** Lucide React

### Backend
* **Framework:** FastAPI (Python)
* **Database (Prod):** PostgreSQL (Supabase)
* **Database (Local):** SQLite (for easy local testing)
* **ORM:** SQLAlchemy
* **Validation:** Pydantic

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your local machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/Pratap512/hrms-lite.git](https://github.com/Pratap512/hrms-lite.git)
cd hrms-lite
```

### 2. Backend Setup
The backend defaults to using a local SQLite database for development (no setup required).
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server (Runs on port 5000)
python -m uvicorn main:app --reload --port 5000
```

### 3. Frontend Setup
Open a new terminal window for the frontend.

```bash
cd frontend

# Install dependencies
npm install

# Start the React app
npm run dev
```

## 📂 Project Structure
```bash
hrms-lite/
├── backend/
│   ├── main.py            # Entry point, API routes, and Database Models
│   ├── requirements.txt   # Python dependencies
│   └── test.db            # Local SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main UI and Logic
│   │   └── index.css      # Tailwind imports
│   ├── tailwind.config.js # Styling configuration
│   └── package.json       # React dependencies
└── README.md
```

## ⚠️ Assumptions & Limitations

* **Attendance Logic:** Attendance is marked for "Today" based on the server's UTC date.

* **Deployment:** The application uses sqlite for local development to ensure stability, but switches to PostgreSQL (Supabase) automatically when deployed to Render via Environment Variables.








