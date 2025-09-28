# 📚 RelishAgro Implementation Guidelines

## 🔐 Security
- Never store full Aadhaar numbers
- Encrypt biometric templates at rest
- Log all authentication attempts
- Retain logs for 6 months

## 🧑‍💼 Roles
| Role | Permissions |
|------|-------------|
| Admin | Full access, user management |
| HarvestFlow Manager | Onboard staff, assign jobs, manage wages |
| FlavorCore Manager | Manage drying unit, inventory, labels |
| Staff | View own attendance, wages |

## 🔄 Sync Protocol
- Biometric templates sync daily or on demand
- Offline mode supported via IndexedDB
- Auto-sync when internet available

## 🧪 Testing
- Use `.env.local` for local development
- Test OTP flow with Mantra sandbox
- Simulate low-connectivity scenarios

## 🛠️ Deployment
- Frontend: Vercel
- Backend: Railway
- Database: Supabase