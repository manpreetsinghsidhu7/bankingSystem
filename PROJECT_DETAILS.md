# 📄 VAYU BANK: Technical Architecture & System Design

This document provides a comprehensive technical breakdown of **VAYU Bank**. It is intended for developers, architects, and technical reviewers to understand the "under the hood" mechanics of the project.

---

## 1. Architectural Philosophy: The Decoupled Layered Model

Unlike traditional "Flat" Express apps, VAYU Bank follows a **Separation of Concerns (SoC)** approach. Each request flows through four distinct layers:

### **A. Routing Layer (`routes/`)**
The entry point. It maps URLs to Controller functions. It also enforces security by applying **Auth Middlewares** (verifying JWTs) and **Validation Middlewares** (using Joi to ensure the request body is correct).

### **B. Controller Layer (`controllers/`)**
The orchestrator. Controllers are kept "thin." They only extract parameters from the request, call the appropriate Service, and send back the standardized JSON response.

### **C. Service Layer (`services/`) — The Financial Engine**
The "Brain." This is where the core banking rules live. 
- *Example*: When a user requests a withdrawal, the Service layer checks if the account is `ACTIVE`, verifies the balance, ensuring the user isn't overdrawing.
- This layer makes the app **database-agnostic**; the logic doesn't care if the data is in SQL or Mongo.

### **D. Repository Layer (`repositories/`)**
The data access layer. It contains all direct communication with the **Supabase (PostgreSQL)** client. It ensures that the rest of the application doesn't have to deal with raw database queries.

---

## 2. The Financial Logic (Atomic Operations)

The system handles several complex financial workflows:

### **Atm Operations (Deposit/Withdraw)**
- **PIN Verification**: Every ATM operation requires a `PIN_HASH` check against the database before any balance modification.
- **State Validation**: You cannot deposit into a `CLOSED` account or withdraw from a `FROZEN` one.
- **Double-Entry Simulation**: Every ATM action creates a ledger entry in the `transactions` table while simultaneously updating the `accounts` balance.

### **Internal P2P Transfers**
- **Validation**: The system checks if both sender and receiver accounts exist and are active.
- **Logic**: It performs a balance check on the sender, deducts the amount, adds it to the receiver, and logs the sender/receiver mapping.

---

## 3. Security Model & Authentication

### **Authentication (Identity)**
- **JWT (JSON Web Tokens)**: Used for stateless session management. Tokens expire in 1 hour.
- **Bcrypt Hashing**: Passwords are never stored in plain text. They are hashed with a salt (10 rounds).

### **Authorization (Access)**
- **RBAC (Role-Based Access Control)**: Middleware checks if the user's role is `ADMIN` for sensitive routes like `/admin/bank/*`.
- **Payment PIN**: A secondary 6-digit cryptographic PIN is required for movements of money. This prevents unauthorized transfers even if a device is left logged in.

### **OTP System (Demo Mode)**
- A secure OTP generation and verification flow is implemented for login and password resets, simulating professional bank identity verification.

---

## 4. UI/UX Design System

### **Design Language**
- **Surface & Brand tokens**: A custom set of neutral colors (`Surface`) and accent colors (`Brand`) provided via Tailwind variables for consistent branding.
- **Glassmorphism**: Subtle use of backdrop filters and transparency to create a premium, modern depth.

### **State Management**
- **Context API**: Used for `AuthContext` (User session) and `ThemeContext` (Dark/Light mode) to avoid "Prop Drilling."
- **Protected Routes**: A specialized `<ProtectedRoute>` component wraps sensitive views, redirecting unauthenticated users to Login.

---

## 5. Database Schema Overview

- **Users**: Unique identifiers, roles, and hashed credentials.
- **Accounts**: Linked to users via `id`. Contains `balance`, `pin_hash`, and `status` (`PENDING`, `ACTIVE`, `FROZEN`, `CLOSED`).
- **Transactions**: Foreign keys mapping to accounts, tracking `amount`, `type` (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER`), and timestamps.

---

## 6. Development & Deployment

The project is structured to be "Cloud-Ready":
- **Frontend**: Built with Vite for ultra-fast development and optimized production bundles.
- **Backend**: Uses Winston for production-grade logging, essential for debugging financial data in a live environment.

---

> Created for VAYU Bank — Visionary Assets & Yield Universe
