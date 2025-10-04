// src/components/shared/AttendanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types/attendance';
import { Users, Clock, CheckCircle, Calendar, Download, Search } from 'lucide-react';

interface AttendanceDashboardProps {
  module: 'harvestflow' | 'flavorcore';
}

export function AttendanceDashboard({ module }: AttendanceDashboardProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    faceCheckins: 0,
    manualCheckins: 0,
  });

  const location = module === 'harvestflow' ? 'farm_gate' : 'processing_unit';
  const moduleTitle = module === 'harvestflow' ? 'HarvestFlow' : 'FlavorCore';

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, module]);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceRecords({
        date: selectedDate,
        location,
      });
      setRecords(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: AttendanceRecord[]) => {
    setStats({
      total: data.length,
      present: data.filter(r => r.method === 'face' || r.method === 'manual' || r.method === 'rfid').length,
      faceCheckins: data.filter(r => r.method === 'face').length,
      manualCheckins: data.filter(r => r.method === 'manual').length,
    });
  };

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = records.filter(record => 
      record.person?.full_name?.toLowerCase().includes(term) ||
      record.person_id.toLowerCase().includes(term) ||
      record.method.toLowerCase().includes(term)
    );
    setFilteredRecords(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Time', 'Name', 'Person ID', 'Method', 'Location', 'Confidence'];
    const rows = filteredRecords.map(record => [
      new Date(record.timestamp).toLocaleTimeString(),
      record.person?.full_name || 'Unknown',
      record.person_id,
      record.method,
      record.location,
      record.confidence_score ? `${(record.confidence_score * 100).toFixed(1)}%` : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleTitle}_attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'face': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'manual': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'rfid': return 'bg-green-100 text-green-700 border-green-300';
      case 'override': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'checkout': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {moduleTitle} Attendance Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            View and manage attendance records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Present Today</p>
                <p className="text-2xl font-bold text-green-700">{stats.present}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Face Check-ins</p>
                <p className="text-2xl font-bold text-purple-700">{stats.faceCheckins}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-slate-600">Manual Check-ins</p>
                <p className="text-2xl font-bold text-orange-700">{stats.manualCheckins}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportToCSV}
                variant="outline"
                disabled={filteredRecords.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Records Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Person ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No records found for the selected date
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(record.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {record.person?.full_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">
                        {record.person_id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMethodBadgeColor(record.method)}`}>
                          {record.method.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">
                        {record.location.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.confidence_score 
                          ? `${(record.confidence_score * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}