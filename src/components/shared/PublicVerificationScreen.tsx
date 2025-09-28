// src/components/shared/PublicVerificationScreen.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft } from 'lucide-react';

interface PublicVerificationScreenProps {
  navigateToScreen: (screen: string) => void;
  user: string | null;
}

export function PublicVerificationScreen({ navigateToScreen }: PublicVerificationScreenProps) {
  const [lotId, setLotId] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVerificationData({
        lotId: 'LOT-CLOVES-20250405-123',
        crop: 'Cloves',
        harvestDate: '2025-04-05',
        rawWeight: 100,
        threshedWeight: 68,
        estateYieldPct: 68,
        dispatchDate: '2025-04-06',
        vehicleNumber: 'KA-01-HJ-2345',
        driverName: 'Ravi Kumar',
        driverMobile: '+919876543210',
        flavorCoreProcessing: {
          inScanWeight: 67.5,
          finalProducts: [
            { product: 'Cloves', grade: 'Grade A', weight: 42 },
            { product: 'Cloves', grade: 'Grade B', weight: 25 }
          ],
          byProducts: [
            { type: 'Dust', weight: 5 },
            { type: 'Sticks', weight: 12 }
          ],
          flavorCoreYieldPct: 88.2,
          totalYieldPct: 60,
          processedDate: '2025-04-07'
        }
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateToScreen('dashboard')}
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-lg">Public Verification</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Verify Lot */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Verify Product Journey</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Enter Lot ID</label>
              <input
                type="text"
                placeholder="LOT-CLOVES-20250405-123"
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button 
              onClick={handleVerify}
              disabled={!lotId || isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </Card>

        {verificationData && (
          <Card className="p-4">
            <h2 className="text-lg mb-4">Product Journey: {verificationData.lotId}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">Harvest</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div><span className="text-gray-600">Crop:</span> {verificationData.crop}</div>
                  <div><span className="text-gray-600">Harvest Date:</span> {verificationData.harvestDate}</div>
                  <div><span className="text-gray-600">Raw Weight:</span> {verificationData.rawWeight}kg</div>
                  <div><span className="text-gray-600">Threshed Weight:</span> {verificationData.threshedWeight}kg</div>
                  <div><span className="text-gray-600">Estate Yield:</span> {verificationData.estateYieldPct}%</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Dispatch</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div><span className="text-gray-600">Dispatch Date:</span> {verificationData.dispatchDate}</div>
                  <div><span className="text-gray-600">Vehicle:</span> {verificationData.vehicleNumber}</div>
                  <div><span className="text-gray-600">Driver:</span> {verificationData.driverName}</div>
                  <div><span className="text-gray-600">Contact:</span> {verificationData.driverMobile}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">FlavorCore Processing</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div><span className="text-gray-600">In-Scan Weight:</span> {verificationData.flavorCoreProcessing.inScanWeight}kg</div>
                  <div><span className="text-gray-600">Final Products:</span></div>
                  {verificationData.flavorCoreProcessing.finalProducts.map((product: any, index: number) => (
                    <div key={index} className="ml-4">
                      <span className="text-gray-600">{product.product} - Grade {product.grade}: </span>{product.weight}kg
                    </div>
                  ))}
                  <div><span className="text-gray-600">By-Products:</span></div>
                  {verificationData.flavorCoreProcessing.byProducts.map((byProduct: any, index: number) => (
                    <div key={index} className="ml-4">
                      <span className="text-gray-600">{byProduct.type}: </span>{byProduct.weight}kg
                    </div>
                  ))}
                  <div><span className="text-gray-600">FlavorCore Yield:</span> {verificationData.flavorCoreProcessing.flavorCoreYieldPct}%</div>
                  <div><span className="text-gray-600">Total Yield:</span> {verificationData.flavorCoreProcessing.totalYieldPct}%</div>
                  <div><span className="text-gray-600">Processed Date:</span> {verificationData.flavorCoreProcessing.processedDate}</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}