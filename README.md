# 🌱 RelishAgro – FlavorCore Agricultural Excellence Platform

> **FlavorCore-powered agricultural worker management system with UIDAI compliance and biometric authentication.**

A Progressive Web App (PWA) to digitize agricultural operations from worker onboarding to field management. Built with offline resilience, biometric security (face recognition & fingerprint), UIDAI compliance, and comprehensive audit trails for Indian agricultural sector.RelishAgro – Digital Transformation for R F Plantations

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

| Layer | Technology | Details |
|------|------------|---------|
| **Frontend** | React 18 + TypeScript + Vite | PWA with offline support |
| **UI Framework** | Tailwind CSS + Custom Components | Responsive design |
| **Backend** | Supabase (PostgreSQL) | Real-time database |
| **Authentication** | Supabase Auth + Direct DB Query | Role-based access control |
| **Biometric** | Web Camera API + Fingerprint Scanner | Face capture & fingerprint |
| **Compliance** | UIDAI Regulation Framework | 5-point consent system |
| **Offline Support** | Service Worker + PWA | Background sync |
| **Deployment** | Vercel (Frontend) + Railway (Backend) | Auto-deployment |

---

## 🔐 Environment Variables

Create `.env.local`:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```env
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
## 🔐 Security & UIDAI Compliance

### UIDAI Compliance Framework
- **5-Point Consent System**: Comprehensive informed consent for biometric data collection
- **AES-256-GCM Encryption**: Military-grade encryption for all biometric data
- **Complete Audit Logging**: Full transaction history and compliance tracking
- **Data Minimization**: Only necessary data collected per UIDAI guidelines
- **Right to Deletion**: User data removal capability with proper audit trails

### Security Features
- **Role-based Access Control**: Three-tier access (Admin/Manager/Operator)
- **Supabase Authentication**: Secure login with direct database verification
- **Biometric Privacy**: Local processing with encrypted storage
- **PWA Security**: HTTPS enforcement and secure service worker implementation