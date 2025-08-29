import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ClockIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CogIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useRepairs } from '../hooks/useRepairs';
import { RepairModal } from '../components/repairs/RepairModal';
import { JobCardModal } from '../components/repairs/JobCardModal';
import SmartWorkflowEngine from '../components/workflows/SmartWorkflowEngine';
import QualityControlSystem from '../components/quality/QualityControlSystem';
import { useToast } from '../contexts/toast-hooks';
import { getErrorMessage } from '@/lib/utils';
import type { Repair, Mechanic, Bay } from '../types/index';

// Mock technicians data
const mockTechnicians = [
  { id: 'tech1', name: 'John Smith', specialization: 'Engine Repair', rating: 4.8 },
  { id: 'tech2', name: 'Mike Johnson', specialization: 'Electrical Systems', rating: 4.6 },
  { id: 'tech3', name: 'Sarah Wilson', specialization: 'Brake Systems', rating: 4.9 },
  { id: 'tech4', name: 'David Brown', specialization: 'Transmission', rating: 4.7 },
];

// Mock mechanics data for workflow engine
const mockMechanics: Mechanic[] = [
  {
    id: 'tech1',
    tenantId: 'tenant1',
    name: 'John Smith',
    specialization: ['Engine Repair', 'Diagnostics'],
    hourlyRate: 45,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech2',
    tenantId: 'tenant1',
    name: 'Mike Johnson',
    specialization: ['Electrical Systems', 'AC Repair'],
    hourlyRate: 42,
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech3',
    tenantId: 'tenant1',
    name: 'Sarah Wilson',
    specialization: ['Brake Systems', 'Suspension'],
    hourlyRate: 48,
    availability: 'busy',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock bays data for workflow engine
const mockBays: Bay[] = [
  {
    id: 'bay1',
    tenantId: 'tenant1',
    name: 'Bay A - Engine',
    type: 'standard',
    status: 'available',
    capacity: 1,
    equipment: ['Lift', 'Diagnostic Tool', 'Air Compressor'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bay2',
    tenantId: 'tenant1',
    name: 'Bay B - Electrical',
    type: 'diagnostic',
    status: 'occupied',
    capacity: 1,
    equipment: ['Electrical Tester', 'Oscilloscope', 'Battery Charger'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock repairs data for when the API returns empty
const mockRepairs: Repair[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    customerId: 'customer1',
    vehicleId: 'vehicle1',
    status: 'pending',
    reportedIssues: 'Engine making strange noises, check engine light on',
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    totalCost: 0,
    laborCost: 0,
    partsCost: 0,
    notes: 'Customer reported issue started yesterday',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    tenantId: 'tenant1',
    customerId: 'customer2',
    vehicleId: 'vehicle2',
    status: 'in_progress',
    reportedIssues: 'Brake pedal feels soft, brake fluid leak',
    estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    totalCost: 450,
    laborCost: 200,
    partsCost: 250,
    notes: 'Brake pads and rotors need replacement',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    tenantId: 'tenant1',
    customerId: 'customer3',
    vehicleId: 'vehicle3',
    status: 'completed',
    reportedIssues: 'AC not cooling properly',
    estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    actualCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalCost: 320,
    laborCost: 150,
    partsCost: 170,
    notes: 'Refrigerant leak fixed, system recharged',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    tenantId: 'tenant1',
    customerId: 'customer4',
    vehicleId: 'vehicle4',
    status: 'in_progress',
    reportedIssues: 'Transmission slipping, check transmission fluid',
    estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalCost: 0,
    laborCost: 0,
    partsCost: 0,
    notes: 'Diagnostic in progress',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    tenantId: 'tenant1',
    customerId: 'customer5',
    vehicleId: 'vehicle5',
    status: 'pending',
    reportedIssues: 'Electrical issues - headlights flickering',
    estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    totalCost: 0,
    laborCost: 0,
    partsCost: 0,
    notes: 'Scheduled for tomorrow morning',
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  },
];

const RepairsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showJobCardModal, setShowJobCardModal] = useState(false);
  const [assignedTechnicians, setAssignedTechnicians] = useState<Record<string, string>>({});
  const [showWorkflowEngine, setShowWorkflowEngine] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);
  const [selectedRepairForWorkflow, setSelectedRepairForWorkflow] = useState<Repair | null>(null);

  const { repairs: apiRepairs, loading, error } = useRepairs();
  const { success } = useToast();

  // Ensure repairs is always an array to prevent undefined errors
  const safeApiRepairs = apiRepairs || [];
  
  // Use mock data if API returns empty or undefined
  const repairs = (safeApiRepairs.length === 0) && !loading ? mockRepairs : safeApiRepairs;

  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.reportedIssues?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
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

  const handleAssignTechnician = (repairId: string, technicianId: string) => {
    setAssignedTechnicians(prev => ({
      ...prev,
      [repairId]: technicianId
    }));
    const technician = mockTechnicians.find(t => t.id === technicianId);
    success(`Assigned ${technician?.name} to repair #${repairId}`);
  };

  const handleStatusUpdate = (repairId: string, newStatus: Repair['status']) => {
    // In a real app, this would update the API
    success(`Repair #${repairId} status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleGeneratePDF = (repairId: string) => {
    // Mock PDF generation
    success(`PDF generated for repair #${repairId}`);
  };

  const handleOpenWorkflowEngine = (repair: Repair) => {
    setSelectedRepairForWorkflow(repair);
    setShowWorkflowEngine(true);
  };

  const handleOpenQualityControl = (repair: Repair) => {
    setSelectedRepairForWorkflow(repair);
    setShowQualityControl(true);
  };

  const handleWorkflowUpdate = (repairId: string) => {
    success(`Workflow updated for repair #${repairId}`);
    // In a real app, this would update the repair in the database
  };

  const handleQualityUpdate = (repairId: string, qualityData: unknown) => {
    const score = (qualityData as { qualityScore?: number })?.qualityScore || 0;
    success(`Quality metrics updated for repair #${repairId}: ${score}% score`);
    // In a real app, this would update the quality data in the database
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 responsive-p">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-responsive-2xl font-bold text-foreground">Repairs & Service</h1>
          <p className="text-responsive-base text-muted-foreground">Manage vehicle repairs and service jobs</p>
        </div>
        <button 
          onClick={() => setShowRepairModal(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Repair</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="fluid-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 rounded-xl shadow-layered">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-responsive-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-responsive-2xl font-bold text-foreground">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-glass p-6 rounded-xl shadow-layered">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-10 pr-4 py-2"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-glass px-4 py-2"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="card-glass border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-400">Error loading repairs: {getErrorMessage(error)}</p>
        </div>
      ) : filteredRepairs.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <WrenchScrewdriverIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-responsive-lg font-medium text-foreground mb-2">No repairs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by creating your first repair job.'}
          </p>
          {!searchTerm && !selectedStatus && (
            <button
              onClick={() => setShowRepairModal(true)}
              className="btn-primary"
            >
              Create First Repair
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRepairs.map((repair) => (
            <div key={repair.id} className="card-glass p-6 rounded-xl shadow-layered hover:shadow-glow transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-responsive-lg font-semibold text-foreground">Repair #{repair.id}</h3>
                  <p className="text-responsive-sm text-muted-foreground">
                    {repair.reportedIssues && repair.reportedIssues.length > 60 
                      ? `${repair.reportedIssues.substring(0, 60)}...` 
                      : repair.reportedIssues || 'No issues reported'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                  {repair.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-responsive-sm text-muted-foreground">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  <span>Customer: {repair.customerId}</span>
                </div>
                <div className="flex items-center text-responsive-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>Vehicle: {repair.vehicleId}</span>
                </div>
                {repair.totalCost > 0 && (
                  <div className="flex items-center text-responsive-sm text-muted-foreground">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span>Total Cost: K{(repair.totalCost || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Technician Assignment */}
              <div className="mb-4">
                <label className="block text-responsive-sm font-medium text-foreground mb-2">
                  Assign Technician
                </label>
                <select
                  value={assignedTechnicians[repair.id] || ''}
                  onChange={(e) => handleAssignTechnician(repair.id, e.target.value)}
                  className="input-glass w-full"
                >
                  <option value="">Select Technician</option>
                  {mockTechnicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewRepair(repair)}
                  className="btn-secondary text-responsive-sm px-3 py-1"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleAddJobCard(repair)}
                  className="btn-primary text-responsive-sm px-3 py-1"
                >
                  Job Card
                </button>
                <button
                  onClick={() => handleGeneratePDF(repair.id)}
                  className="btn-ghost text-responsive-sm px-3 py-1"
                >
                  Generate PDF
                </button>
                
                {/* Advanced Workflow & Quality Buttons */}
                <button
                  onClick={() => handleOpenWorkflowEngine(repair)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Workflow</span>
                </button>
                <button
                  onClick={() => handleOpenQualityControl(repair)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                >
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  <span>Quality</span>
                </button>
                
                {/* Status Update Buttons */}
                {repair.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200"
                  >
                    Start Work
                  </button>
                )}
                {repair.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700 text-white text-responsive-sm px-3 py-1 rounded-lg transition-all duration-200"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
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

      {/* Advanced Workflow & Quality Modals */}
      {selectedRepairForWorkflow && (
        <>
          {/* Workflow Engine Modal */}
          {showWorkflowEngine && (
            <SmartWorkflowEngine
              repair={selectedRepairForWorkflow}
              mechanics={mockMechanics}
              bays={mockBays}
              onWorkflowUpdate={handleWorkflowUpdate}
              onClose={() => setShowWorkflowEngine(false)}
            />
          )}

          {/* Quality Control Modal */}
          {showQualityControl && (
            <QualityControlSystem
              repair={selectedRepairForWorkflow}
              onQualityUpdate={handleQualityUpdate}
              onClose={() => setShowQualityControl(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RepairsPage; 