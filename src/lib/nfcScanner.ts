/**
 * NFC/RFID Scanner Library
 * Uses Web NFC API for mobile phone-based RFID tag scanning
 * Compatible with Android Chrome, Samsung Internet
 */

interface NFCReading {
  serialNumber: string;
  tagId: string;
  timestamp: number;
  type: string;
}

// Check if NFC is available
export function isNFCAvailable(): boolean {
  if ('NDEFReader' in window) {
    return true;
  }
  return false;
}

// Request NFC permission and start scanning
export async function startNFCScan(): Promise<NFCReading> {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC is not supported on this device. Please use Android Chrome or Samsung Internet.');
  }

  try {
    const ndef = new (window as any).NDEFReader();
    
    // Request permission
    await ndef.scan();
    
    console.log('NFC scan started. Tap an RFID tag...');

    // Return a promise that resolves when a tag is scanned
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Scan timeout. Please try again.'));
      }, 30000); // 30 second timeout

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        clearTimeout(timeout);
        
        const reading: NFCReading = {
          serialNumber: serialNumber,
          tagId: serialNumber, // Use serial number as tag ID
          timestamp: Date.now(),
          type: 'nfc'
        };

        resolve(reading);
      });

      ndef.addEventListener('readingerror', () => {
        clearTimeout(timeout);
        reject(new Error('Failed to read NFC tag. Please try again.'));
      });
    });

  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('NFC permission denied. Please enable NFC in your browser settings.');
    }
    throw new Error(`NFC scan failed: ${error.message}`);
  }
}

// Write data to NFC tag (for initial tag programming)
export async function writeNFCTag(data: {
  lotId: string;
  bagNumber: number;
  weight: number;
  crop: string;
}): Promise<boolean> {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC is not supported on this device.');
  }

  try {
    const ndef = new (window as any).NDEFReader();
    
    // Create NDEF message
    const textRecord = {
      recordType: 'text',
      data: JSON.stringify(data)
    };

    await ndef.write({
      records: [textRecord]
    });

    console.log('NFC tag written successfully');
    return true;

  } catch (error: any) {
    throw new Error(`Failed to write NFC tag: ${error.message}`);
  }
}

// Read existing data from NFC tag
export async function readNFCTagData(): Promise<any> {
  const reading = await startNFCScan();
  
  // In a real implementation, you would parse the NDEF message
  // For now, we just return the serial number
  return {
    tagId: reading.tagId,
    serialNumber: reading.serialNumber
  };
}

// Generate a unique bag ID from RFID tag
export function generateBagId(tagId: string, lotId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const tagShort = tagId.slice(-8).toUpperCase();
  return `${lotId}-BAG-${tagShort}-${timestamp}`;
}

// Validate RFID tag format
export function validateRFIDTag(tagId: string): boolean {
  // RFID tags are typically 8-14 characters hexadecimal
  const rfidPattern = /^[0-9A-Fa-f]{8,14}$/;
  return rfidPattern.test(tagId);
}