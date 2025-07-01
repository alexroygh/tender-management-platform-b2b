# B2B Tender Management Platform

## Overview
A robust B2B tender-management platform where companies can:
- Register & manage their profile (including logo via Supabase Storage)
- Create & publish tenders
- Browse & apply to tenders
- Search for other companies by name, industry, or products/services
- View company and tender details
- See all tenders a company has applied to

## Tech Stack
- **Frontend:** Next.js (TypeScript, MUI for UI)
- **Backend:** Express.js (TypeScript, Knex.js for DB access)
- **Database:** PostgreSQL
- **Storage:** Supabase Storage (for company logos)
- **Auth:** JWT (stateless, secure)
- **Monorepo:** Single repo for frontend, backend, db, and docs

## Test Users

The following test users are seeded in the database and can be used for demo and testing purposes:

- **user1@example.com** / password
- **user2@example.com** / password
- **user3@example.com** / password
- **user4@example.com** / password
- **user5@example.com** / password
- **user6@example.com** / password
- **user7@example.com** / password
- **user8@example.com** / password
- **user9@example.com** / password
- **user10@example.com** / password

Feel free to sign up with your own email as well. These accounts can be used to log in and explore the platform features.

---
## Monorepo Structure
```
frontend/   # Next.js app (UI, SSR/SSG, MUI)
backend/    # Express.js app (API, JWT, Supabase integration, Knex)
```

## Key Features
- JWT authentication for all protected endpoints
- Company registration, profile, and logo upload (Supabase Storage)
- Tender creation, listing, and application flows
- Search companies by name, industry, or goods/services
- Applied tenders page for companies
- SSR/SSG for fast, SEO-friendly pages
- Modern, responsive UI with Material-UI (MUI)
- Robust seed data and migrations (via Knex)
- Docker Compose for easy local setup
- Row Level Security (RLS) on Supabase Storage (see troubleshooting)

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL
- Supabase account (for image storage)

### 2. Clone the Repository
```
git clone https://github.com/alexroygh/tender-management-platform-b2b.git
cd tender-management-platform-b2b
```

### 3. Database Setup
#### Option 1: Using Docker (Recommended)
- The provided `docker-compose.yml` will automatically create a PostgreSQL database, user, and password for you.
- To use Docker:
  ```sh
  docker-compose up
  ```
- This will start PostgreSQL with:
  - Database: `kibou`
  - User: `kibou`
  - Password: `kiboupass`
- You can connect to the database using:
  ```sh
  psql -h localhost -U kibou -d kibou
  ```

#### Option 2: Manual Setup (Local PostgreSQL)
1. Start your PostgreSQL server.
2. Open a terminal and run:
   ```sh
   psql -U postgres
   ```
3. In the psql prompt, run:
   ```sql
   CREATE DATABASE kibou;
   CREATE USER kibou WITH PASSWORD 'kiboupass';
   GRANT ALL PRIVILEGES ON DATABASE kibou TO kibou;
   ```

### 4. Run Migrations & Seed Data (Knex)
All database schema and seed data are managed via Knex (TypeScript).

- **Run migrations:**
  ```sh
  cd backend
  npx knex migrate:latest --knexfile knexfile.ts
  ```
- **Run seeds:**
  ```sh
  npx knex seed:run --knexfile knexfile.ts
  ```
  - This will insert robust demo data for users, companies, tenders, applications, etc.
  - **User passwords are securely hashed using bcrypt in the seed file.**

### 5. Supabase Storage Setup
- Go to [Supabase](https://app.supabase.com/), create a project.
- Create a storage bucket named `company-logos`.
- Enable Row Level Security (RLS) and add policies for authenticated users to upload/read/update/delete in this bucket.
- Get your Supabase project URL and service role key.

### 6. Environment Variables
- Copy `.env.example` to `.env` in `backend/` and fill in:
  ```
  DATABASE_URL=postgres://kibou:kiboupass@localhost:5432/kibou
  JWT_SECRET=your_jwt_secret
  SUPABASE_URL=your_supabase_url
  SUPABASE_KEY=your_supabase_service_role_key
  ```

### 7. Install Dependencies
#### Backend
```
cd backend
npm install
```
#### Frontend
```
cd ../frontend
npm install
```

### 8. Running the App
#### With Docker Compose (Recommended)
```
docker-compose up
```
- This will start PostgreSQL, backend, and frontend together.
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

#### Or Run Manually
- Start PostgreSQL (if not using Docker)
- Start backend:
  ```
  cd backend
  npm run dev
  ```
- Start frontend:
  ```
  cd frontend
  npm run dev
  ```
- Visit [http://localhost:3000](http://localhost:3000)

### 9. Usage
- Register a new user (Sign Up)
- Complete your company profile (upload logo, add goods/services)
- Create and publish tenders
- Browse and apply to tenders
- Search for companies
- View applied tenders

### 10. Environment Variables
- All sensitive keys are stored in `backend/.env` (never commit this file)
- Frontend uses `/api/*` proxy to backend (see `next.config.ts`)

### 11. Deployment
- Deploy frontend to Vercel (recommended)
- Deploy backend to Heroku, Render, or similar
- Set environment variables in deployment platform

---

## Troubleshooting
- **Supabase Storage RLS:** If you get `row-level security policy` errors, check your Supabase Storage policies. Allow authenticated users to upload/read/update/delete in the `company-logos` bucket.
- **PayloadTooLargeError:** If you get this error on image upload, increase the Express JSON body limit in `backend/src/index.ts`:
  ```js
  app.use(express.json({ limit: '5mb' }));
  ```
- **JWT Issues:** Ensure the frontend sends the JWT in the `Authorization` header for all protected endpoints.

---

## Deliverables
- [x] Frontend and backend folders
- [x] Database schema (migrations/ERD)
- [x] Architecture overview
- [x] Deployed demo links: Frontend: https://tender-management-platform-b2b.vercel.app, Backend: https://tender-management-platform-b2b.onrender.com



## Deployment Overview

This project is deployed using the following services:

- **Database:** [Neon](https://neon.tech/) (Postgres as a Service)
- **Backend:** [Render](https://render.com/) (Node.js/Express API)
- **Frontend:** [Vercel](https://vercel.com/) (Next.js React App)

---

### Database: Neon
- The Postgres database is hosted on [Neon](https://neon.tech/).
- We can manage database, users, and connection strings from the Neon dashboard.
- Update backend `.env` or environment variables with the Neon connection string (e.g., `DATABASE_URL`).

### Backend: Render
- The backend (Node.js/Express) is deployed on [Render](https://render.com/).
- Configure Render service to use the Neon `DATABASE_URL` and any other required environment variables (e.g., `SUPABASE_URL`, `SUPABASE_KEY`).
- Make sure backend is set to build and run using the correct `start` script and that migrations are run on deploy.

### Frontend: Vercel
- The frontend (Next.js) is deployed on [Vercel](https://vercel.com/).
- Set the environment variable `NEXT_PUBLIC_API_URL` to Render backend URL (e.g., `https://tender-management-platform-b2b.onrender.com`).
- Vercel will handle builds and deployments automatically from the GitHub repo.

---
