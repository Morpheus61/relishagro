import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Upload, X, ShoppingCart, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface ProcurementScreenProps {
  navigateToScreen: (screen: string) => void;
  currentUser: {
    id: string;
    staff_id: string;
    full_name: string;
    role: string;
  } | null;
}

interface ReceiptFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export function ProcurementScreen({ navigateToScreen, currentUser }: ProcurementScreenProps) {
  const [requestType, setRequestType] = useState<'goods' | 'wages'>('goods');
  const [requestDetails, setRequestDetails] = useState({
    description: '',
    estimatedCost: '',
    vendor: '',
    date: '',
    urgency: 'normal' as 'urgent' | 'normal' | 'low',
    category: '',
    justification: ''
  });
  const [uploadedReceipts, setUploadedReceipts] = useState<ReceiptFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has manager access for procurement
  const hasManagerAccess = currentUser && (
    currentUser.role === 'harvestflow_manager' || 
    currentUser.role === 'flavorcore_manager' ||
    currentUser.role === 'admin'
  );

  if (!hasManagerAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Procurement requests can only be made by managers.
            </p>
            <Button
              onClick={() => navigateToScreen('dashboard')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newReceipts: ReceiptFile[] = [];
    
    Array.from(files).forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert(`File ${file.name} is not supported. Please upload images or PDFs only.`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please upload files smaller than 5MB.`);
        return;
      }

      const receiptFile: ReceiptFile = {
        id: `receipt-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      newReceipts.push(receiptFile);
    });

    setUploadedReceipts(prev => [...prev, ...newReceipts]);
    
    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeReceipt = (id: string) => {
    setUploadedReceipts(prev => {
      const toRemove = prev.find(r => r.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!requestDetails.description || !requestDetails.estimatedCost) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(requestDetails.estimatedCost) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - replace with actual implementation
      const submissionData = {
        request_type: requestType === 'goods' ? 'provisions' : 'wages',
        description: requestDetails.description,
        amount: parseFloat(requestDetails.estimatedCost),
        vendor: requestDetails.vendor || null,
        requested_date: requestDetails.date || null,
        urgency: requestDetails.urgency,
        category: requestDetails.category || null,
        justification: requestDetails.justification || null,
        receipt_count: uploadedReceipts.length,
        status: 'pending',
        submitted_by: currentUser.full_name,
        submitted_by_role: currentUser.role,
        submission_timestamp: new Date().toISOString()
      };

      console.log('Procurement submission:', submissionData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`✅ Procurement request submitted successfully!

📋 Request Summary:
• Type: ${requestType === 'goods' ? 'Goods/Provisions' : 'Wages/Salaries'}
• Amount: ₹${requestDetails.estimatedCost}
• Urgency: ${requestDetails.urgency.toUpperCase()}
${requestDetails.vendor ? `• Vendor: ${requestDetails.vendor}` : ''}
• Submitted by: ${currentUser.full_name}
${uploadedReceipts.length > 0 ? `• Attachments: ${uploadedReceipts.length} files` : ''}

🔄 Next Steps:
1. ✅ Request submitted to Admin
2. ⏳ Pending administrative review
3. ⏳ Budget approval process
4. ⏳ Purchase authorization

Your request ID will be provided via notification.`);
      
      // Reset form
      setRequestDetails({
        description: '',
        estimatedCost: '',
        vendor: '',
        date: '',
        urgency: 'normal',
        category: '',
        justification: ''
      });
      
      // Clean up uploaded files
      uploadedReceipts.forEach(receipt => URL.revokeObjectURL(receipt.preview));
      setUploadedReceipts([]);
      
      navigateToScreen('dashboard');
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const goodsCategories = [
    'Raw Materials',
    'Processing Supplies',
    'Packaging Materials',
    'Equipment & Tools',
    'Vehicle & Transport',
    'Utilities & Services',
    'Food & Consumables',
    'Maintenance & Repairs',
    'Office Supplies',
    'Safety Equipment',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-yellow-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateToScreen('dashboard')}
            className="text-white hover:bg-yellow-700"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Procurement Request</h1>
            <p className="text-yellow-200 text-sm">Manager: {currentUser?.full_name}</p>
          </div>
          <ShoppingCart className="text-yellow-200" size={24} />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Request Type */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-yellow-600" size={20} />
            <h2 className="text-lg font-semibold">Request Type</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              requestType === 'goods' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setRequestType('goods')}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="goods"
                  name="requestType"
                  value="goods"
                  checked={requestType === 'goods'}
                  onChange={() => setRequestType('goods')}
                  className="w-4 h-4"
                />
                <div>
                  <label htmlFor="goods" className="font-semibold cursor-pointer">Goods & Provisions</label>
                  <p className="text-sm text-gray-600">Raw materials, supplies, equipment, consumables</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              requestType === 'wages' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setRequestType('wages')}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="wages"
                  name="requestType"
                  value="wages"
                  checked={requestType === 'wages'}
                  onChange={() => setRequestType('wages')}
                  className="w-4 h-4"
                />
                <div>
                  <label htmlFor="wages" className="font-semibold cursor-pointer">Wages & Salaries</label>
                  <p className="text-sm text-gray-600">Staff payments, contractor fees, overtime</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Request Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold">Request Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                placeholder={`Enter detailed ${requestType} request description...`}
                value={requestDetails.description}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Cost (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={requestDetails.estimatedCost}
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level</label>
                <select
                  value={requestDetails.urgency}
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, urgency: e.target.value as 'urgent' | 'normal' | 'low' }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {requestType === 'goods' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={requestDetails.category}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select category...</option>
                    {goodsCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Vendor (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter vendor name or leave blank"
                    value={requestDetails.vendor}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Required By Date (Optional)</label>
              <input
                type="date"
                value={requestDetails.date}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Justification</label>
              <textarea
                placeholder="Explain why this request is necessary for operations..."
                value={requestDetails.justification}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, justification: e.target.value }))}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </Card>

        {/* Upload Receipts/Documents */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">Supporting Documents</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Quotes, Bills, or Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Click to upload files</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: Images (JPG, PNG), PDFs • Max 5MB per file
                  </p>
                </label>
              </div>
            </div>

            {uploadedReceipts.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Files ({uploadedReceipts.length}):
                </p>
                <div className="space-y-2">
                  {uploadedReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      {receipt.file.type.startsWith('image/') ? (
                        <img 
                          src={receipt.preview} 
                          alt="Receipt preview" 
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-red-100 rounded border flex items-center justify-center">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{receipt.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(receipt.size)}</p>
                      </div>
                      
                      <Button
                        onClick={() => removeReceipt(receipt.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Submit */}
        <div className="space-y-4">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !requestDetails.description || !requestDetails.estimatedCost}
            className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-lg font-semibold"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Submitting Request...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Submit Procurement Request
              </div>
            )}
          </Button>
          
          {(!requestDetails.description || !requestDetails.estimatedCost) && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Please complete required fields to submit request
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}