// src/components/shared/ProcurementScreen.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';        // ✅ Import Input
import { Textarea } from '../ui/textarea';  // ✅ Import Textarea
import { ArrowLeft } from 'lucide-react';   // ✅ Only used icon
import { supabase } from '../../lib/supabase';

interface ProcurementScreenProps {
  navigateToScreen: (screen: string) => void;
  user: string | null;
}

export function ProcurementScreen({ navigateToScreen }: ProcurementScreenProps) {
  const [requestType, setRequestType] = useState<'goods' | 'wages'>('goods');
  const [requestDetails, setRequestDetails] = useState({
    description: '',
    estimatedCost: '',
    vendor: '',
    date: '',
  });
  const [uploadedReceipts, setUploadedReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fix: Properly typed event handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newReceipts = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedReceipts(prev => [...prev, ...newReceipts]);
    }
  };

  const handleSubmit = async () => {
  if (!requestDetails.description || !requestDetails.estimatedCost) {
    alert('Please fill required fields');
    return;
  }

  setIsSubmitting(true);
  
  try {
    const { data, error } = await supabase
      .from('provision_requests')  // ✅ Correct for provisions/procurement
      .insert({
        request_type: requestType === 'goods' ? 'provisions' : 'wages',
        description: requestDetails.description,
        amount: parseFloat(requestDetails.estimatedCost),
        vendor: requestDetails.vendor || null,
        requested_date: requestDetails.date || null,
        receipt_images: uploadedReceipts.length > 0 ? uploadedReceipts : null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    alert('Request submitted successfully! Pending admin approval.');
    
    // Reset form
    setRequestDetails({
      description: '',
      estimatedCost: '',
      vendor: '',
      date: ''
    });
    setUploadedReceipts([]);
    
    navigateToScreen('dashboard');
  } catch (error: any) {
    console.error('Submission error:', error);
    alert(`Failed to submit: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

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
          <h1 className="text-lg">Procurement Request</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Request Type */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Request Type</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="goods"
                name="requestType"
                value="goods"
                checked={requestType === 'goods'}
                onChange={() => setRequestType('goods')}
              />
              <label htmlFor="goods">Goods (Food, Consumables, Spares)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="wages"
                name="requestType"
                value="wages"
                checked={requestType === 'wages'}
                onChange={() => setRequestType('wages')}
              />
              <label htmlFor="wages">Wages/Salaries</label>
            </div>
          </div>
        </Card>

        {/* Request Details */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Request Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Description</label>
              <Textarea
                placeholder="Enter request description"
                value={requestDetails.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setRequestDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Estimated Cost (₹)</label>
              <Input
                placeholder="Enter estimated cost"
                value={requestDetails.estimatedCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setRequestDetails(prev => ({ ...prev, estimatedCost: e.target.value }))}
              />
            </div>
            {requestType === 'goods' && (
              <div>
                <label className="block text-sm mb-2">Vendor</label>
                <Input
                  placeholder="Enter vendor name"
                  value={requestDetails.vendor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setRequestDetails(prev => ({ ...prev, vendor: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-2">Date</label>
              <Input
                type="date"
                value={requestDetails.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setRequestDetails(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        {/* Upload Receipts */}
        {requestType === 'goods' && (
          <Card className="p-4">
            <h2 className="text-lg mb-4">Upload Receipts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Upload Bills & Receipts</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
              {uploadedReceipts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Uploaded Receipts:</p>
                  {uploadedReceipts.map((receipt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <img src={receipt} alt="Receipt" className="w-20 h-20 object-cover" />
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit */}
        <div className="space-y-4">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}