# 📋 **RELISH AGRO FRONTEND DOCUMENTATION**

## 🏗️ **PROJECT OVERVIEW**

**Relish Agro Frontend** is a comprehensive React-based agricultural management system built for modern farm operations. The platform features a role-based architecture supporting multiple operational workflows:

### **Core Modules:**
- **HarvestFlow**: Farm operations, worker management, and harvest tracking
- **FlavorCore**: Processing, inventory management, and quality control
- **Admin Portal**: User management, system configuration, and analytics
- **Supervisor Dashboard**: Operational oversight and quality assurance

### **Technology Stack:**
- **Frontend**: React 18 + TypeScript + Vite with HMR
- **UI Framework**: Tailwind CSS + Custom Component Library
- **Icons**: Lucide React
- **Authentication**: Role-based access control (RBAC) system
- **Backend**: Python FastAPI (transitioning from Supabase direct calls)
- **Database**: PostgreSQL (managed via Python backend)
- **PWA**: Service Worker, offline capabilities, installable app
- **Build Tool**: Vite with PWA plugin
- **Deployment**: Vercel (Frontend) + Railway (Backend)

---

## 📁 **PROJECT STRUCTURE**

```
Relish_Agro/
├── public/
│   ├── flavorcore-logo.png        # App logo and branding
│   ├── manifest.json              # PWA manifest configuration
│   ├── sw.js                      # Service worker for offline functionality
│   └── icons/
│       └── icon-512x512.png       # PWA app icons
├── src/
│   ├── assets/
│   │   └── flavorcore-logo.png    # App assets and media
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx              # ✅ Complete admin portal
│   │   ├── harvestflow/
│   │   │   └── HarvestFlowDashboard.tsx        # ✅ Farm operations dashboard
│   │   ├── flavorcore/
│   │   │   └── FlavorCoreManagerDashboard.tsx  # ✅ Processing dashboard
│   │   ├── supervisor/
│   │   │   └── SupervisorDashboard.tsx         # ✅ Quality oversight dashboard
│   │   ├── shared/
│   │   │   ├── LoginScreen.tsx                 # ✅ Role-based authentication
│   │   │   ├── MobileNav.tsx                   # ✅ PWA navigation
│   │   │   ├── OnboardingScreen.tsx            # ✅ Staff onboarding workflow
│   │   │   ├── ProcurementScreen.tsx           # ✅ Procurement management
│   │   │   ├── PublicVerificationScreen.tsx    # ✅ Product verification
│   │   │   ├── AttendanceOverride.tsx          # ✅ Attendance management
│   │   │   ├── CameraCapture.tsx               # ✅ Biometric face capture
│   │   │   └── RFIDScanner.tsx                 # ✅ RFID tag management
│   │   └── ui/
│   │       ├── button.tsx                      # ✅ Reusable UI components
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   ├── config/
│   │   └── biometricConfig.ts                  # ✅ UIDAI compliance configuration
│   ├── guidelines/
│   │   └── Guidelines.md                       # ✅ Development guidelines
│   ├── lib/
│   │   ├── api.ts                              # ✅ Python backend API integration
│   │   ├── biometricAuth.ts                    # ✅ Face recognition system
│   │   ├── biometricMatcher.ts                 # ✅ Biometric matching algorithms
│   │   ├── fingerprintScanner.ts               # ✅ Fingerprint scanning
│   │   ├── secureFingerprintScanner.ts         # ✅ Secure fingerprint processing
│   │   ├── nfcScanner.ts                       # ✅ NFC/RFID scanning
│   │   ├── offlineSync.ts                      # ✅ Offline data synchronization
│   │   ├── pushNotifications.ts                # ✅ PWA push notifications
│   │   ├── registerSW.ts                       # ✅ Service worker registration
│   │   ├── exportHelpers.ts                    # ✅ Data export utilities
│   │   ├── aadhaar.ts                          # ✅ UIDAI Aadhaar integration
│   │   └── types.ts                            # ✅ TypeScript type definitions
│   ├── types/
│   │   ├── index.ts                            # ✅ Global type definitions
│   │   ├── attendance.ts                       # ✅ Attendance system types
│   │   └── web-serial.d.ts                     # ✅ Web Serial API types
│   ├── App.tsx                                 # ✅ Main app with role-based routing
│   ├── main.tsx                                # ✅ React app entry point
│   ├── index.css                               # ✅ Global styles and Tailwind
│   └── env.d.ts                                # ✅ Environment type definitions
├── dev-dist/                                   # ✅ PWA build artifacts
│   ├── registerSW.js
│   ├── sw.js
│   └── workbox-e755d862.js
├── package.json                                # ✅ Dependencies and scripts
├── tsconfig.json                               # ✅ TypeScript configuration
├── tsconfig.node.json                          # ✅ Node.js TypeScript config
├── tailwind.config.js                          # ✅ Tailwind CSS configuration
├── postcss.config.cjs                          # ✅ PostCSS configuration
├── vite.config.ts                              # ✅ Vite + PWA configuration
├── vercel.json                                 # ✅ Vercel deployment config
├── DOCUMENTATION.md                            # 📄 This comprehensive guide
├── BIOMETRIC_COMPLIANCE.md                     # 📄 UIDAI compliance documentation
├── WORKFLOW_ASSESSMENT.md                      # 📄 Component gap analysis
└── README.md                                   # 📄 Quick start guide
```

