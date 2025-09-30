# 🛡️ **BIOMETRIC & UIDAI COMPLIANCE DOCUMENTATION**

## 📋 **OVERVIEW**

RelishAgro FlavorCore implements comprehensive biometric authentication and UIDAI compliance features for secure agricultural worker management. This document details the face recognition, fingerprint scanning, and regulatory compliance implementations.

---

## 🔐 **UIDAI COMPLIANCE FRAMEWORK**

### **Regulatory Requirements:**
- **UIDAI (Unique Identification Authority of India)** regulations compliance
- **Data Protection Act** adherence for biometric data
- **Purpose limitation** for agricultural worker verification only
- **Consent management** with explicit user permissions
- **Audit trail** maintenance for all biometric operations

### **Legal Compliance Features:**
- ✅ **Explicit Consent Management** (5-point consent system)
- ✅ **Data Minimization** (only necessary data collected)
- ✅ **Purpose Limitation** (agricultural use only)
- ✅ **Secure Storage** (AES-256-GCM encryption)
- ✅ **Audit Logging** (comprehensive activity tracking)
- ✅ **Consent Withdrawal** (user rights management)

---

## 📸 **FACE RECOGNITION SYSTEM**

### **Implementation Overview:**
- **Camera Integration**: Real-time face capture using WebRTC
- **Image Processing**: Canvas-based photo capture and processing
- **Storage Format**: Base64 encoded JPEG images
- **Security**: Client-side processing with secure transmission

### **Technical Specifications:**

#### **Camera Configuration:**
```typescript
interface CameraConfig {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user' | 'environment'  // Front/Back camera switching
  }
}
```

#### **Face Capture API:**
```typescript
interface FaceCaptureAPI {
  // Start camera with specified facing mode
  startCamera(facing: 'user' | 'environment'): Promise<void>
  
  // Capture photo from video stream
  capturePhoto(): string  // Returns base64 image data
  
  // Switch between front/back cameras
  switchCamera(): void
  
  // Stop camera and cleanup resources
  stopCamera(): void
}
```

#### **Image Data Format:**
```typescript
interface CapturedImage {
  id: string;                    // Unique image identifier
  workerId: string;             // Associated worker ID (hashed)
  imageData: string;            // Base64 encoded JPEG
  timestamp: string;            // ISO 8601 timestamp
  captureMethod: 'webcam';      // Capture method
  resolution: {
    width: number;
    height: number;
  };
  consentTimestamp: string;     // UIDAI consent timestamp
  auditId: string;             // Audit trail identifier
}
```

#### **Face Recognition Database Schema:**
```sql
-- Face Images Table
CREATE TABLE face_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id_hash VARCHAR(64) NOT NULL,  -- SHA-256 hashed worker ID
  image_data_encrypted TEXT NOT NULL,   -- AES-256-GCM encrypted base64 image
  image_hash VARCHAR(64) NOT NULL,      -- SHA-256 hash of original image
  capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  audit_id VARCHAR(100) NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_face_images_worker_hash ON face_images(worker_id_hash);
CREATE INDEX idx_face_images_consent ON face_images(consent_timestamp);
CREATE INDEX idx_face_images_audit ON face_images(audit_id);
```

#### **Face Capture Integration:**
```typescript
// Frontend Implementation
export class FaceCaptureService {
  private videoRef: HTMLVideoElement;
  private canvasRef: HTMLCanvasElement;
  private stream: MediaStream | null = null;

  async startCamera(facingMode: 'user' | 'environment' = 'user'): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode
        }
      });
      
      if (this.videoRef) {
        this.videoRef.srcObject = this.stream;
      }
    } catch (error) {
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }

  capturePhoto(): string {
    if (!this.videoRef || !this.canvasRef) {
      throw new Error('Camera not initialized');
    }

    const context = this.canvasRef.getContext('2d');
    this.canvasRef.width = this.videoRef.videoWidth;
    this.canvasRef.height = this.videoRef.videoHeight;

    // Apply mirror effect for front camera
    if (this.facingMode === 'user') {
      context.scale(-1, 1);
      context.drawImage(this.videoRef, -this.canvasRef.width, 0);
    } else {
      context.drawImage(this.videoRef, 0, 0);
    }

    return this.canvasRef.toDataURL('image/jpeg', 0.8);
  }
}
```

