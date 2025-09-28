# 📋 **RELISH AGRO FRONTEND DOCUMENTATION**

## 🏗️ **PROJECT OVERVIEW**

**Relish Agro Frontend** is a React-based web application built for agricultural operations management, featuring two main modules:
- **HarvestFlow**: Farm operations and worker management
- **FlavorCore**: Processing and inventory management

### **Technology Stack:**
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Custom Components
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Vercel (Frontend) + Railway (Backend)

---

## 📁 **PROJECT STRUCTURE**

```
Relish_Agro/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── (images, logos)
│   ├── components/
│   │   ├── harvestflow/
│   │   │   ├── HarvestFlowDashboard.tsx
│   │   │   ├── JobAssignmentScreen.tsx
│   │   │   ├── HarvestLogScreen.tsx
│   │   │   ├── ThreshingLogScreen.tsx
│   │   │   ├── WageCalculationScreen.tsx
│   │   │   └── MaintenanceScreen.tsx
│   │   ├── flavorcore/
│   │   │   ├── FlavorCoreDashboard.tsx
│   │   │   ├── DryingUnitScreen.tsx
│   │   │   ├── RFIDInScanScreen.tsx
│   │   │   ├── ProductLabelScreen.tsx
│   │   │   └── InventoryScreen.tsx
│   │   ├── shared/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── AttendanceScreen.tsx
│   │   │   ├── ProcurementScreen.tsx
│   │   │   └── PublicVerificationScreen.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Environment Variables (.env.local):**
```env
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ3p5ZmdkZ3FodWF0eW1rc2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzQ5OTQsImV4cCI6MjA3MzIxMDk5NH0.MKnrO7Zi7bfqGq8yl0taItXcU8rnl0zhsqXr7htOrEY
```

### **Development Commands:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 **BACKEND INTEGRATION REQUIREMENTS**

### **Backend Repository:**
- **GitHub**: https://github.com/Morpheus61/relishagro_backend.git
- **Railway**: Connected to GitHub repo for auto-deployment

### **Required Backend APIs:**

#### **1. Authentication APIs:**
```typescript
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
GET  /api/auth/profile
```

#### **2. HarvestFlow APIs:**
```typescript
// Job Management
GET    /api/jobs
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id

// Harvest Logs
GET    /api/harvest-logs
POST   /api/harvest-logs
PUT    /api/harvest-logs/:id

// Threshing Operations
GET    /api/threshing-logs
POST   /api/threshing-logs
PUT    /api/threshing-logs/:id

// Wage Calculations
GET    /api/wages
POST   /api/wages/calculate
GET    /api/wages/worker/:id

// Maintenance
GET    /api/maintenance
POST   /api/maintenance
PUT    /api/maintenance/:id
```

#### **3. FlavorCore APIs:**
```typescript
// Drying Units
GET    /api/drying-units
POST   /api/drying-units
PUT    /api/drying-units/:id

// RFID Operations
POST   /api/rfid/scan-in
GET    /api/rfid/history

// Product Labels
GET    /api/products
POST   /api/products/label
PUT    /api/products/:id

// Inventory Management
GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory/:id
DELETE /api/inventory/:id
```

#### **4. Shared APIs:**
```typescript
// Attendance
GET    /api/attendance
POST   /api/attendance/checkin
POST   /api/attendance/checkout

// Procurement
GET    /api/procurement
POST   /api/procurement
PUT    /api/procurement/:id

