# CodeArena — Deployment Guide

This guide provides step-by-step instructions for deploying CodeArena to cloud infrastructure.

---

## 1. Managed Infrastructure Setup

### A. MongoDB Atlas (Database)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier or higher).
3. Navigate to **Database Access** and create a DB user with read/write permissions.
4. Navigate to **Network Access** and add IP `0.0.0.0/0` (Allow Access from Anywhere).
5. Copy your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/codearena`.

### B. Upstash / Redis Cloud (Caching & BullMQ)
1. Sign up for [Upstash Redis](https://upstash.com/).
2. Create a Redis database instance.
3. Copy the Redis URI connection string: `rediss://default:<password>@<endpoint>.upstash.io:6379`.

---

## 2. Backend Deployment (Render / Railway)

1. Connect your GitHub repository to [Render](https://render.com/) or [Railway](https://railway.app/).
2. Select **Web Service** with root directory set to `/backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<Your MongoDB Atlas URI>`
   - `REDIS_URL`: `<Your Upstash Redis URI>`
   - `JWT_ACCESS_SECRET`: `<Generate strong 64-char secret>`
   - `JWT_REFRESH_SECRET`: `<Generate strong 64-char secret>`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
   - `JUDGE0_API_URL`: `https://judge0-ce.p.rapidapi.com`
   - `JUDGE0_API_KEY`: `<Your RapidAPI Key>`
   - `OPENAI_API_KEY`: `<Your OpenAI Key>`

---

## 3. Frontend Deployment (Vercel / Netlify)

1. Connect your repository to [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend-service.onrender.com`

---

## 4. Post-Deployment Verification
- Run `npm run seed` against your production Mongo Atlas cluster or trigger seed via administrative API.
- Test student login, code submission execution, contest room Socket.IO connection, and recruiter assessment generation.