#### **Backend API Endpoints:**

```typescript
// POST /api/biometric/face/register
interface FaceRegistrationRequest {
  workerIdHash: string;        // SHA-256 hashed worker ID
  imageData: string;           // Base64 encoded image
  consentTimestamp: string;    // UIDAI consent timestamp
  auditId: string;            // Audit trail ID
  deviceInfo: object;         // Device information for audit
}

interface FaceRegistrationResponse {
  success: boolean;
  faceId?: string;            // Generated face ID
  message?: string;
  auditTrail?: AuditRecord;
}

// POST /api/biometric/face/verify
interface FaceVerificationRequest {
  workerIdHash: string;
  imageData: string;          // Base64 image for verification
  auditId: string;
}

interface FaceVerificationResponse {
  success: boolean;
  confidence?: number;        // Match confidence (0-100)
  verified: boolean;
  message?: string;
}
```

---

## 👆 **FINGERPRINT SCANNING SYSTEM**

### **Hardware Integration:**
- **Supported Devices**: MFS110, MARC11 L1, compatible USB fingerprint scanners
- **Communication**: Web Serial API for direct hardware access
- **Template Format**: ISO 19794-2 compliant minutiae templates

### **Technical Specifications:**

#### **Fingerprint Scanner Configuration:**
```typescript
interface FingerprintScannerConfig {
  vendorId: number;           // USB vendor ID
  productId: number;          // USB product ID
  baudRate: number;           // Serial communication baud rate (typically 9600)
  timeout: number;            // Communication timeout in ms
}

// Supported Devices
const SUPPORTED_SCANNERS: FingerprintScannerConfig[] = [
  { vendorId: 0x04d8, productId: 0xf372, baudRate: 9600, timeout: 5000 }, // MFS110
  { vendorId: 0x10c4, productId: 0xea60, baudRate: 9600, timeout: 5000 }  // MARC11 L1
];
```

#### **Fingerprint Data Format:**
```typescript
interface FingerprintTemplate {
  id: string;                 // Unique template identifier
  workerId: string;          // Associated worker ID (hashed)
  templateData: Uint8Array;   // Raw biometric template
  templateHash: string;       // SHA-256 hash of template
  quality: number;           // Template quality score (0-100)
  captureTimestamp: string;   // ISO 8601 timestamp
  deviceInfo: {
    manufacturer: string;
    model: string;
    serialNumber?: string;
  };
  encryptionKey: string;     // AES-256-GCM encryption key reference
  consentTimestamp: string;   // UIDAI consent timestamp
  auditId: string;           // Audit trail identifier
}
```

#### **Fingerprint Database Schema:**
```sql
-- Fingerprint Templates Table
CREATE TABLE fingerprint_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id_hash VARCHAR(64) NOT NULL,        -- SHA-256 hashed worker ID
  template_encrypted BYTEA NOT NULL,          -- AES-256-GCM encrypted template
  template_hash VARCHAR(64) NOT NULL,         -- SHA-256 hash of original template
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  device_manufacturer VARCHAR(100),
  device_model VARCHAR(100),
  device_serial VARCHAR(100),
  capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  audit_id VARCHAR(100) NOT NULL,
  encryption_key_id VARCHAR(100) NOT NULL,    -- Reference to encryption key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance and security
CREATE INDEX idx_fingerprint_worker_hash ON fingerprint_templates(worker_id_hash);
CREATE INDEX idx_fingerprint_consent ON fingerprint_templates(consent_timestamp);
CREATE INDEX idx_fingerprint_audit ON fingerprint_templates(audit_id);
CREATE UNIQUE INDEX idx_fingerprint_worker_unique ON fingerprint_templates(worker_id_hash);
```

