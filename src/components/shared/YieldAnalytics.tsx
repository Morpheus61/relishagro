// src/components/shared/YieldAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Download, Calendar, Filter, AlertTriangle } from 'lucide-react';

interface YieldData {
  lot_id: string;
  crop: string;
  harvest_date: string;
  raw_weight: number;
  threshed_weight: number;
  estate_yield_pct: number;
  flavorcore_yield_pct: number;
  total_yield_pct: number;
  processed_date: string | null;
  processing_status: string;
}

const YieldAnalytics: React.FC = () => {
  const [yields, setYields] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  const API_BASE = 'https://relishagrobackend-production.up.railway.app';

  // ✅ FIXED: Correct token retrieval
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  const fetchYieldData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      // ✅ ADDED: Check if token exists
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (cropFilter) params.append('crop', cropFilter);

      const url = `${API_BASE}/api/yields${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('📊 Fetching yield data from:', url);

      const response = await fetch(url, { 
        headers,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch yield data: ${response.status}`);
      }

      const data = await response.json();
      const yieldsArray = Array.isArray(data) ? data : (data.data || data.yields || []);
      
      console.log('✅ Yield data fetched:', yieldsArray.length, 'records');
      
      setYields(yieldsArray);
    } catch (error: any) {
      console.error('❌ Error fetching yield data:', error);
      setError(error.message || 'Failed to load yield data');
      setYields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYieldData();
  }, []);

  const handleExport = () => {
    if (yields.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const csvContent = [
        ['Lot ID', 'Crop', 'Harvest Date', 'Raw Weight', 'Threshed Weight', 'Estate Yield %', 'FlavorCore Yield %', 'Total Yield %', 'Status'],
        ...(yields || []).map(y => [
          y.lot_id,
          y.crop,
          y.harvest_date,
          y.raw_weight,
          y.threshed_weight,
          y.estate_yield_pct,
          y.flavorcore_yield_pct,
          y.total_yield_pct,
          y.processing_status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yield_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ CSV exported successfully');
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      alert('Failed to export data');
    }
  };

  // ✅ ADDED: Loading state
  if (loading && yields.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Yield Analytics</h2>
        </div>
        <Card className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading yield data...</p>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ ADDED: Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Yield Analytics</h2>
        </div>
        <Card className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchYieldData} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Yield Analytics</h2>
        <Button onClick={handleExport} variant="outline" disabled={yields.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Crop Filter</label>
            <Input
              placeholder="e.g., Cardamom"
              value={cropFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropFilter(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={fetchYieldData} className="mb-4" disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Apply Filters'}
        </Button>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot ID</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Harvest Date</TableHead>
                <TableHead>Raw Weight</TableHead>
                <TableHead>Threshed Weight</TableHead>
                <TableHead>Estate Yield %</TableHead>
                <TableHead>FlavorCore Yield %</TableHead>
                <TableHead>Total Yield %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(yields || []).length > 0 ? (
                yields.map((y) => (
                  <TableRow key={y.lot_id}>
                    <TableCell className="font-mono">{y.lot_id}</TableCell>
                    <TableCell>{y.crop}</TableCell>
                    <TableCell>{y.harvest_date}</TableCell>
                    <TableCell>{y.raw_weight?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{y.threshed_weight?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{y.estate_yield_pct?.toFixed(2) || '0.00'}%</TableCell>
                    <TableCell>{y.flavorcore_yield_pct?.toFixed(2) || '0.00'}%</TableCell>
                    <TableCell>{y.total_yield_pct?.toFixed(2) || '0.00'}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        y.processing_status === 'completed' ? 'bg-green-100 text-green-800' :
                        y.processing_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {y.processing_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-gray-500">No yield data available</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or check back later</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ✅ ADDED: Summary statistics */}
        {yields.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold">{yields.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Avg Estate Yield</p>
              <p className="text-2xl font-bold">
                {(yields.reduce((sum, y) => sum + (y.estate_yield_pct || 0), 0) / yields.length).toFixed(2)}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Avg FlavorCore Yield</p>
              <p className="text-2xl font-bold">
                {(yields.reduce((sum, y) => sum + (y.flavorcore_yield_pct || 0), 0) / yields.length).toFixed(2)}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Avg Total Yield</p>
              <p className="text-2xl font-bold">
                {(yields.reduce((sum, y) => sum + (y.total_yield_pct || 0), 0) / yields.length).toFixed(2)}%
              </p>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default YieldAnalytics;