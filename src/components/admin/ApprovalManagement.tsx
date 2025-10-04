import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { supabase } from '../../lib/supabase';

interface OnboardingRequest {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  role: string;
  aadhaar: string;
  status: string;
  created_at: string;
}

interface ProvisionRequest {
  id: string;
  request_type: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

export function ApprovalManagement() {
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([]);
  const [provisionRequests, setProvisionRequests] = useState<ProvisionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data: onboarding, error: onbError } = await supabase
        .from('onboarding_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data: provisions, error: provError } = await supabase
        .from('provision_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (onbError) throw onbError;
      if (provError) throw provError;

      setOnboardingRequests(onboarding || []);
      setProvisionRequests(provisions || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveOnboarding = async (request: OnboardingRequest) => {
    try {
      // Create person record
      const { error: personError } = await supabase
        .from('person_records')
        .insert({
          staff_id: `HF-${Date.now().toString().slice(-6)}`,
          first_name: request.first_name,
          last_name: request.last_name,
          contact_number: request.mobile,
          person_type: 'staff',
          designation: request.role,
          status: 'active'
        });

      if (personError) throw personError;

      // Update request status
      const { error: updateError } = await supabase
        .from('onboarding_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      alert('Staff onboarded successfully!');
      loadRequests();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const rejectOnboarding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('onboarding_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      alert('Request rejected');
      loadRequests();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const approveProvision = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provision_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      alert('Provision request approved!');
      loadRequests();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const rejectProvision = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provision_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      alert('Request rejected');
      loadRequests();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const totalPending = onboardingRequests.length + provisionRequests.length;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Approvals ({totalPending})</h2>
      
      {onboardingRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Staff Onboarding Requests</h3>
          <div className="space-y-4">
            {onboardingRequests.map(request => (
              <Card key={request.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {request.first_name} {request.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">Role: {request.role}</p>
                    <p className="text-sm text-gray-600">Mobile: {request.mobile}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => approveOnboarding(request)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve & Onboard
                    </Button>
                    <Button 
                      onClick={() => rejectOnboarding(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {provisionRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-yellow-700">Provision Requests</h3>
          <div className="space-y-4">
            {provisionRequests.map(request => (
              <Card key={request.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg capitalize">{request.request_type}</h4>
                    <p className="text-sm text-gray-600">{request.description}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      Amount: ₹{request.amount?.toFixed(2) || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => approveProvision(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => rejectProvision(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {totalPending === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No pending approvals</p>
        </div>
      )}
    </div>
  );
}