import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Smartphone, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff, Package } from 'lucide-react';

interface RFIDScannerProps {
  lotId: string;
  onScanComplete: (bagData: {
    tagId: string;
    bagId: string;
    weight?: number;
  }) => void;
  showWeightInput?: boolean;
}

// NFC Detection and Scanning Functions
const isNFCAvailable = (): boolean => {
  // Check if Web NFC is supported (Production)
  if ('NDEFReader' in window) {
    return true;
  }
  
  // For development - always return true to enable mock scanning
  return true;
};

const startNFCScan = async (): Promise<{ tagId: string }> => {
  // Production NFC Scanning
  if ('NDEFReader' in window) {
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Scan timeout - no tag detected within 30 seconds'));
        }, 30000);

        ndef.addEventListener('reading', (event: any) => {
          clearTimeout(timeout);
          const tagId = event.serialNumber || `NFC-${Date.now().toString(36).toUpperCase()}`;
          resolve({ tagId });
        });

        ndef.addEventListener('readingerror', () => {
          clearTimeout(timeout);
          reject(new Error('Failed to read NFC tag'));
        });
      });
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('NFC permission denied. Please enable NFC in browser settings.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('NFC not supported on this device or browser');
      }
      throw error;
    }
  } 
  
  // Development Mock Scanning
  else {
    // Simulate realistic NFC scan delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Generate realistic mock tag ID
    const mockTagId = `MOCK-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(-3).toUpperCase()}`;
    return { tagId: mockTagId };
  }
};

const generateBagId = (tagId: string, lotId: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const tagSuffix = tagId.slice(-4);
  return `${lotId}-BAG-${tagSuffix}-${timestamp}`;
};

export function RFIDScanner({ lotId, onScanComplete, showWeightInput = true }: RFIDScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isDevelopment, setIsDevelopment] = useState<boolean>(false);

  // Check NFC support and environment on component mount
  useEffect(() => {
    const supported = isNFCAvailable();
    const isDev = !('NDEFReader' in window);
    
    setNfcSupported(supported);
    setIsDevelopment(isDev);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const reading = await startNFCScan();
      const bagId = generateBagId(reading.tagId, lotId);
      
      setScannedTag(reading.tagId);
      
      // If no weight input needed, complete immediately
      if (!showWeightInput) {
        onScanComplete({
          tagId: reading.tagId,
          bagId: bagId
        });
        
        // Reset for next scan
        setScannedTag(null);
      }
      
    } catch (err: any) {
      console.error('RFID scan error:', err);
      setError(err.message || 'Failed to scan RFID tag');
    } finally {
      setIsScanning(false);
    }
  };

  const handleComplete = () => {
    if (!scannedTag) return;
    
    if (showWeightInput && (!weight || parseFloat(weight) <= 0)) {
      setError('Please enter a valid bag weight');
      return;
    }
    
    const bagId = generateBagId(scannedTag, lotId);
    
    onScanComplete({
      tagId: scannedTag,
      bagId: bagId,
      weight: showWeightInput ? parseFloat(weight) : undefined
    });
    
    // Reset for next scan
    setScannedTag(null);
    setWeight('');
    setError(null);
  };

  const handleCancel = () => {
    setScannedTag(null);
    setWeight('');
    setError(null);
    setIsScanning(false);
  };

  // Device compatibility check
  if (!nfcSupported) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3 text-yellow-700">
          <AlertTriangle size={24} className="mt-1" />
          <div className="flex-1">
            <p className="font-semibold">NFC Not Available</p>
            <p className="text-sm mt-1">
              RFID scanning requires NFC support. Please use:
            </p>
            <ul className="text-sm mt-2 ml-4 space-y-1">
              <li>• Android Chrome browser</li>
              <li>• Samsung Internet browser</li>
              <li>• Device with NFC enabled</li>
            </ul>
            <div className="mt-3">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
                className="text-yellow-700 border-yellow-300"
              >
                Retry Detection
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Smartphone size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">RFID Bag Scanner</h3>
              <p className="text-sm text-gray-600">
                {isDevelopment ? 'Development Mode' : 'Hold phone near RFID tag'}
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <div title={isOnline ? 'Online' : 'Offline'}>
              {isOnline ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
            </div>
            <div title="Lot Active">
              <Package size={16} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Development Mode Indicator */}
        {isDevelopment && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Smartphone size={16} />
              <p className="text-sm">
                <strong>Development Mode:</strong> Mock RFID scanning enabled. 
                In production, this will use actual NFC hardware.
              </p>
            </div>
          </div>
        )}

        {/* Current Lot Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Active Lot</p>
              <p className="text-lg font-bold text-blue-900">{lotId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Ready for Scanning</p>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium">Scan Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Successful Scan Display */}
        {scannedTag && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Tag Scanned Successfully!</p>
              <p className="text-xs font-mono bg-green-100 px-2 py-1 rounded mt-1">
                {scannedTag}
              </p>
              <p className="text-xs mt-1">
                Bag ID: {generateBagId(scannedTag, lotId)}
              </p>
            </div>
          </div>
        )}

        {/* Weight Input */}
        {showWeightInput && scannedTag && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bag Weight (kg) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.0"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                kg
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Enter the weight of the scanned bag
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!scannedTag ? (
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-white font-semibold"
            >
              {isScanning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>
                    {isDevelopment ? 'Scanning...' : 'Scanning... Hold phone to tag'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Smartphone size={20} />
                  <span>Start RFID Scan</span>
                </div>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleComplete}
                disabled={showWeightInput && !weight}
                className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-white font-semibold"
              >
                <CheckCircle className="mr-2" size={20} />
                {showWeightInput ? 'Record Bag' : 'Confirm'}
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 h-14 text-white px-6"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* Scanning Instructions */}
        {isScanning && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone size={32} className="text-purple-600 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-purple-800">
                {isDevelopment 
                  ? 'Simulating RFID scan...' 
                  : 'Hold your phone close to the RFID tag'
                }
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {isDevelopment 
                  ? 'Mock scan will complete automatically' 
                  : 'Keep steady until scan completes...'
                }
              </p>
            </div>
          </div>
        )}

        {/* Quick Help */}
        {!isScanning && !scannedTag && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isDevelopment 
                ? '💡 Development: Mock scanning active for testing' 
                : '💡 Tip: Ensure NFC is enabled in device settings'
              }
            </p>
          </div>
        )}

        {/* Offline Warning */}
        {!isOnline && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <WifiOff size={16} />
              <p className="text-sm">
                Offline mode: Scans will sync when connection is restored
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}