#### **Fingerprint Scanner Implementation:**
```typescript
export class SecureFingerprintScanner {
  private port: SerialPort | null = null;
  private encryptionKey: CryptoKey | null = null;

  async connect(): Promise<boolean> {
    try {
      // Request serial port access
      this.port = await navigator.serial.requestPort({
        filters: SUPPORTED_SCANNERS.map(scanner => ({
          usbVendorId: scanner.vendorId,
          usbProductId: scanner.productId
        }))
      });

      // Open connection
      await this.port.open({ baudRate: 9600 });
      
      // Initialize encryption
      await this.initializeEncryption();
      
      return true;
    } catch (error) {
      console.error('Fingerprint scanner connection failed:', error);
      return false;
    }
  }

  async captureAndEncryptTemplate(): Promise<string | null> {
    if (!this.port || !this.encryptionKey) {
      throw new Error('Scanner not properly initialized');
    }

    try {
      // Send capture command to scanner
      const template = await this.captureTemplate();
      if (!template) return null;

      // Encrypt template using AES-256-GCM
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        template
      );

      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encrypted);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Fingerprint capture/encryption failed:', error);
      return null;
    }
  }

  private async initializeEncryption(): Promise<void> {
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async captureTemplate(): Promise<Uint8Array | null> {
    // Implementation depends on specific scanner protocol
    // This is a simplified example
    const writer = this.port!.writable.getWriter();
    const reader = this.port!.readable.getReader();
    
    try {
      // Send capture command (specific to scanner model)
      await writer.write(new TextEncoder().encode('CAPTURE_TEMPLATE\n'));
      
      // Read response
      const { value } = await reader.read();
      return value;
    } finally {
      writer.releaseLock();
      reader.releaseLock();
    }
  }
}
```

#### **Backend API Endpoints:**

```typescript
// POST /api/biometric/fingerprint/register
interface FingerprintRegistrationRequest {
  workerIdHash: string;           // SHA-256 hashed worker ID
  encryptedTemplate: string;      // Base64 encoded encrypted template
  qualityScore: number;           // Template quality (0-100)
  deviceInfo: {
    manufacturer: string;
    model: string;
    serialNumber?: string;
  };
  consentTimestamp: string;       // UIDAI consent timestamp
  auditId: string;               // Audit trail ID
}

interface FingerprintRegistrationResponse {
  success: boolean;
  templateId?: string;           // Generated template ID
  message?: string;
  auditTrail?: AuditRecord;
}

// POST /api/biometric/fingerprint/verify
interface FingerprintVerificationRequest {
  workerIdHash: string;
  encryptedTemplate: string;     // Template to verify against
  auditId: string;
}

interface FingerprintVerificationResponse {
  success: boolean;
  verified: boolean;
  confidence?: number;           // Match confidence score
  message?: string;
}
```

---

## 🛡️ **UIDAI COMPLIANCE IMPLEMENTATION**

### **Consent Management System:**

#### **Consent Data Structure:**
```typescript
interface UidaiConsent {
  dataProcessing: boolean;       // Consent for Aadhaar data processing
  biometricCapture: boolean;     // Consent for biometric data capture
  storageConsent: boolean;       // Consent for secure data storage
  purposeAgreed: boolean;        // Agreement to purpose limitation
  auditTrail: boolean;          // Consent for audit logging
}

interface ConsentRecord {
  id: string;
  workerId: string;             // Hashed worker ID
  consent: UidaiConsent;
  timestamp: string;            // ISO 8601 consent timestamp
  ipAddress: string;            // Client IP for audit
  deviceInfo: string;           // Device information
  withdrawalDate?: string;      // If consent withdrawn
  legalBasis: 'consent' | 'legitimate_interest';
}
```

#### **Consent Database Schema:**
```sql
-- UIDAI Consent Records
CREATE TABLE uidai_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id_hash VARCHAR(64) NOT NULL,
  data_processing_consent BOOLEAN NOT NULL,
  biometric_capture_consent BOOLEAN NOT NULL,
  storage_consent BOOLEAN NOT NULL,
  purpose_agreed BOOLEAN NOT NULL,
  audit_trail_consent BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  device_info JSONB,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  legal_basis VARCHAR(50) NOT NULL DEFAULT 'consent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for compliance queries
CREATE INDEX idx_consent_worker_hash ON uidai_consent_records(worker_id_hash);
CREATE INDEX idx_consent_timestamp ON uidai_consent_records(consent_timestamp);
CREATE INDEX idx_consent_withdrawal ON uidai_consent_records(withdrawal_date);
```

