interface FingerprintScannerConfig {
  vendorId: number;
  productId: number;
  baudRate: number;
  timeout: number;
}

const SUPPORTED_SCANNERS: FingerprintScannerConfig[] = [
  { vendorId: 0x04d8, productId: 0xf372, baudRate: 9600, timeout: 5000 }, // MFS110
  { vendorId: 0x10c4, productId: 0xea60, baudRate: 9600, timeout: 5000 }  // MARC11 L1
];

export class SecureFingerprintScanner {
  private port: SerialPort | null = null;
  private encryptionKey: CryptoKey | null = null;

  async connect(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        console.error('Web Serial API is not supported in this browser');
        return false;
      }

      const selectedPort = await (navigator as any).serial.requestPort({
        filters: SUPPORTED_SCANNERS
      });

      this.port = selectedPort;
      
      // ✅ FIX 1: Add null check before calling methods
      if (!this.port) {
        console.error('Failed to get serial port');
        return false;
      }
      
      await this.port.open({ baudRate: 9600 });
      await this.initializeEncryption();

      return true;
    } catch (error) {
      console.error('Failed to connect to fingerprint scanner:', error);
      return false;
    }
  }

  async captureAndEncryptTemplate(): Promise<string | null> {
    if (!this.port || !this.encryptionKey) {
      console.error('Scanner not initialized');
      return null;
    }

    try {
      const template = await this.captureTemplate();
      if (!template || template.length === 0) return null;

      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // ✅ FIX 2: Convert Uint8Array to ArrayBuffer correctly
      const templateArrayBuffer = new ArrayBuffer(template.length);
      const templateView = new Uint8Array(templateArrayBuffer);
      templateView.set(template);
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        templateArrayBuffer // ✅ Now it's definitely ArrayBuffer
      );

      const encryptedBytes = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedBytes.length);
      combined.set(iv);
      combined.set(encryptedBytes, iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Fingerprint capture/encryption failed:', error);
      return null;
    }
  }

  private async initializeEncryption(): Promise<void> {
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async captureTemplate(): Promise<Uint8Array | null> {
    if (!this.port || !this.port.readable || !this.port.writable) {
      console.warn('Port not available for reading/writing');
      return null;
    }

    const writer = this.port.writable.getWriter();
    const reader = this.port.readable.getReader();

    try {
      const encoder = new TextEncoder();
      await writer.write(encoder.encode('CAPTURE\n'));

      const { value, done } = await reader.read();
      if (done || !value) return null;

      // ✅ FIX 3: Proper type handling without .buffer
      if (value instanceof Uint8Array) {
        return value;
      }
      
      // Convert any other format to Uint8Array
      if (typeof value === 'string') {
        return new TextEncoder().encode(value);
      }
      
      // For other types, create empty array (fallback)
      console.warn('Unexpected value type from scanner:', typeof value);
      return new Uint8Array(0);
      
    } catch (err) {
      console.error('Error reading fingerprint data:', err);
      return null;
    } finally {
      writer.releaseLock();
      reader.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    if (this.port) {
      try {
        if (this.port.readable) {
          await this.port.close();
        }
      } catch (err) {
        console.error('Error closing port:', err);
      } finally {
        this.port = null;
        this.encryptionKey = null;
      }
    }
  }

  // ✅ Utility method for checking connection status
  isConnected(): boolean {
    return this.port !== null;
  }
}

// ✅ Export utility function
export async function isFingerprintScannerSupported(): Promise<boolean> {
  return 'serial' in navigator;
}