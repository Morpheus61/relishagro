import React, { useState, useEffect } from 'react';

// ADDED: Import shared component
import { AttendanceOverride } from '../shared/AttendanceOverride';

interface User {
  id: string;
  staff_id: string;
  full_name: string;
  role: string;
}

interface SupervisorDashboardProps {
  currentUser?: User;
  onLogout?: () => void;
}

interface Lot {
  lot_id: string;
  crop: string;
  raw_weight: number;
  threshed_weight: number;
  estate_yield_pct: number;
  date_harvested: string;
  workers_involved: string[];
  status: string;
}

interface QualityTest {
  process_id: string;
  lot_id: string;
  in_scan_weight: number;
  flavorcore_yield_pct: number;
  total_yield_pct: number;
  processed_date: string;
  status: string;
  sample_tests: any;
}

interface WorkerAssignment {
  id: string;
  person_id: string;
  full_name: string;
  timestamp: string;
  location: string;
  status: string;
  method: string;
}

interface ProcessMonitoring {
  active_lots: number;
  total_workers_active: number;
  quality_tests_today: number;
  production_efficiency: number;
  quality_pass_rate: number;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ 
  currentUser,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lots, setLots] = useState<Lot[]>([]);
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [workerAssignments, setWorkerAssignments] = useState<WorkerAssignment[]>([]);
  const [processMonitoring, setProcessMonitoring] = useState<ProcessMonitoring>({
    active_lots: 0,
    total_workers_active: 0,
    quality_tests_today: 0,
    production_efficiency: 0,
    quality_pass_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ADDED: Attendance override state
  const [showAttendanceOverride, setShowAttendanceOverride] = useState(false);
  const [selectedWorkerForOverride, setSelectedWorkerForOverride] = useState<{id: string, name: string} | null>(null);

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://relishagrobackend-production.up.railway.app';

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchLots(),
        fetchQualityTests(),
        fetchWorkerAssignments(),
        fetchProcessMonitoring()
      ]);
    } catch (err) {
      console.error('Error fetching supervisor data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLots = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/lots`);
      if (!response.ok) throw new Error('Failed to fetch lots');
      const data = await response.json();
      setLots(data.data || []);
    } catch (err) {
      console.error('Error fetching lots:', err);
      throw err;
    }
  };

  const fetchQualityTests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/quality-tests`);
      if (!response.ok) throw new Error('Failed to fetch quality tests');
      const data = await response.json();
      setQualityTests(data.data || []);
    } catch (err) {
      console.error('Error fetching quality tests:', err);
      throw err;
    }
  };

  const fetchWorkerAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/worker-assignments`);
      if (!response.ok) throw new Error('Failed to fetch worker assignments');
      const data = await response.json();
      setWorkerAssignments(data.data || []);
    } catch (err) {
      console.error('Error fetching worker assignments:', err);
      throw err;
    }
  };

  const fetchProcessMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/process-monitoring`);
      if (!response.ok) throw new Error('Failed to fetch process monitoring');
      const data = await response.json();
      setProcessMonitoring(data.data || processMonitoring);
    } catch (err) {
      console.error('Error fetching process monitoring:', err);
      throw err;
    }
  };

  const submitPackedProducts = async (lotId: string, quantity: number, notes: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/submit-packed-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lot_id: lotId,
          quantity_packed: quantity,
          supervisor_id: currentUser?.id,
          notes: notes
        }),
      });

      if (!response.ok) throw new Error('Failed to submit packed products');
      const data = await response.json();
      
      // Refresh data after submission
      await fetchAllData();
      
      return data;
    } catch (err) {
      console.error('Error submitting packed products:', err);
      throw err;
    }
  };

  // ADDED: Handle attendance override for workers
  const handleAttendanceOverride = (workerId: string, workerName: string) => {
    setSelectedWorkerForOverride({ id: workerId, name: workerName });
    setShowAttendanceOverride(true);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading Supervisor Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '16px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Dashboard</h3>
        <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>{error}</p>
        <button
          onClick={fetchAllData}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>
            Supervisor Dashboard
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Welcome back, {currentUser?.full_name || 'Supervisor'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchAllData}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Process Monitoring Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
            {processMonitoring.active_lots}
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Active Lots</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
            {processMonitoring.total_workers_active}
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Workers Active</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>
            {processMonitoring.quality_tests_today}
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Tests Today</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6', fontSize: '24px', fontWeight: 'bold' }}>
            {processMonitoring.production_efficiency.toFixed(1)}%
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Efficiency</p>
        </div>
      </div>

      {/* Navigation Tabs - ADDED attendance-override */}
      <div style={{
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'lots', label: 'Production Lots' },
          { key: 'quality', label: 'Quality Control' },
          { key: 'workers', label: 'Worker Management' },
          { key: 'attendance-override', label: 'Attendance Override' }, // ADDED
          { key: 'submission', label: 'Product Submission' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Production Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <h3 style={{ color: '#374151', marginBottom: '12px' }}>Recent Lots</h3>
                {lots.slice(0, 3).map(lot => (
                  <div key={lot.lot_id} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{lot.lot_id}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {lot.crop} - {lot.raw_weight}kg
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 style={{ color: '#374151', marginBottom: '12px' }}>Active Workers</h3>
                {workerAssignments.slice(0, 3).map(worker => (
                  <div key={worker.id} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{worker.full_name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {worker.location} - {worker.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lots' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Production Lots</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Lot ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Crop</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Raw Weight</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Yield %</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map(lot => (
                    <tr key={lot.lot_id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{lot.lot_id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{lot.crop}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{lot.raw_weight}kg</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{lot.estate_yield_pct}%</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{lot.date_harvested}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: lot.status === 'completed' ? '#d1fae5' : '#fef3c7',
                          color: lot.status === 'completed' ? '#065f46' : '#92400e'
                        }}>
                          {lot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Quality Control Tests</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {qualityTests.map(test => (
                <div key={test.process_id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Process ID: {test.process_id}</h3>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Lot: {test.lot_id}</p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: test.status === 'completed' ? '#d1fae5' : '#fef3c7',
                      color: test.status === 'completed' ? '#065f46' : '#92400e'
                    }}>
                      {test.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Input Weight</span>
                      <div style={{ fontWeight: 'bold' }}>{test.in_scan_weight}kg</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>FlavorCore Yield</span>
                      <div style={{ fontWeight: 'bold' }}>{test.flavorcore_yield_pct}%</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Yield</span>
                      <div style={{ fontWeight: 'bold' }}>{test.total_yield_pct}%</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Date</span>
                      <div style={{ fontWeight: 'bold' }}>{test.processed_date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Worker Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Worker</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Location</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Check-in Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Method</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workerAssignments.map(worker => (
                    <tr key={worker.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{worker.full_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{worker.location}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: worker.status === 'present' ? '#d1fae5' : '#fee2e2',
                          color: worker.status === 'present' ? '#065f46' : '#991b1b'
                        }}>
                          {worker.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        {new Date(worker.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151'
                        }}>
                          {worker.method}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <button
                          onClick={() => handleAttendanceOverride(worker.person_id, worker.full_name)}
                          style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADDED: Attendance Override Tab */}
        {activeTab === 'attendance-override' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Attendance Override Management</h2>
            <div style={{
              padding: '24px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Submit Attendance Override</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Select a worker from the table below to submit an attendance override request. 
                This is useful when biometric systems fail or workers have attendance issues.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#374151', marginBottom: '8px' }}>Available Workers:</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {workerAssignments.map(worker => (
                    <div key={worker.id} style={{
                      padding: '12px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{worker.full_name}</span>
                        <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>
                          ID: {worker.person_id} • {worker.location}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAttendanceOverride(worker.person_id, worker.full_name)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Submit Override
                      </button>
                    </div>
                  ))}
                  {workerAssignments.length === 0 && (
                    <div style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      No workers currently assigned
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '6px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                  <strong>Note:</strong> Attendance override requests require approval from Admin and FlavorCore Manager. 
                  Workers can continue working while requests are pending review.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submission' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Product Submission</h2>
            <div style={{
              padding: '24px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Submit Packed Products</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const lotId = formData.get('lotId') as string;
                const quantity = parseFloat(formData.get('quantity') as string);
                const notes = formData.get('notes') as string;
                
                submitPackedProducts(lotId, quantity, notes)
                  .then(() => {
                    alert('Products submitted successfully!');
                    (e.target as HTMLFormElement).reset();
                  })
                  .catch((err) => {
                    alert('Failed to submit products: ' + err.message);
                  });
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                      Lot ID
                    </label>
                    <select
                      name="lotId"
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Lot</option>
                      {lots.map(lot => (
                        <option key={lot.lot_id} value={lot.lot_id}>
                          {lot.lot_id} - {lot.crop}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      step="0.1"
                      min="0"
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    placeholder="Add any additional notes..."
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Submit Products
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ADDED: Attendance Override Modal */}
      {showAttendanceOverride && selectedWorkerForOverride && (
        <AttendanceOverride
          workerId={selectedWorkerForOverride.id}
          workerName={selectedWorkerForOverride.name}
          onComplete={() => {
            setShowAttendanceOverride(false);
            setSelectedWorkerForOverride(null);
            alert('Attendance override submitted successfully! Admin and FlavorCore Manager will review the request.');
          }}
          onCancel={() => {
            setShowAttendanceOverride(false);
            setSelectedWorkerForOverride(null);
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;