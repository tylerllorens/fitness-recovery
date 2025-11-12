# Fitness Recovery Tracker 🧠💪

A full-stack backend built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL** — inspired by recovery systems like Whoop.  
It tracks daily sleep, heart-rate, HRV, and strain to calculate a personalized readiness score.

## 🚀 Tech Stack

- Node.js / Express for API
- Prisma ORM with PostgreSQL
- JWT Authentication
- Zod Validation
- CORS, Helmet, and Cookie-Parser middleware

## ⚙️ Setup Guide

Follow these steps to set up and run the **Fitness Recovery Tracker** backend on your local machine:

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/tylerllorens/fitness-recovery.git
cd fitness-recovery
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

`.env`

```bash
PORT=4001
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/recovery?schema=public"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN="http://localhost:5173"
```

### 4️⃣ Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5️⃣ Start the Development Server

```bash
npm run dev
```

If successful, your console should display:
🚀 API on http://localhost:4001
