import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Search, MapPin, Calendar, Weight, Award, Truck, Package, CheckCircle, Upload, Download } from 'lucide-react';

interface PublicVerificationScreenProps {
  navigateToScreen: (screen: string) => void;
  currentUser: {
    id: string;
    staff_id: string;
    full_name: string;
    role: string;
  } | null;
}

interface TraceabilityData {
  lotId: string;
  qrCode: string;
  productInfo: {
    name: string;
    grade: string;
    packSize: string;
    batchNumber: string;
    packingDate: string;
    expiryDate: string;
  };
  harvestInfo: {
    crop: string;
    harvestDate: string;
    farmLocation: string;
    rawWeight: number;
    threshedWeight: number;
    estateYield: number;
    harvestedBy: string;
  };
  transportInfo: {
    dispatchDate: string;
    vehicleNumber: string;
    driverName: string;
    driverMobile: string;
    dispatchWeight: number;
  };
  processingInfo: {
    receivedDate: string;
    inScanWeight: number;
    processedBy: string;
    qualityGrade: string;
    moistureLevel: number;
    finalProducts: Array<{
      product: string;
      grade: string;
      weight: number;
    }>;
    byProducts: Array<{
      type: string;
      weight: number;
    }>;
    yieldPercentage: number;
    overallYield: number;
    certifications: string[];
  };
}

interface LabelTemplate {
  id: string;
  name: string;
  size: string;
  preview: string;
  isActive: boolean;
}

