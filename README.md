# 🌱 RelishAgro – Digital Transformation for R F Plantations

> **RelishAgro is not just an app — it’s the digital transformation of R F Plantations.**

A Progressive Web App (PWA) to digitize plantation operations from field harvest to final processing at FlavorCore. Built with offline resilience, biometric security, and multi-location traceability.

---

## 🔗 Project Links

| Service | URL |
|--------|-----|
| **Frontend Repo** | [https://github.com/Morpheus61/relishagro.git](https://github.com/Morpheus61/relishagro.git) |
| **Backend Repo** | [https://github.com/Morpheus61/relishagro_backend.git](https://github.com/Morpheus61/relishagro_backend.git) |
| **Live Frontend** | [https://relishagro.vercel.app](https://relishagro.vercel.app) |
| **Supabase Dashboard** | [https://supabase.com/dashboard/project/engzyfgdgqhuatymkshk](https://supabase.com/dashboard/project/engzyfgdgqhuatymkshk) |
| **Railway Backend** | Deployed via GitHub |

---

## 🏗️ Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React + Vite PWA |
| **Backend** | FastAPI (Python) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + JWT |
| **Face Recognition** | OpenCV (Lightweight Haar Cascades) |
| **Offline Support** | IndexedDB + Background Sync |
| **Hosting** | Vercel (Frontend), Railway (Backend) |

---

## 🔐 Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ3p5ZmdkZ3FodWF0eW1rc2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzQ5OTQsImV4cCI6MjA3MzIxMDk5NH0.MKnrO7Zi7bfqGq8yl0taItXcU8rnl0zhsqXr7htOrEY