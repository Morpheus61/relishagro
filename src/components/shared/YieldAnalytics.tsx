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
import { Download, Calendar, Filter } from 'lucide-react';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchYieldData = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      };

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (cropFilter) params.append('crop', cropFilter);

      const response = await fetch(`${API_BASE}/api/yields?${params.toString()}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setYields(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching yield ', error);
      setYields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYieldData();
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['Lot ID', 'Crop', 'Harvest Date', 'Raw Weight', 'Threshed Weight', 'Estate Yield %', 'FlavorCore Yield %', 'Total Yield %', 'Status'],
      ...yields.map(y => [
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yield_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Yield Analytics</h2>
        <Button onClick={handleExport} variant="outline">
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

        <Button onClick={fetchYieldData} className="mb-4">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>

        {loading ? (
          <div className="text-center py-8">Loading yield data...</div>
        ) : (
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
                {yields.length > 0 ? (
                  yields.map((y) => (
                    <TableRow key={y.lot_id}>
                      <TableCell className="font-mono">{y.lot_id}</TableCell>
                      <TableCell>{y.crop}</TableCell>
                      <TableCell>{y.harvest_date}</TableCell>
                      <TableCell>{y.raw_weight.toFixed(2)}</TableCell>
                      <TableCell>{y.threshed_weight.toFixed(2)}</TableCell>
                      <TableCell>{y.estate_yield_pct.toFixed(2)}</TableCell>
                      <TableCell>{y.flavorcore_yield_pct.toFixed(2)}</TableCell>
                      <TableCell>{y.total_yield_pct.toFixed(2)}</TableCell>
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
                      No yield data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default YieldAnalytics;