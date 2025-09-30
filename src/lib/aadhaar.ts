// src/lib/aadhaar.ts
export class AadhaarService {
  private static instance: AadhaarService;
  
  private constructor() {}

  public static getInstance(): AadhaarService {
    if (!AadhaarService.instance) {
      AadhaarService.instance = new AadhaarService();
    }
    return AadhaarService.instance;
  }

  async requestOtp(aadhaar: string, mobile: string): Promise<{ txn: string }> {
    const response = await fetch('/api/aadhaar/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar, mobile })
    });

    const data = await response.json();
    if (!data.txn) throw new Error('OTP request failed');
    return data;
  }

  async verifyOtp(aadhaar: string, otp: string, txn: string): Promise<{ status: 'verified' | 'queued' | 'failed' }> {
    const response = await fetch('/api/aadhaar/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar, otp, txn })
    });

    const data = await response.json();
    return data;
  }
}