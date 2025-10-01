// src/config/biometricConfig.ts

export interface FingerprintScannerConfig {
  vendorId: number;
  productId: number;
  baudRate: number;
  timeout: number;
}

export const SUPPORTED_SCANNERS: FingerprintScannerConfig[] = [
  { vendorId: 0x04d8, productId: 0xf372, baudRate: 9600, timeout: 5000 }, // MFS110
  { vendorId: 0x10c4, productId: 0xea60, baudRate: 9600, timeout: 5000 }  // MARC11 L1
];