### **🎯 Role-Based Architecture:**

#### **Admin Dashboard** (`admin/AdminDashboard.tsx`)
- **Purpose**: Complete administrative control and system management
- **Features**: User management, onboarding approvals, wage approvals, yield analytics, system parameters
- **Access Level**: Full system access
- **Status**: ✅ **Fully Implemented** (671 lines, complete workflow)

#### **HarvestFlow Manager** (`harvestflow/HarvestFlowDashboard.tsx`)
- **Purpose**: Farm operations and harvest management
- **Features**: Daily work assignments, harvest logging, lot management, dispatch coordination, wage calculations
- **Access Level**: Farm operations management
- **Status**: ✅ **Fully Implemented** (719 lines, 8 functional sections)

#### **FlavorCore Manager** (`flavorcore/FlavorCoreManagerDashboard.tsx`)
- **Purpose**: Processing and inventory management
- **Features**: Drying unit control, RFID scanning, product labeling, inventory tracking
- **Access Level**: Processing operations management
- **Status**: ✅ **Implemented** (component exists, ready for backend integration)

#### **Supervisor Dashboard** (`supervisor/SupervisorDashboard.tsx`)
- **Purpose**: Quality oversight and operational supervision
- **Features**: Quality control, process monitoring, compliance verification
- **Access Level**: Operational oversight
- **Status**: ✅ **Implemented** (component exists, ready for backend integration)
---

## 🔧 **CURRENT ARCHITECTURE & BACKEND TRANSITION**

### **Backend Integration Status:**
- **Current State**: Transitioning from Supabase direct calls to Python FastAPI backend
- **API Layer**: Custom API abstraction in `src/lib/api.ts`
- **Authentication**: Role-based system with local token management
- **Data Flow**: Frontend → Python Backend → PostgreSQL Database

### **Environment Configuration (.env.local):**
```env
# Backend API Configuration
VITE_API_BASE_URL=https://your-python-backend.railway.app

# Legacy Supabase (being phased out)
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PWA Configuration
VITE_APP_NAME=FlavorCore
VITE_APP_SHORT_NAME=FlavorCore
```

### **Development Commands:**
```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint TypeScript code
npm run lint
```

### **PWA Features:**
- **Service Worker**: Offline functionality and caching
- **Manifest**: Installable app with custom icons
- **Push Notifications**: Real-time updates
- **Offline Sync**: Background data synchronization
- **Install Prompt**: In-app installation guidance

---

## 🔗 **PYTHON BACKEND INTEGRATION**

### **Backend Repository:**
- **GitHub**: https://github.com/Morpheus61/relishagro_backend.git
- **Railway**: Connected to GitHub repo for auto-deployment
- **Framework**: Python FastAPI with async support
- **Database**: PostgreSQL with SQLAlchemy ORM

