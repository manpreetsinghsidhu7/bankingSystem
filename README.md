# 🏦 VAYU BANK: Visionary Assets & Yield Universe

[![Project Status: Ready](https://img.shields.io/badge/Status-Project--Ready-success?style=for-the-badge)](https://github.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)

**VAYU Bank** is a premium, full-stack digital banking ecosystem designed to provide a secure, elegant, and seamless financial experience. Built with a robust layered architecture, it replicates real-world banking operations including PIN-protected transactions, admin approval workflows, and an interactive ATM facility.

---

## 🎯 Project Overview

This project serves as a comprehensive demonstration of modern web engineering. It features a completely decoupled architecture, rigorous security protocols (JWT, Bcrypt, Multi-layer PIN/OTP), and a high-performance administrative engine for bank oversight.

### 🌟 Key Features

#### **👤 For Customers (Users)**
- **Intelligent Dashboard**: Real-time balance tracking, recent activity, and account status management.
- **Multimodal ATM**: PIN-secured deposit and withdrawal facility with instant settlement.
- **P2P Payments**: Zero-fee instant transfers to any VAYU account number.
- **Security-First UX**: Sensitivity-aware balance reveal and multi-account management.
- **Privacy Controls**: 6-digit payment PIN requirement for all financial operations.

#### **🛡️ For Administrators (Admin)**
- **Centralized Command Center**: Real-time stats on total users, bank liquidity, and transaction volumes.
- **Regulatory Oversight**: Approve or Reject new account opening requests.
- **Account Controls**: Ability to Freeze, Unfreeze, or Close accounts following suspicious activity.
- **Financial Analytics**: 7-day transaction volume tracking and distribution breakdowns.

---

## 🛠️ Tech Stack

### **Frontend**
- **Library**: React (Functional Components & Hooks)
- **Styling**: Tailwind CSS (Custom Color System & Glassmorphism)
- **Icons**: Lucide React
- **State/Routing**: React Router DOM
- **Notifications**: React Hot Toast

### **Backend**
- **Runtime**: Node.js & Express
- **Logging**: Winston (Structured JSON Logs)
- **Validation**: Joi (Schema-based request validation)
- **Authorization**: RBAC (Role-Based Access Control)
- **Security**: JWT (Authentication) & Bcrypt (Password Hashing)

### **Database & Infrastructure**
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Designed for Vercel/Render compatibility

---

## 📁 Project Structure

```text
bankingSystem/
├── backend/            # Express Node.js Server
│   ├── schema.sql      # Database Schema & RPCs
│   ├── src/
│   │   ├── controllers/# Request handling
│   │   ├── services/   # Business logic (Internal Engine)
│   │   ├── repositories/# Database interaction (Supabase)
│   │   └── routes/     # API Endpoints
├── frontend/           # Vite + React Client
│   ├── src/
│   │   ├── components/ # Atomic UI & Layouts
│   │   ├── pages/      # Views (Dashboard, ATM, Admin)
│   │   └── services/   # API Connection layer
├── README.md           # This file
└── PROJECT_DETAILS.md  # Deep dive into architecture & logic
```

---

## 🚀 Installation & Setup

Follow these steps to run the VAYU Bank portal locally:

### 1. Prerequisites
- Node.js (v18 or higher)
- A Supabase Project (for database)

### 2. Database Configuration
Execute the provided SQL file in your Supabase SQL Editor:
1. `backend/schema.sql` (Creates unified tables, relationships, and RPCs)

### 3. Backend Setup
```bash
cd backend
npm install
# Create .env based on the guidance below
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
# Create .env based on the guidance below
npm run dev
```

### 5. Setting up an Admin Account
To access the Admin Portal:
1. Register an account normally via the website.
2. Open your **Supabase Dashboard > Table Editor > users**.
3. Locate your user and change the `role` column value to `ADMIN`.
4. Sign out and sign back in to access the Admin Command Center.

---

## 🔑 Environment Variables Guidance

The project requires specific environment keys to function. Refer to `backend/.env.dummy` and `frontend/.env.dummy` for placeholder examples already included in the repository.

### **Backend (`/backend/.env`)**
| Key | Description | Example |
|---|---|---|
| `PORT` | Port for the server | `5000` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service_role secret | `eyJ...` |
| `JWT_SECRET` | Secret for token signing | `your_long_random_string` |
| `JWT_EXPIRES_IN` | Session validity duration | `1h` |

### **Frontend (`/frontend/.env`)**
| Key | Description | Example |
|---|---|---|
| `VITE_API_URL` | The URL where your backend is running | `http://localhost:5000/api/v1` |

---

## 📖 Complete Documentation
For an in-depth understanding of the system logic, security models, and database design, please read the **[PROJECT_DETAILS.md](PROJECT_DETAILS.md)** file.

---

> [!NOTE]
> This project is a demonstration of professional software engineering practices. It is not an actual financial service.
