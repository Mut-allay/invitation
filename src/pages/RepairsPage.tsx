import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ClockIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { RepairCard } from '../components/repairs/RepairCard';
import { RepairModal } from '../components/repairs/RepairModal';
import { JobCardModal } from '../components/repairs/JobCardModal';
import { useRepairs } from '../hooks/useRepairs';
import { Repair } from '../types/repair';

const RepairsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showJobCardModal, setShowJobCardModal] = useState(false);

  const { repairs, loading, error } = useRepairs();

  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.reportedIssues.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || repair.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    const stats = {
      pending: repairs.filter(r => r.status === 'pending').length,
      inProgress: repairs.filter(r => r.status === 'in_progress').length,
      completed: repairs.filter(r => r.status === 'completed').length,
      cancelled: repairs.filter(r => r.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const handleViewRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setShowRepairModal(true);
  };

  const handleAddJobCard = (repair: Repair) => {
    setSelectedRepair(repair);
    setShowJobCardModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repairs & Service</h1>
          <p className="text-gray-600">Manage vehicle repairs and service jobs</p>
        </div>
        <button 
          onClick={() => setShowRepairModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Repair</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repairs List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading repairs: {error}</p>
        </div>
      ) : filteredRepairs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repairs found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by creating your first repair job.'}
          </p>
          {!searchTerm && !selectedStatus && (
            <button
              onClick={() => setShowRepairModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Repair
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRepairs.map((repair) => (
            <RepairCard
              key={repair.id}
              repair={repair}
              onView={() => handleViewRepair(repair)}
              onAddJobCard={() => handleAddJobCard(repair)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedRepair && (
        <>
          <RepairModal
            repair={selectedRepair}
            isOpen={showRepairModal}
            onClose={() => setShowRepairModal(false)}
          />
          <JobCardModal
            repair={selectedRepair}
            isOpen={showJobCardModal}
            onClose={() => setShowJobCardModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default RepairsPage; 