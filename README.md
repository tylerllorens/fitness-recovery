# Fitness Recovery Tracker 🏋️‍♂️💤

A full-stack web application designed to unify fitness and recovery data in one place. Built to solve the real problem of fragmented data across multiple fitness platforms (Whoop, Garmin, Strava, Apple Health), this app provides athletes and fitness enthusiasts with a centralized hub for tracking, analyzing, and optimizing their training and recovery.

[Live Demo](#) | [Screenshots](#screenshots)

---

## 🎯 The Problem

Athletes and fitness enthusiasts use multiple apps for different purposes:

- **Recovery tracking**: Whoop, Oura Ring, Apple Health
- **Workout logging**: Strava, Garmin Connect, Apple Fitness
- **Performance data**: Various specialized apps

**The issue?** None of these platforms communicate with each other. Users can't see how their training impacts recovery, or vice versa. Data is siloed, making it impossible to spot patterns and correlations that could improve performance.

---

## 💡 The Solution

A unified platform where users can:

- ✅ Log recovery metrics (sleep, HRV, resting heart rate, strain)
- ✅ Track daily readiness scores calculated from multiple health factors
- ✅ Visualize trends over time (7-day and 28-day views)
- ✅ Identify patterns with color-coded zone indicators (green/yellow/red)
- ✅ Monitor streaks and maintain consistency
- ✅ Access long-term historical data and analytics

**Future Vision**: Import data from popular fitness platforms (CSV support, API integrations), add workout logging, and provide AI-powered training recommendations based on recovery status.

---

## ✨ Key Features

### 📊 Dashboard

- **Daily readiness score** (0-100) with visual circular progress gauge
- **Color-coded zones**: Green (70-100), Yellow (50-69), Red (0-49)
- **Quick metrics overview**: Sleep, HRV, RHR, Strain
- **7-day summary**: Averages, best/worst days, streaks, personalized recommendations

### 📅 Metrics Tracking

- **Calendar interface** with month/year navigation
- **Visual indicators** for days with logged data
- **Quick-entry form** for daily metrics
- **Historical data access** - click any date to view or edit

### 📈 Trends & Analytics

- **Interactive charts** powered by Recharts
- **Toggle between 7-day and 28-day views**
- **Zone distribution analysis** (days in each readiness zone)
- **Streak tracking**: 7h+ sleep streak, green zone streak
- **Daily breakdown table** with sortable columns
- **Smart recommendations** based on recent patterns

### 👤 Profile Management

- User account settings
- Profile information editing
- Secure authentication with JWT

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **React Router** for client-side routing
- **Recharts** for data visualization
- **Lucide React** for modern iconography
- **Context API** for state management
- Fully responsive design with modern UI/UX

### Backend

- **Node.js** + **Express 5** RESTful API
- **PostgreSQL** database
- **Prisma ORM** for type-safe database access
- **JWT Authentication** (access + refresh tokens)
- **Bcrypt** for password hashing
- **Zod** for request validation
- **Rate limiting** to prevent abuse
- **Helmet** for security headers
- **CORS** configuration for cross-origin requests

### Database Schema

```prisma
User → MetricDay (one-to-many)
User → RefreshToken (one-to-many)
```

---

## 🧮 Readiness Algorithm

The app calculates a daily readiness score (0-100) using a weighted formula:

```javascript
Readiness = (Sleep × 40%) + (HRV × 30%) + (RHR × 15%) + (Strain × 15%)
```

**How each metric is scored:**

- **Sleep**: Target 8 hours (sleepHours / 8 × 100)
- **HRV**: Target 80ms baseline (hrv / 80 × 100)
- **RHR**: Optimal around 50 bpm (100 - (rhr - 50) × 2)
- **Strain**: Lower is better for recovery (100 - (strain / 21 × 100))

Each metric is normalized to a 0-100 scale, weighted, and combined into a final readiness score.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/tylerllorens/fitness-recovery.git
cd fitness-recovery
```

2. **Set up the backend**

```bash
cd server
npm install

# Create .env file
echo 'PORT=4001
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/recovery?schema=public"
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
CORS_ORIGIN="http://localhost:5173"' > .env

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# Start server
npm run dev
```

3. **Set up the frontend**

```bash
cd ../client
npm install
npm run dev
```

4. **Access the app**

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4001`

---

## 📸 Screenshots

### Dashboard

![Dashboard Screenshot](./screenshots/dashboard.png)
_Daily readiness overview with visual metrics and 7-day summary_

### Metrics Calendar

![Metrics Calendar](./screenshots/metrics.png)
_Calendar-based data entry with highlighted days_

### Trends Analysis

![Trends Chart](./screenshots/trends.png)
_Interactive charts showing readiness patterns over time_

---

## 🗺️ Roadmap

### Phase 1: Current (MVP) ✅

- [x] User authentication & profile management
- [x] Manual metric logging
- [x] Readiness score calculation
- [x] Calendar interface
- [x] Trend visualization (7d/28d)
- [x] Zone-based recommendations
- [x] Modern, responsive UI

### Phase 2: Enhanced Analytics 🚧

- [ ] Workout logging (type, duration, intensity)
- [ ] Training calendar view
- [ ] Combined training/recovery dashboard
- [ ] Correlation insights (e.g., "HRV drops 2 days after hard workouts")

### Phase 3: Data Integration 📅

- [ ] CSV import from Whoop, Garmin, Strava
- [ ] API integrations for automatic data sync
- [ ] Multi-wearable support

### Phase 4: Intelligence 🤖

- [ ] Customizable readiness algorithm (user-defined weights)
- [ ] Training recommendations based on recovery status
- [ ] Goal setting and progress tracking
- [ ] Predictive analytics

---

## 🏗️ Project Structure

```
fitness-recovery/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── context/       # React Context (auth, etc.)
│   │   ├── api/           # API client functions
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   ├── services/      # Business logic (readiness calc)
│   │   ├── lib/           # Prisma client, env config
│   │   └── index.js       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
└── README.md              # This file
```

---

## 🔐 Security Features

- **JWT-based authentication** with refresh tokens
- **HTTP-only cookies** for refresh token storage
- **Bcrypt password hashing** (10 rounds)
- **Rate limiting** on auth endpoints
- **Helmet.js** security headers
- **Zod validation** on all inputs
- **Token revocation** on logout
- **CORS configuration** to prevent unauthorized access

---

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

---

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token

### Metrics

- `GET /api/metrics` - Get recent metric days (last 30)
- `POST /api/metrics` - Create or update metric day
- `GET /api/metrics/latest` - Get most recent metric day
- `GET /api/metrics/day?date=YYYY-MM-DD` - Get specific date

### Trends

- `GET /api/trends/summary?days=7` - Get summary statistics
- `GET /api/trends/7d` - Get 7-day trend data
- `GET /api/trends/28d` - Get 28-day trend data

### Profile

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

---

## 🤝 Contributing

This is currently a portfolio project, but feedback and suggestions are welcome! Feel free to open an issue or reach out.

---

## 👨‍💻 Author

**Tyler Llorens**

- GitHub: [@tylerllorens](https://github.com/tylerllorens)
- Portfolio: Coming Soon
- LinkedIn: [@tylerllorens] (https://www.linkedin.com/in/tylerllorens)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Inspired by recovery tracking systems like Whoop and Oura
- Built as a full-stack portfolio project to demonstrate:
  - RESTful API design
  - Database modeling and ORM usage
  - Modern React patterns and hooks
  - JWT authentication flows
  - Data visualization
  - Product thinking and UX design

---

**Note**: This is a portfolio/demonstration project. For production use with real wearables, additional features like OAuth integrations and real-time data syncing would be required.