// Public Verification
GET    /api/verify/:qr_code
GET    /api/public/product/:id
```

---

## 🗄️ **SUPABASE DATABASE INTEGRATION**

### **Required Database Tables:**

#### **1. Users & Authentication:**
```sql
-- Users table (handled by Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'worker', 'operator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. HarvestFlow Tables:**
```sql
-- Jobs
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Harvest Logs
CREATE TABLE harvest_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES profiles(id),
  crop_type TEXT,
  quantity DECIMAL,
  quality_grade TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threshing Logs
CREATE TABLE threshing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT,
  input_quantity DECIMAL,
  output_quantity DECIMAL,
  efficiency_percentage DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wages
CREATE TABLE wages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES profiles(id),
  date DATE,
  hours_worked DECIMAL,
  hourly_rate DECIMAL,
  total_amount DECIMAL,
  status TEXT CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance
CREATE TABLE maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name TEXT,
  maintenance_type TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3. FlavorCore Tables:**
```sql
-- Drying Units
CREATE TABLE drying_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_name TEXT,
  temperature DECIMAL,
  humidity DECIMAL,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  batch_id TEXT,
  qr_code TEXT UNIQUE,
  rfid_tag TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFID Scans
CREATE TABLE rfid_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfid_tag TEXT,
  product_id UUID REFERENCES products(id),
  scan_type TEXT CHECK (scan_type IN ('in', 'out')),
  scanned_by UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **4. Shared Tables:**
```sql
-- Attendance
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES profiles(id),
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  date DATE,
  total_hours DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procurement
CREATE TABLE procurement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT,
  item_name TEXT,
  quantity DECIMAL,
  unit_price DECIMAL,
  total_amount DECIMAL,
  status TEXT CHECK (status IN ('pending', 'ordered', 'received')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Verification
CREATE TABLE public_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  qr_code TEXT UNIQUE,
  verification_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### **Frontend Deployment (Vercel):**
- **Platform**: Vercel
- **Domain**: https://relishagro.vercel.app
- **Project ID**: prj_JWi5X5hMzYntrjuA2jGt9spOwvje
- **GitHub Repo**: https://github.com/Morpheus61/relishagro.git

### **Backend Deployment (Railway):**
- **Platform**: Railway
- **GitHub Repo**: https://github.com/Morpheus61/relishagro_backend.git
- **Auto-deployment**: Connected to GitHub repo

### **Environment Variables:**

#### **Frontend Variables (Vercel):**
```env
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ3p5ZmdkZ3FodWF0eW1rc2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzQ5OTQsImV4cCI6MjA3MzIxMDk5NH0.MKnrO7Zi7bfqGq8yl0taItXcU8rnl0zhsqXr7htOrEY
VITE_API_BASE_URL=https://your-backend.railway.app
```

#### **Backend Variables (Railway):**
```env
# Supabase Configuration
SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ3p5ZmdkZ3FodWF0eW1rc2hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYzNDk5NCwiZXhwIjoyMDczMjEwOTk0fQ.8IjKTeaQ8lzZsQIfY0oNKEAUxLYJl1M3m664Vzmx1fs

# JWT & Security
JWT_SECRET=your_jwt_secret

# CORS
FRONTEND_URL=https://relishagro.vercel.app

# Server Configuration
PORT=8080
NODE_ENV=production
```

### **Deployment Commands:**

#### **Frontend (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Link to existing project
vercel link --project=prj_JWi5X5hMzYntrjuA2jGt9spOwvje
```

#### **Backend (Railway):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link relishagro-backend
railway deploy

# Set environment variables
railway variables set SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set FRONTEND_URL=https://relishagro.vercel.app
railway variables set JWT_SECRET=your_jwt_secret
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Frontend Security:**
- Environment variables prefixed with `VITE_` are public
- Never store sensitive keys in frontend code
- Use Supabase RLS (Row Level Security)
- Implement proper authentication flow
- Validate user inputs on frontend and backend

### **Backend Security:**
- Validate all API inputs
- Implement proper CORS policies
- Use environment variables for secrets
- Enable Supabase RLS policies
- Implement rate limiting
- Use HTTPS in production
- Sanitize database queries

### **Supabase RLS Policies:**
```sql
-- Example RLS policy for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 🧪 **TESTING & DEVELOPMENT**

### **Development Workflow:**
1. Clone repositories:
   ```bash
   git clone https://github.com/Morpheus61/relishagro.git
   git clone https://github.com/Morpheus61/relishagro_backend.git
   ```
2. Start Supabase locally: `supabase start`
3. Install frontend dependencies: `npm install`
4. Run frontend: `npm run dev`
5. Run backend API server
6. Test API endpoints with frontend integration

### **Production Deployment:**
1. Frontend auto-deploys from GitHub to Vercel
2. Backend auto-deploys from GitHub to Railway
3. Environment variables configured in platform dashboards
4. Database managed by Supabase
5. Monitor deployment logs in respective dashboards

---

## 📦 **DEPENDENCIES**

### **Frontend Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.44.4",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.0.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **Build Errors:**
   - Ensure TypeScript configuration is correct
   - Check for missing dependencies
   - Verify environment variables

2. **Supabase Connection:**
   - Verify URL and keys in `.env.local`
   - Check Supabase project status
   - Ensure RLS policies are configured

3. **Deployment Issues:**
   - Check Vercel/Railway build logs
   - Verify environment variables in platform dashboards
   - Ensure build commands are correct

---

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **SUPPORT**

For support and questions:
- GitHub Issues: [Frontend](https://github.com/Morpheus61/relishagro/issues) | [Backend](https://github.com/Morpheus61/relishagro_backend/issues)
- Email: support@relishagro.com

---

**Last Updated:** September 28, 2025