export function PublicVerificationScreen({ navigateToScreen, currentUser }: PublicVerificationScreenProps) {
  const [lotId, setLotId] = useState('');
  const [verificationData, setVerificationData] = useState<TraceabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(currentUser?.role === 'admin');
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>([
    {
      id: 'default',
      name: 'Default FlavorCore Label',
      size: '6x4 inches',
      preview: '/label-templates/default-preview.png',
      isActive: true
    }
  ]);

  const handleVerify = async () => {
    if (!lotId.trim()) {
      alert('Please enter a Lot ID or QR Code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual verification endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock comprehensive traceability data
      const mockData: TraceabilityData = {
        lotId: 'LOT-CLOVES-20250405-123',
        qrCode: 'QR-CLOVES-20250405-123-PACK-001',
        productInfo: {
          name: 'Organic Premium Cloves',
          grade: 'Grade A',
          packSize: '250g',
          batchNumber: 'LOT-CLOVES-20250405-123-250405',
          packingDate: '2025-04-05',
          expiryDate: '2027-04-05'
        },
        harvestInfo: {
          crop: 'Cloves',
          harvestDate: '2025-04-03',
          farmLocation: 'Estate Block C, Sector 7, Kerala',
          rawWeight: 120,
          threshedWeight: 85,
          estateYield: 71,
          harvestedBy: 'Harvest Team Alpha'
        },
        transportInfo: {
          dispatchDate: '2025-04-04',
          vehicleNumber: 'KA-01-HJ-2345',
          driverName: 'Ravi Kumar',
          driverMobile: '+919876543210',
          dispatchWeight: 84.5
        },
        processingInfo: {
          receivedDate: '2025-04-04',
          inScanWeight: 84.2,
          processedBy: 'FlavorCore Processing Unit A',
          qualityGrade: 'Premium A',
          moistureLevel: 8.5,
          finalProducts: [
            { product: 'Whole Cloves - Grade A', grade: 'A', weight: 52 },
            { product: 'Broken Cloves - Grade B', grade: 'B', weight: 18 }
          ],
          byProducts: [
            { type: 'Clove Stems', weight: 8 },
            { type: 'Dust & Powder', weight: 6.2 }
          ],
          yieldPercentage: 83.1,
          overallYield: 58.3,
          certifications: ['Organic Certified', 'FSSAI Approved', 'Quality Tested']
        }
      };

      setVerificationData(mockData);
    } catch (error) {
      alert('Failed to verify product. Please check the Lot ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newTemplate: LabelTemplate = {
        id: `template-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        size: '6x4 inches',
        preview: e.target?.result as string,
        isActive: false
      };

      setLabelTemplates(prev => [...prev, newTemplate]);
    };
    reader.readAsDataURL(file);
  };

  const activateTemplate = (templateId: string) => {
    setLabelTemplates(prev => 
      prev.map(template => ({
        ...template,
        isActive: template.id === templateId
      }))
    );
  };

  const deleteTemplate = (templateId: string) => {
    if (templateId === 'default') {
      alert('Cannot delete the default template');
      return;
    }
    setLabelTemplates(prev => prev.filter(template => template.id !== templateId));
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
          <div className="flex-1">
            <h1 className="text-lg font-bold">Product Traceability Verification</h1>
            <p className="text-gray-300 text-sm">Scan QR code or enter Lot ID to verify product journey</p>
          </div>
          <Search className="text-gray-300" size={24} />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Admin Label Management */}
        {isAdmin && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-blue-800">Admin: Label Template Management</h3>
                <p className="text-sm text-blue-600">Manage QR label templates for product packaging</p>
              </div>
              <Button
                onClick={() => setShowLabelManager(!showLabelManager)}
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                {showLabelManager ? 'Hide' : 'Manage'} Templates
              </Button>
            </div>
            
            {showLabelManager && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-800">
                    Upload New Label Template (6x4 inches recommended)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLabelUpload}
                      className="hidden"
                      id="label-upload"
                    />
                    <label
                      htmlFor="label-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      <Upload size={16} />
                      Upload Template
                    </label>
                    <span className="text-sm text-blue-600">PNG, JPG supported • 6x4 inch ratio preferred</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {labelTemplates.map(template => (
                    <div key={template.id} className={`border-2 rounded-lg p-3 ${
                      template.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="aspect-[3/2] bg-gray-100 rounded mb-2 flex items-center justify-center">
                        {template.preview ? (
                          <img 
                            src={template.preview} 
                            alt={template.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{template.size}</p>
                      <div className="flex gap-1">
                        {!template.isActive && (
                          <Button
                            onClick={() => activateTemplate(template.id)}
                            size="sm"
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                          >
                            Activate
                          </Button>
                        )}
                        {template.isActive && (
                          <span className="flex-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center font-medium">
                            Active
                          </span>
                        )}
                        {template.id !== 'default' && (
                          <Button
                            onClick={() => deleteTemplate(template.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Public Verification */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Search className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Verify Product Authenticity</h2>
              <p className="text-gray-600">Enter the Lot ID or QR code from your product packaging</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lot ID or QR Code</label>
              <input
                type="text"
                placeholder="LOT-CLOVES-20250405-123 or scan QR code"
                value={lotId}
                onChange={(e) => setLotId(e.target.value.toUpperCase())}
                className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                💡 Tip: The Lot ID can be found on your product packaging or by scanning the QR code
              </p>
            </div>
            
            <Button 
              onClick={handleVerify}
              disabled={!lotId || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Verifying Product...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search size={20} />
                  Verify Product Journey
                </div>
              )}
            </Button>
          </div>
        </Card>

        {/* Verification Results */}
        {verificationData && (
          <div className="space-y-6">
            {/* Product Information */}
            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-green-800">{verificationData.productInfo.name}</h3>
                  <p className="text-green-600">Lot ID: {verificationData.lotId}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="text-sm font-semibold text-green-800">Verified Authentic</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Package className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className="font-semibold">{verificationData.productInfo.grade}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Weight className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Pack Size</p>
                  <p className="font-semibold">{verificationData.productInfo.packSize}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Packed</p>
                  <p className="font-semibold">{verificationData.productInfo.packingDate}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Best Before</p>
                  <p className="font-semibold">{verificationData.productInfo.expiryDate}</p>
                </div>
              </div>
            </Card>

            {/* Journey Timeline */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Product Journey</h3>
              
              <div className="space-y-6">
                {/* Harvest Stage */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="text-green-600" size={20} />
                    </div>
                    <div className="w-px h-16 bg-gray-300 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-green-800">1. Harvest</h4>
                    <p className="text-sm text-gray-600 mb-3">{verificationData.harvestInfo.harvestDate}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-semibold flex items-center gap-1">
                          <MapPin size={14} />
                          {verificationData.harvestInfo.farmLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Raw Weight</p>
                        <p className="font-semibold">{verificationData.harvestInfo.rawWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Estate Yield</p>
                        <p className="font-semibold">{verificationData.harvestInfo.estateYield}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transport Stage */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="text-blue-600" size={20} />
                    </div>
                    <div className="w-px h-16 bg-gray-300 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-blue-800">2. Transport</h4>
                    <p className="text-sm text-gray-600 mb-3">{verificationData.transportInfo.dispatchDate}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vehicle</p>
                        <p className="font-semibold">{verificationData.transportInfo.vehicleNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Driver</p>
                        <p className="font-semibold">{verificationData.transportInfo.driverName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dispatch Weight</p>
                        <p className="font-semibold">{verificationData.transportInfo.dispatchWeight} kg</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Stage */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="text-purple-600" size={20} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-purple-800">3. FlavorCore Processing</h4>
                    <p className="text-sm text-gray-600 mb-3">{verificationData.processingInfo.receivedDate}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Received Weight</p>
                        <p className="font-semibold">{verificationData.processingInfo.inScanWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quality Grade</p>
                        <p className="font-semibold">{verificationData.processingInfo.qualityGrade}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Moisture Level</p>
                        <p className="font-semibold">{verificationData.processingInfo.moistureLevel}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Processing Yield</p>
                        <p className="font-semibold">{verificationData.processingInfo.yieldPercentage}%</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Final Products:</h5>
                      <div className="space-y-1">
                        {verificationData.processingInfo.finalProducts.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{product.product}</span>
                            <span className="font-semibold">{product.weight} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quality Certifications */}
            <Card className="p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-800 mb-4">Quality Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {verificationData.processingInfo.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold">{cert}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Overall Yield Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="text-xl font-bold mb-4">Yield Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {verificationData.harvestInfo.estateYield}%
                  </div>
                  <p className="text-sm text-gray-600">Estate Yield</p>
                  <p className="text-xs text-gray-500">Raw to Threshed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {verificationData.processingInfo.yieldPercentage}%
                  </div>
                  <p className="text-sm text-gray-600">Processing Yield</p>
                  <p className="text-xs text-gray-500">Received to Final</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {verificationData.processingInfo.overallYield}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Yield</p>
                  <p className="text-xs text-gray-500">Harvest to Final</p>
                </div>
              </div>
            </Card>

            {/* Download Certificate */}
            <Card className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Authenticity Certificate</h3>
              <p className="text-gray-600 mb-4">
                Download the complete traceability report for this product
              </p>
              <Button className="bg-gray-600 hover:bg-gray-700">
                <Download className="mr-2" size={16} />
                Download Certificate (PDF)
              </Button>
            </Card>
          </div>
        )}

        {/* No Results State */}
        {!verificationData && !isLoading && lotId && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              We couldn't find any product information for the entered Lot ID.
              Please check the code and try again.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}