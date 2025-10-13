import React, { useState, useEffect } from 'react';

interface JobType {
  id: string;
  job_name: string;
  category: string;
  unit_of_measurement: string;
  expected_output_per_worker: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DailyJob {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  expected_output_per_worker: number;
  created_by: string;
  created_at: string;
}

interface JobTypesManagementProps {
  onClose?: () => void;
}

export const JobTypesManagement: React.FC<JobTypesManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'job-types' | 'daily-jobs'>('job-types');
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [dailyJobs, setDailyJobs] = useState<DailyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<JobType | DailyJob | null>(null);

  // API Base URL  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://relishagrobackend-production.up.railway.app';

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchJobTypes(),
        fetchDailyJobs()
      ]);
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError('Failed to load job data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types`);
      if (!response.ok) throw new Error('Failed to fetch job types');
      const data = await response.json();
      setJobTypes(data.data || data || []);
    } catch (err) {
      console.error('Error fetching job types:', err);
      throw err;
    }
  };

  const fetchDailyJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/daily-jobs`);
      if (!response.ok) throw new Error('Failed to fetch daily jobs');
      const data = await response.json();
      setDailyJobs(data.data || data || []);
    } catch (err) {
      console.error('Error fetching daily jobs:', err);
      throw err;
    }
  };

  const createJobType = async (jobTypeData: Omit<JobType, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobTypeData),
      });

      if (!response.ok) throw new Error('Failed to create job type');
      const data = await response.json();
      
      await fetchJobTypes();
      return data;
    } catch (err) {
      console.error('Error creating job type:', err);
      throw err;
    }
  };

  const updateJobType = async (id: string, jobTypeData: Partial<JobType>) => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobTypeData),
      });

      if (!response.ok) throw new Error('Failed to update job type');
      const data = await response.json();
      
      await fetchJobTypes();
      return data;
    } catch (err) {
      console.error('Error updating job type:', err);
      throw err;
    }
  };

  const deleteJobType = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job type');
      
      await fetchJobTypes();
    } catch (err) {
      console.error('Error deleting job type:', err);
      throw err;
    }
  };

  const createDailyJob = async (dailyJobData: Omit<DailyJob, 'id' | 'created_at' | 'created_by'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/daily-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dailyJobData),
      });

      if (!response.ok) throw new Error('Failed to create daily job');
      const data = await response.json();
      
      await fetchDailyJobs();
      return data;
    } catch (err) {
      console.error('Error creating daily job:', err);
      throw err;
    }
  };

  const updateDailyJob = async (id: string, dailyJobData: Partial<DailyJob>) => {
    try {
      const response = await fetch(`${API_BASE}/api/daily-jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dailyJobData),
      });

      if (!response.ok) throw new Error('Failed to update daily job');
      const data = await response.json();
      
      await fetchDailyJobs();
      return data;
    } catch (err) {
      console.error('Error updating daily job:', err);
      throw err;
    }
  };

  const deleteDailyJob = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/daily-jobs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete daily job');
      
      await fetchDailyJobs();
    } catch (err) {
      console.error('Error deleting daily job:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const itemData = {
      job_name: formData.get('job_name') as string || formData.get('name') as string,
      name: formData.get('name') as string || formData.get('job_name') as string,
      category: formData.get('category') as string,
      unit_of_measurement: formData.get('unit_of_measurement') as string,
      expected_output_per_worker: parseFloat(formData.get('expected_output_per_worker') as string),
    };

    try {
      if (editingItem) {
        // Update existing item
        if (activeTab === 'job-types') {
          await updateJobType(editingItem.id, itemData);
        } else {
          await updateDailyJob(editingItem.id, itemData);
        }
        setEditingItem(null);
      } else {
        // Create new item
        if (activeTab === 'job-types') {
          await createJobType(itemData);
        } else {
          await createDailyJob(itemData);
        }
      }
      
      setIsCreating(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(`Failed to ${editingItem ? 'update' : 'create'} ${activeTab === 'job-types' ? 'job type' : 'daily job'}: ${err.message}`);
    }
  };

  const handleEdit = (item: JobType | DailyJob) => {
    setEditingItem(item);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'job-types' ? 'job type' : 'daily job'}?`)) {
      return;
    }

    try {
      if (activeTab === 'job-types') {
        await deleteJobType(id);
      } else {
        await deleteDailyJob(id);
      }
    } catch (err: any) {
      alert(`Failed to delete ${activeTab === 'job-types' ? 'job type' : 'daily job'}: ${err.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsCreating(false);
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
          Loading Job Types Management...
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
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Job Types</h3>
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

  const currentData = activeTab === 'job-types' ? jobTypes : dailyJobs;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '24px', backgroundColor: '#f8fafc' }}>
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
            Job Types Management
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Manage job types and daily jobs for agricultural operations
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
          <button
            onClick={() => setIsCreating(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Add New
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '0'
      }}>
        <button
          onClick={() => setActiveTab('job-types')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            backgroundColor: activeTab === 'job-types' ? '#3b82f6' : 'transparent',
            color: activeTab === 'job-types' ? 'white' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'job-types' ? 'bold' : 'normal'
          }}
        >
          Job Types ({jobTypes.length})
        </button>
        <button
          onClick={() => setActiveTab('daily-jobs')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            backgroundColor: activeTab === 'daily-jobs' ? '#3b82f6' : 'transparent',
            color: activeTab === 'daily-jobs' ? 'white' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'daily-jobs' ? 'bold' : 'normal'
          }}
        >
          Daily Jobs ({dailyJobs.length})
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            {editingItem ? 'Edit' : 'Create New'} {activeTab === 'job-types' ? 'Job Type' : 'Daily Job'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  {activeTab === 'job-types' ? 'Job Name' : 'Name'}
                </label>
                <input
                  type="text"
                  name={activeTab === 'job-types' ? 'job_name' : 'name'}
                  defaultValue={editingItem ? (activeTab === 'job-types' ? (editingItem as JobType).job_name : (editingItem as DailyJob).name) : ''}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter job name"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editingItem?.category || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="processing">Processing</option>
                  <option value="packaging">Packaging</option>
                  <option value="quality_control">Quality Control</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="transportation">Transportation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  Unit of Measurement
                </label>
                <select
                  name="unit_of_measurement"
                  defaultValue={editingItem?.unit_of_measurement || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="bags">Bags</option>
                  <option value="boxes">Boxes</option>
                  <option value="pieces">Pieces</option>
                  <option value="hours">Hours</option>
                  <option value="acres">Acres</option>
                  <option value="units">Units</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  Expected Output per Worker
                </label>
                <input
                  type="number"
                  name="expected_output_per_worker"
                  step="0.1"
                  min="0"
                  defaultValue={editingItem?.expected_output_per_worker || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
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
                {editingItem ? 'Update' : 'Create'} {activeTab === 'job-types' ? 'Job Type' : 'Daily Job'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: isCreating ? '8px' : '0 0 8px 8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>
            {activeTab === 'job-types' ? 'Job Types' : 'Daily Jobs'} ({currentData.length})
          </h2>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Total: {currentData.length} items
          </div>
        </div>

        {currentData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
              No {activeTab === 'job-types' ? 'Job Types' : 'Daily Jobs'} Found
            </h3>
            <p style={{ margin: '0 0 16px 0' }}>
              Get started by creating your first {activeTab === 'job-types' ? 'job type' : 'daily job'}.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Create First {activeTab === 'job-types' ? 'Job Type' : 'Daily Job'}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    {activeTab === 'job-types' ? 'Job Name' : 'Name'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    Unit
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    Expected Output
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    Created
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                        {activeTab === 'job-types' ? (item as JobType).job_name : (item as DailyJob).name}
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        textTransform: 'capitalize'
                      }}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
                      {item.unit_of_measurement}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#1f2937' }}>
                      {item.expected_output_per_worker} {item.unit_of_measurement}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JobTypesManagement;