### **Audit Trail System:**

#### **Audit Record Structure:**
```typescript
interface AuditRecord {
  id: string;                   // Unique audit record ID
  timestamp: string;            // ISO 8601 timestamp
  action: AuditAction;          // Type of action performed
  userId: string;               // Masked user ID (XXXX-XXXX-1234)
  deviceInfo: string;           // Device fingerprint
  ipAddress: string;            // Client IP address
  sessionId: string;            // Session identifier
  dataAccessed: string[];       // Types of data accessed
  consentStatus: UidaiConsent;  // Consent status at time of action
  result: 'success' | 'failure' | 'partial';
  errorMessage?: string;        // If action failed
  dataChanges?: object;         // What data was modified
}

enum AuditAction {
  CONSENT_GIVEN = 'consent_given',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  AADHAAR_ENTERED = 'aadhaar_entered',
  AADHAAR_VERIFIED = 'aadhaar_verified',
  FACE_CAPTURED = 'face_captured',
  FINGERPRINT_CAPTURED = 'fingerprint_captured',
  BIOMETRIC_VERIFIED = 'biometric_verified',
  DATA_ACCESSED = 'data_accessed',
  DATA_EXPORTED = 'data_exported',
  DATA_DELETED = 'data_deleted'
}
```

#### **Audit Database Schema:**
```sql
-- Comprehensive Audit Trail
CREATE TABLE uidai_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  action VARCHAR(50) NOT NULL,
  user_id_masked VARCHAR(20),              -- Masked Aadhaar (XXXX-XXXX-1234)
  device_info JSONB,
  ip_address INET,
  session_id VARCHAR(100),
  data_accessed TEXT[],
  consent_status JSONB,
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure', 'partial')),
  error_message TEXT,
  data_changes JSONB,
  retention_date DATE,                     -- Auto-deletion date (180 days)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit queries and compliance reports
CREATE INDEX idx_audit_timestamp ON uidai_audit_trail(timestamp);
CREATE INDEX idx_audit_action ON uidai_audit_trail(action);
CREATE INDEX idx_audit_user_masked ON uidai_audit_trail(user_id_masked);
CREATE INDEX idx_audit_retention ON uidai_audit_trail(retention_date);
```

### **Data Security Implementation:**

#### **Encryption Standards:**
```typescript
// AES-256-GCM Encryption for Biometric Data
export class BiometricEncryption {
  static async encryptBiometricData(data: Uint8Array): Promise<string> {
    // Generate unique encryption key for each record
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  static async hashSensitiveData(data: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataToHash = encoder.encode(data + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
```

---

## 🔌 **API INTEGRATION SPECIFICATIONS**

### **Authentication Headers:**
```typescript
interface ApiHeaders {
  'Content-Type': 'application/json';
  'Authorization': `Bearer ${jwtToken}`;
  'X-Audit-ID': string;              // Unique audit identifier
  'X-Consent-Timestamp': string;     // UIDAI consent timestamp
  'X-Device-Fingerprint': string;    // Device identification
}
```

### **Error Response Format:**
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;                    // Error code (UIDAI_001, etc.)
    message: string;                 // Human-readable error message
    details?: object;                // Additional error details
    auditId: string;                // Associated audit record ID
    timestamp: string;               // Error timestamp
  };
  complianceInfo?: {
    dataRetentionDays: number;       // Data retention period
    withdrawalProcess: string;       // How to withdraw consent
    contactInfo: string;             // Data protection officer contact
  };
}
```

### **Rate Limiting:**
```typescript
interface RateLimitConfig {
  biometricCapture: {
    maxAttempts: 5;                  // Max capture attempts per hour
    windowMs: 3600000;               // 1 hour window
  };
  verification: {
    maxAttempts: 10;                 // Max verification attempts per hour
    windowMs: 3600000;
  };
  auditAccess: {
    maxRequests: 100;                // Max audit queries per hour
    windowMs: 3600000;
  };
}
```

---

## 📊 **COMPLIANCE MONITORING & REPORTING**

### **Compliance Metrics:**
```typescript
interface ComplianceMetrics {
  consentRate: number;               // Percentage of users with valid consent
  dataRetention: {
    totalRecords: number;
    expiredRecords: number;          // Records past retention period
    scheduledDeletion: number;       // Records scheduled for deletion
  };
  auditCoverage: {
    totalActions: number;
    auditedActions: number;          // Actions with audit records
    coveragePercentage: number;
  };
  securityMetrics: {
    encryptedRecords: number;        // Biometric records encrypted
    hashingCompliance: number;       // Aadhaar records properly hashed
    accessViolations: number;        // Unauthorized access attempts
  };
}
```

### **Compliance Report API:**
```typescript
// GET /api/compliance/report
interface ComplianceReportRequest {
  startDate: string;                 // ISO 8601 date
  endDate: string;
  includeMetrics: boolean;
  includeSummary: boolean;
  format: 'json' | 'pdf';
}