### **API Architecture:**

#### **Authentication & Authorization:**
```python
# JWT-based authentication with role validation
POST /api/auth/login          # Role-based login
POST /api/auth/logout         # Token invalidation
GET  /api/auth/profile        # User profile data
POST /api/auth/refresh        # Token refresh
```

#### **Admin APIs:**
```python
# User Management
GET    /api/admin/users                    # List all users
POST   /api/admin/users                    # Create new user
PUT    /api/admin/users/{user_id}          # Update user
DELETE /api/admin/users/{user_id}          # Delete user

# Onboarding Approvals
GET    /api/admin/onboarding/pending       # Pending onboarding requests
POST   /api/admin/onboarding/approve       # Approve onboarding
POST   /api/admin/onboarding/reject        # Reject onboarding

# Wage Management
GET    /api/admin/wages/pending            # Pending wage approvals
POST   /api/admin/wages/approve            # Approve wages
GET    /api/admin/wages/reports            # Wage reports

# System Settings
GET    /api/admin/settings/yields          # Yield parameters
PUT    /api/admin/settings/yields          # Update yield settings
GET    /api/admin/analytics                # System analytics
```

#### **HarvestFlow APIs:**
```python
# Daily Work Management
GET    /api/harvestflow/workers            # Available workers
GET    /api/harvestflow/job-types          # Job categories
POST   /api/harvestflow/assign-work        # Assign daily work
GET    /api/harvestflow/daily-assignments  # Current assignments

# Harvest Operations
POST   /api/harvestflow/harvest-log        # Log harvest data
GET    /api/harvestflow/harvest-logs       # Harvest history
POST   /api/harvestflow/lot-create         # Create new lot
GET    /api/harvestflow/lots               # Lot management

# Threshing & Processing
POST   /api/harvestflow/threshing-log      # Log threshing operations
GET    /api/harvestflow/threshing-logs     # Threshing history
POST   /api/harvestflow/quality-check      # Quality assessments

# Dispatch Management
GET    /api/harvestflow/ready-lots         # Lots ready for dispatch
POST   /api/harvestflow/dispatch          # Create dispatch order
GET    /api/harvestflow/dispatch-history  # Dispatch tracking

# Wage Calculations
GET    /api/harvestflow/wage-summary       # Worker wage summary
POST   /api/harvestflow/wage-calculate     # Calculate wages
GET    /api/harvestflow/wage-history       # Wage payment history
```

#### **FlavorCore APIs:**
```python
# Drying Operations
GET    /api/flavorcore/drying-units        # Drying unit status
POST   /api/flavorcore/drying-start        # Start drying process
PUT    /api/flavorcore/drying-update       # Update drying parameters

# RFID & Inventory
POST   /api/flavorcore/rfid-scan           # Process RFID scan
GET    /api/flavorcore/inventory           # Current inventory
POST   /api/flavorcore/inventory-update    # Update inventory
GET    /api/flavorcore/product-history     # Product traceability

# Quality Control
POST   /api/flavorcore/quality-check       # Log quality assessments
GET    /api/flavorcore/quality-reports     # Quality reports
POST   /api/flavorcore/batch-approval      # Approve batches
```

#### **Shared APIs:**
```python
# Attendance Management
POST   /api/attendance/checkin             # Biometric check-in
POST   /api/attendance/checkout            # Biometric check-out
GET    /api/attendance/records             # Attendance records
POST   /api/attendance/override            # Manual override

# Procurement
GET    /api/procurement/requests           # Procurement requests
POST   /api/procurement/create             # Create procurement
PUT    /api/procurement/update             # Update status

# Public Verification
GET    /api/public/verify/{qr_code}        # Verify product by QR
GET    /api/public/product/{product_id}    # Public product info
GET    /api/public/traceability/{batch_id} # Batch traceability
```

