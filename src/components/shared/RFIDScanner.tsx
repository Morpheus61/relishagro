import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { isNFCAvailable, startNFCScan, generateBagId } from '../../lib/nfcScanner';
import { Smartphone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface RFIDScannerProps {
  lotId: string;
  onScanComplete: (bagData: {
    tagId: string;
    bagId: string;
    weight?: number;
  }) => void;
  showWeightInput?: boolean;
}

export function RFIDScanner({ lotId, onScanComplete, showWeightInput = true }: RFIDScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [nfcSupported] = useState(isNFCAvailable());

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
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleComplete = () => {
    if (!scannedTag) return;
    
    if (showWeightInput && !weight) {
      setError('Please enter bag weight');
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

  if (!nfcSupported) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">NFC Not Supported</p>
            <p className="text-sm">Please use Android Chrome or Samsung Internet browser</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Smartphone size={24} className="text-purple-600" />
          <div>
            <h3 className="font-bold text-lg">RFID Bag Tagging</h3>
            <p className="text-sm text-gray-600">Tap your phone to an RFID tag</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {scannedTag && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Tag Scanned Successfully</p>
              <p className="text-xs font-mono">{scannedTag}</p>
            </div>
          </div>
        )}

        {showWeightInput && scannedTag && (
          <div>
            <label className="block text-sm font-medium mb-2">Bag Weight (kg):</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter weight"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          {!scannedTag ? (
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-purple-600 hover:bg-purple-700 h-14"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Scanning... Tap NFC Tag Now
                </>
              ) : (
                <>
                  <Smartphone className="mr-2" size={20} />
                  Scan RFID Tag
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 h-14"
              >
                <CheckCircle className="mr-2" size={20} />
                Confirm & Next
              </Button>
              <Button
                onClick={() => {
                  setScannedTag(null);
                  setWeight('');
                  setError(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 h-14"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Lot: <span className="font-mono font-semibold">{lotId}</span>
        </p>
      </div>
    </Card>
  );
}