interface ComplianceReportResponse {
  reportId: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: ComplianceMetrics;
  summary: {
    totalWorkers: number;
    consentedWorkers: number;
    biometricRecords: number;
    auditRecords: number;
  };
  recommendations?: string[];        // Compliance improvement suggestions
}
```

---

## 🚨 **DATA RETENTION & DELETION**

### **Automated Data Lifecycle:**
```sql
-- Automated data retention function
CREATE OR REPLACE FUNCTION cleanup_expired_biometric_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  retention_date DATE := CURRENT_DATE - INTERVAL '180 days';
BEGIN
  -- Delete expired face images
  DELETE FROM face_images 
  WHERE created_at < retention_date 
  AND consent_timestamp < retention_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete expired fingerprint templates
  DELETE FROM fingerprint_templates 
  WHERE created_at < retention_date 
  AND consent_timestamp < retention_date;
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  -- Delete expired audit records (7 years retention)
  DELETE FROM uidai_audit_trail 
  WHERE timestamp < CURRENT_DATE - INTERVAL '7 years';
  
  -- Log cleanup operation
  INSERT INTO uidai_audit_trail (
    action, result, data_changes
  ) VALUES (
    'DATA_CLEANUP', 'success', 
    jsonb_build_object('deleted_records', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
SELECT cron.schedule('biometric-cleanup', '0 2 * * *', 'SELECT cleanup_expired_biometric_data()');
```

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **Frontend Implementation:**
- ✅ **Real camera integration** with front/back switching
- ✅ **Fingerprint scanner** Web Serial API integration
- ✅ **5-point consent system** with explicit permissions
- ✅ **Client-side encryption** for biometric data
- ✅ **Audit logging** for all user actions
- ✅ **Error handling** with user-friendly messages

### **Backend Implementation:**
- ✅ **Secure API endpoints** with JWT authentication
- ✅ **Database encryption** for sensitive data
- ✅ **Audit trail storage** with comprehensive logging
- ✅ **Data retention policies** with automated cleanup
- ✅ **Compliance reporting** with metrics and analytics

### **Security Features:**
- ✅ **AES-256-GCM encryption** for biometric templates
- ✅ **SHA-256 hashing** for Aadhaar numbers
- ✅ **Input validation** and sanitization
- ✅ **Rate limiting** for API endpoints
- ✅ **HTTPS enforcement** for all communications

### **UIDAI Compliance:**
- ✅ **Explicit consent management** with withdrawal rights
- ✅ **Purpose limitation** enforcement
- ✅ **Data minimization** practices
- ✅ **Secure storage** with encryption
- ✅ **Audit trail** maintenance
- ✅ **User rights** implementation (access, deletion)

---

## 📞 **SUPPORT & CONTACT**

### **Data Protection Officer:**
- **Email**: dpo@relishagro.com
- **Phone**: +91-XXXX-XXXX-XXXX
- **Address**: FlavorCore Technologies, India

### **Technical Support:**
- **Email**: tech-support@relishagro.com
- **Documentation**: https://docs.relishagro.com/biometric
- **API Reference**: https://api.relishagro.com/docs

### **Compliance Inquiries:**
- **Email**: compliance@relishagro.com
- **Audit Requests**: audit@relishagro.com
- **Legal**: legal@relishagro.com

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Review Date**: December 30, 2025  
**Classification**: Internal Use - Compliance Documentation