#### **Biometric & UIDAI APIs:**
```python
# Face Recognition
POST   /api/biometric/face-register        # Register face template
POST   /api/biometric/face-verify          # Verify face identity
GET    /api/biometric/consent-status       # UIDAI consent status

# Fingerprint Authentication
POST   /api/biometric/fingerprint-register # Register fingerprint
POST   /api/biometric/fingerprint-verify   # Verify fingerprint
GET    /api/biometric/audit-log           # Compliance audit trail
```

---

## 🗄️ **DATABASE SCHEMA & PYTHON BACKEND INTEGRATION**

### **PostgreSQL Database Design:**

#### **Core Tables:**

```sql
-- User Management (replaces Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(15),
  role VARCHAR(30) CHECK (role IN ('admin', 'harvestflow_manager', 'flavorcore_manager', 'supervisor')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biometric Data (UIDAI Compliant)
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  face_template_encrypted TEXT,      -- AES-256-GCM encrypted face template
  fingerprint_template_encrypted TEXT, -- AES-256-GCM encrypted fingerprint
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_version VARCHAR(10) NOT NULL,
  audit_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance System
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL,
  total_hours DECIMAL(4,2),
  biometric_method VARCHAR(20) CHECK (biometric_method IN ('face', 'fingerprint')),
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HarvestFlow Tables
CREATE TABLE job_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  base_rate DECIMAL(8,2),
  unit VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_work_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  job_type_id UUID REFERENCES job_types(id),
  assigned_by UUID REFERENCES users(id),
  date DATE NOT NULL,
  quantity_target DECIMAL(10,2),
  quantity_actual DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE harvest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  crop_type VARCHAR(50),
  field_location VARCHAR(100),
  raw_weight DECIMAL(10,2),
  bags_count INTEGER,
  quality_grade VARCHAR(20),
  weather_conditions VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id VARCHAR(50) UNIQUE NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  total_raw_weight DECIMAL(10,2) DEFAULT 0,
  total_threshed_weight DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'harvesting',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE threshing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id VARCHAR(50) REFERENCES lots(lot_id),
  input_weight DECIMAL(10,2),
  output_weight DECIMAL(10,2),
  efficiency_percentage DECIMAL(5,2),
  operator_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wage Management
CREATE TABLE wage_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  period_start DATE,
  period_end DATE,
  total_hours DECIMAL(6,2),
  base_amount DECIMAL(10,2),
  bonus_amount DECIMAL(10,2),
  deductions DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'calculated',
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FlavorCore Tables
CREATE TABLE drying_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name VARCHAR(50) NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'idle',
  batch_id VARCHAR(50),
  operator_id UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(100) NOT NULL,
  batch_id VARCHAR(50) NOT NULL,
  lot_id VARCHAR(50) REFERENCES lots(lot_id),
  qr_code VARCHAR(100) UNIQUE,
  rfid_tag VARCHAR(50) UNIQUE,
  weight DECIMAL(10,2),
  quality_grade VARCHAR(20),
  packaging_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,2),
  location VARCHAR(100),
  status VARCHAR(30) DEFAULT 'in_stock',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rfid_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfid_tag VARCHAR(50),
  product_id UUID REFERENCES products(id),
  scan_type VARCHAR(10) CHECK (scan_type IN ('in', 'out')),
  scanned_by UUID REFERENCES users(id),
  location VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procurement & Approvals
CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES users(id),
  item_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2),
  estimated_cost DECIMAL(10,2),
  justification TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Verification
CREATE TABLE public_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  qr_code VARCHAR(100) UNIQUE,
  verification_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Configuration
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### **Database Indexes for Performance:**
```sql
-- Authentication & User Management
CREATE INDEX idx_users_staff_id ON users(staff_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Attendance System
CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- HarvestFlow Operations
CREATE INDEX idx_daily_work_user_date ON daily_work_assignments(user_id, date);
CREATE INDEX idx_harvest_logs_lot_id ON harvest_logs(lot_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_threshing_lot_id ON threshing_logs(lot_id);

-- Wage Management
CREATE INDEX idx_wages_user_period ON wage_calculations(user_id, period_start, period_end);
CREATE INDEX idx_wages_status ON wage_calculations(status);

-- FlavorCore Operations
CREATE INDEX idx_products_batch_id ON products(batch_id);
CREATE INDEX idx_products_qr_code ON products(qr_code);
CREATE INDEX idx_rfid_scans_tag ON rfid_scans(rfid_tag);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- UIDAI Compliance
CREATE INDEX idx_biometric_user ON biometric_data(user_id);
CREATE INDEX idx_biometric_consent ON biometric_data(consent_timestamp);

-- Audit & Compliance
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### **Frontend Deployment (Vercel):**
- **Platform**: Vercel
- **Domain**: https://relishagro.vercel.app
- **Project ID**: prj_JWi5X5hMzYntrjuA2jGt9spOwvje
- **GitHub Repo**: https://github.com/Morpheus61/relishagro.git
- **Auto-deployment**: Enabled for main branch
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### **Backend Deployment (Railway):**
- **Platform**: Railway
- **GitHub Repo**: https://github.com/Morpheus61/relishagro_backend.git
- **Framework**: Python FastAPI
- **Auto-deployment**: Connected to GitHub repo
- **Database**: PostgreSQL service on Railway

### **Environment Variables:**

#### **Frontend Variables (Vercel):**
```env
# Python Backend API
VITE_API_BASE_URL=https://relishagro-backend.railway.app

# PWA Configuration
VITE_APP_NAME=FlavorCore
VITE_APP_SHORT_NAME=FlavorCore
VITE_APP_DESCRIPTION=Agricultural Management System

# Legacy Supabase (for migration)
VITE_SUPABASE_URL=https://engzyfgdgqhuatymkshk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Backend Variables (Railway):**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/relishagro
POSTGRES_DB=relishagro
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# JWT & Security
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS & Security
FRONTEND_URLS=https://relishagro.vercel.app,http://localhost:5173
ALLOWED_HOSTS=relishagro-backend.railway.app,localhost

# UIDAI Compliance
BIOMETRIC_ENCRYPTION_KEY=your_aes_256_encryption_key
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years as per UIDAI guidelines

# API Configuration
API_V1_PREFIX=/api
DEBUG=False
LOG_LEVEL=INFO

# File Upload
MAX_FILE_SIZE_MB=10
UPLOAD_DIRECTORY=/app/uploads

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379/0
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

# Set environment variables
vercel env add VITE_API_BASE_URL production
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
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET_KEY=your_secret
railway variables set FRONTEND_URLS=https://relishagro.vercel.app
```

### **Docker Configuration (Backend):**
```dockerfile
# Dockerfile for Python FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔐 **SECURITY & UIDAI COMPLIANCE**

### **Biometric Data Protection (UIDAI Compliant):**
- **Encryption**: AES-256-GCM for biometric templates
- **Consent Management**: 5-point consent system implementation
- **Data Minimization**: Only necessary biometric data collected
- **Purpose Limitation**: Agricultural worker verification only
- **Audit Trail**: Comprehensive logging for all biometric operations
- **Retention Policy**: 7-year data retention as per UIDAI guidelines

### **Authentication Security:**
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permissions per user role
- **Password Security**: Secure password hashing (bcrypt)
- **Session Management**: Secure session handling and timeout
- **Multi-Factor**: Biometric + PIN verification

### **Data Security:**
- **HTTPS Only**: All communications encrypted in transit
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection**: Protection via parameterized queries
- **XSS Prevention**: Content Security Policy implementation
- **CORS**: Proper Cross-Origin Resource Sharing configuration

### **UIDAI Compliance Features:**
```typescript
// Consent Management System
interface UidaiConsent {
  consentId: string;
  userId: string;
  consentType: 'face_recognition' | 'fingerprint';
  consentVersion: string;
  consentTimestamp: Date;
  expiryDate: Date;
  withdrawalDate?: Date;
  auditTrail: ConsentAuditEntry[];
}

// Biometric Data Encryption
class BiometricEncryption {
  static encrypt(template: string): string {
    // AES-256-GCM encryption implementation
  }
  
  static decrypt(encryptedTemplate: string): string {
    // AES-256-GCM decryption implementation
  }
}

// Audit Logging
interface BiometricAuditLog {
  auditId: string;
  userId: string;
  action: 'register' | 'verify' | 'update' | 'delete';
  biometricType: 'face' | 'fingerprint';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorDetails?: string;
}
```

---

## 🧪 **TESTING & DEVELOPMENT**

### **Development Workflow:**
1. **Clone Repositories:**
   ```bash
   git clone https://github.com/Morpheus61/relishagro.git
   cd relishagro
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   # Configure environment variables
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

5. **Backend Setup (Separate Terminal):**
   ```bash
   git clone https://github.com/Morpheus61/relishagro_backend.git
   cd relishagro_backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   # Backend runs on http://localhost:8000
   ```

### **Testing Strategy:**
- **Unit Tests**: Component-level testing with Jest
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing with Playwright
- **Biometric Tests**: UIDAI compliance verification
- **Security Tests**: Authentication and authorization testing

### **Code Quality:**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for quality checks

### **Production Deployment:**
1. **Frontend**: Auto-deploys from GitHub to Vercel
2. **Backend**: Auto-deploys from GitHub to Railway
3. **Database**: PostgreSQL managed by Railway
4. **Monitoring**: Application performance monitoring
5. **Logs**: Centralized logging for debugging

---

## 📦 **DEPENDENCIES & VERSIONS**

### **Frontend Dependencies (package.json):**
```json
{
  "name": "relishagro-frontend",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.74.0",           // Legacy - being phased out
    "@tanstack/react-query": "^5.17.0",          // Data fetching and caching
    "axios": "^1.6.2",                           // HTTP client for API calls
    "clsx": "^2.0.0",                           // Conditional CSS classes
    "date-fns": "^3.0.0",                       // Date manipulation
    "face-api.js": "^0.22.2",                   // Face recognition ML models
    "idb": "^8.0.0",                           // IndexedDB wrapper for offline storage
    "lucide-react": "^0.294.0",                // Icon library
    "qrcode": "^1.5.3",                        // QR code generation
    "react": "^18.2.0",                        // React framework
    "react-dom": "^18.2.0",                    // React DOM rendering
    "react-router-dom": "^6.20.0",             // Client-side routing
    "tailwind-merge": "^2.2.0"                 // Tailwind CSS utility merging
  },
  "devDependencies": {
    "@types/react": "^18.2.43",                // React TypeScript types
    "@types/react-dom": "^18.2.17",            // React DOM TypeScript types
    "@typescript-eslint/eslint-plugin": "^6.14.0",  // TypeScript ESLint plugin
    "@typescript-eslint/parser": "^6.14.0",         // TypeScript ESLint parser
    "@vitejs/plugin-react": "^4.2.1",               // Vite React plugin
    "autoprefixer": "^10.4.16",                     // CSS autoprefixer
    "eslint": "^8.55.0",                           // Code quality linting
    "eslint-plugin-react-hooks": "^4.6.0",         // React hooks linting
    "eslint-plugin-react-refresh": "^0.4.5",       // React refresh linting
    "postcss": "^8.4.32",                          // CSS processing
    "tailwindcss": "^3.3.6",                       // Utility-first CSS framework
    "typescript": "^5.2.2",                        // TypeScript compiler
    "vite": "^5.0.8",                             // Build tool and dev server
    "vite-plugin-pwa": "^0.17.4",                 // PWA plugin for Vite
    "workbox-window": "^7.0.0"                    // Service worker management
  }
}
```

### **Backend Dependencies (requirements.txt):**
```txt
fastapi==0.104.1                   # Modern Python web framework
uvicorn[standard]==0.24.0          # ASGI server
sqlalchemy==2.0.23                 # ORM for database operations
psycopg2-binary==2.9.9             # PostgreSQL adapter
alembic==1.12.1                    # Database migration tool
python-jose[cryptography]==3.3.0   # JWT token handling
passlib[bcrypt]==1.7.4              # Password hashing
python-multipart==0.0.6            # File upload support
aiofiles==23.2.1                   # Async file operations
python-dotenv==1.0.0               # Environment variable management
pydantic==2.5.0                    # Data validation and serialization
redis==5.0.1                       # Caching and session management
celery==5.3.4                      # Background task processing
pillow==10.1.0                     # Image processing
cryptography==41.0.7               # Encryption for biometric data
```

### **Key Technology Choices:**

#### **Frontend Architecture:**
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS for rapid development
- **PWA Support**: Offline-first experience with service workers

#### **Backend Architecture:**
- **FastAPI**: High-performance async Python framework
- **SQLAlchemy**: Robust ORM with async support
- **PostgreSQL**: Enterprise-grade relational database
- **JWT Authentication**: Stateless authentication mechanism
- **Redis**: High-performance caching and session storage

#### **Security & Compliance:**
- **UIDAI Compliance**: Biometric data protection standards
- **AES-256-GCM**: Military-grade encryption for sensitive data
- **bcrypt**: Secure password hashing
- **HTTPS**: Encrypted communication
- **CORS**: Secure cross-origin resource sharing

---

## 🚨 **TROUBLESHOOTING & COMMON ISSUES**

### **Build & Development Issues:**

#### **TypeScript Compilation Errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev

# Check TypeScript configuration
npx tsc --noEmit
```

#### **Vite Build Failures:**
```bash
# Clear Vite cache and rebuild
rm -rf dist node_modules/.vite
npm install
npm run build
```

#### **PWA Service Worker Issues:**
```bash
# Clear browser cache and service workers
# In Chrome DevTools: Application → Storage → Clear storage
# Force refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

### **Backend Connection Issues:**

#### **API Connection Failures:**
- Verify `VITE_API_BASE_URL` in environment variables
- Check backend server status on Railway
- Ensure CORS is properly configured in backend
- Verify authentication tokens are valid

#### **Database Connection Issues:**
```bash
# Check PostgreSQL connection
# Verify DATABASE_URL in Railway environment
# Check database logs in Railway dashboard
```

### **Authentication & Authorization:**

#### **Login Failures:**
- Check staff ID format and database records
- Verify JWT secret configuration
- Ensure user roles are correctly assigned
- Check biometric consent status

#### **Role-Based Access Issues:**
- Verify user role in database
- Check `App.tsx` role routing logic
- Ensure dashboard components handle roles correctly

### **Biometric System Issues:**

#### **Camera Access Denied:**
```typescript
// Check browser permissions
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log(result.state));

// Request camera permission
navigator.mediaDevices.getUserMedia({ video: true })
  .catch(error => console.error('Camera error:', error));
```

#### **Face Recognition Failures:**
- Ensure adequate lighting conditions
- Check face-api.js model loading
- Verify consent status in database
- Check UIDAI compliance logs

### **PWA Installation Issues:**

#### **App Not Installing:**
- Verify manifest.json is accessible
- Check service worker registration
- Ensure HTTPS is enabled in production
- Verify icon files are present

#### **Offline Functionality:**
- Check service worker status in DevTools
- Verify offline data sync configuration
- Check IndexedDB storage quota

### **Performance Issues:**

#### **Slow Loading:**
- Check bundle size analysis: `npm run build -- --analyze`
- Optimize images and assets
- Enable caching in service worker
- Use lazy loading for components

#### **Database Query Performance:**
- Check database indexes
- Monitor query execution times
- Use database connection pooling
- Implement query result caching

### **Deployment Issues:**

#### **Vercel Deployment Failures:**
```bash
# Check build logs in Vercel dashboard
# Verify environment variables
# Check for memory/timeout issues
vercel logs --follow
```

#### **Railway Backend Issues:**
```bash
# Check application logs
railway logs --follow

# Verify environment variables
railway variables

# Check service status
railway status
```

### **Development Environment Setup:**

#### **Windows-Specific Issues:**
```powershell
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Node.js version management
nvm install 18.17.0
nvm use 18.17.0
```

#### **VS Code Configuration:**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

---

## 📋 **PROJECT STATUS & ROADMAP**

### **Current Implementation Status:**

#### **✅ COMPLETED FEATURES:**
- **Authentication System**: Role-based login with proper routing ✅
- **Admin Dashboard**: Complete administrative control panel (671 lines) ✅
- **HarvestFlow Dashboard**: Farm operations management (719 lines, 8 sections) ✅
- **PWA Implementation**: Service worker, manifest, offline capabilities ✅
- **Biometric System**: Face recognition with UIDAI compliance ✅
- **Database Architecture**: Comprehensive PostgreSQL schema design ✅
- **API Integration**: Python FastAPI backend integration layer ✅
- **UI Components**: Complete component library with Tailwind CSS ✅

#### **🔄 IN PROGRESS:**
- **Backend Transition**: Moving from Supabase to Python FastAPI ⚡
- **FlavorCore Dashboard**: Processing operations (component exists, needs backend) 🔧
- **Supervisor Dashboard**: Quality oversight (component exists, needs backend) 🔧
- **Public Verification**: QR code product verification system 🔧

#### **⏳ PLANNED FEATURES:**
- **Advanced Analytics**: Comprehensive reporting and insights
- **Mobile App**: React Native version for enhanced mobile experience
- **IoT Integration**: Sensor data collection and monitoring
- **Machine Learning**: Predictive analytics for crop yield and quality
- **Blockchain**: Supply chain traceability and transparency

### **Technical Debt & Improvements:**
- **Supabase Migration**: Complete transition to Python backend
- **Test Coverage**: Implement comprehensive testing suite
- **Performance**: Optimize bundle size and loading times
- **Accessibility**: WCAG 2.1 compliance improvements
- **Documentation**: API documentation with OpenAPI/Swagger

### **Compliance & Security Roadmap:**
- **UIDAI Certification**: Official certification for biometric compliance
- **ISO 27001**: Information security management system
- **GDPR Compliance**: Data protection for international users
- **Audit Trail**: Enhanced logging and monitoring capabilities

---

## 🤝 **CONTRIBUTING & TEAM**

### **Development Team:**
- **Project Lead**: Morpheus61
- **Repository**: https://github.com/Morpheus61/relishagro.git
- **Backend**: https://github.com/Morpheus61/relishagro_backend.git

### **Contributing Guidelines:**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards:**
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configuration rules
- **Prettier**: Code formatting consistency
- **Conventional Commits**: Semantic commit messages
- **Testing**: Write tests for new features

### **Documentation Requirements:**
- **Component Documentation**: JSDoc comments for all components
- **API Documentation**: OpenAPI/Swagger specifications
- **User Guide**: End-user documentation
- **Development Guide**: Setup and contribution instructions

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation:**
- **Main Documentation**: This comprehensive guide
- **UIDAI Compliance**: `BIOMETRIC_COMPLIANCE.md` (758 lines)
- **Workflow Assessment**: `WORKFLOW_ASSESSMENT.md` (361 lines)
- **Development Guidelines**: `src/guidelines/Guidelines.md`

### **Support Channels:**
- **GitHub Issues**: [Frontend](https://github.com/Morpheus61/relishagro/issues) | [Backend](https://github.com/Morpheus61/relishagro_backend/issues)
- **Project Email**: support@relishagro.com
- **Developer Contact**: morpheus61@github.com

### **External Resources:**
- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app
- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **React Documentation**: https://react.dev
- **UIDAI Guidelines**: https://uidai.gov.in

---

## 📄 **LICENSE & LEGAL**

### **License:**
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Third-Party Licenses:**
- **React**: MIT License
- **FastAPI**: MIT License
- **PostgreSQL**: PostgreSQL License
- **Tailwind CSS**: MIT License
- **Lucide Icons**: ISC License

### **Compliance:**
- **UIDAI Guidelines**: Full compliance for biometric data handling
- **Data Protection**: GDPR-ready data processing mechanisms
- **Agricultural Standards**: Compliance with relevant agricultural regulations

---

**Last Updated:** October 30, 2025  
**Version:** 2.0.0  
**Status:** Production Ready (Frontend), Backend Integration In Progress