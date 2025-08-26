import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import type { 
  Bay, 
  BaySchedule, 
  Mechanic, 
  Repair,
  BaySchedulingFormData 
} from '../../types/repair';

interface BaySchedulingSystemProps {
  tenantId: string;
  onScheduleCreated?: (schedule: BaySchedule) => void;
  onScheduleUpdated?: (schedule: BaySchedule) => void;
  onScheduleDeleted?: (scheduleId: string) => void;
}

interface SchedulingState {
  selectedDate: Date;
  selectedBay?: Bay;
  selectedMechanic?: Mechanic;
  selectedRepair?: Repair;
  isCreatingSchedule: boolean;
  scheduleForm: BaySchedulingFormData;
}

export const BaySchedulingSystem: React.FC<BaySchedulingSystemProps> = ({
  tenantId,
  onScheduleCreated,
  onScheduleUpdated,
  onScheduleDeleted
}) => {
  const [schedulingState, setSchedulingState] = useState<SchedulingState>({
    selectedDate: new Date(),
    isCreatingSchedule: false,
    scheduleForm: {
      bayId: '',
      repairId: '',
      mechanicId: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      notes: ''
    }
  });

  const [bays, setBays] = useState<Bay[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [schedules, setSchedules] = useState<BaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockBays: Bay[] = [
      {
        id: '1',
        tenantId,
        name: 'Bay 1',
        type: 'standard',
        status: 'available',
        capacity: 1,
        equipment: ['Lift', 'Tools', 'Diagnostic'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        tenantId,
        name: 'Bay 2',
        type: 'heavy_duty',
        status: 'occupied',
        currentRepairId: 'repair-1',
        currentMechanicId: 'mechanic-1',
        capacity: 1,
        equipment: ['Heavy Lift', 'Specialized Tools'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        tenantId,
        name: 'Bay 3',
        type: 'diagnostic',
        status: 'available',
        capacity: 1,
        equipment: ['Computer', 'Scanner', 'Testing Equipment'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockMechanics: Mechanic[] = [
      {
        id: '1',
        tenantId,
        name: 'John Mechanic',
        specialization: ['Engine', 'Transmission'],
        hourlyRate: 25,
        availability: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        tenantId,
        name: 'Sarah Technician',
        specialization: ['Electrical', 'Diagnostics'],
        hourlyRate: 30,
        availability: 'busy',
        currentBayId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        tenantId,
        name: 'Mike Specialist',
        specialization: ['Body Work', 'Paint'],
        hourlyRate: 35,
        availability: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockRepairs: Repair[] = [
      {
        id: '1',
        tenantId,
        customerId: 'customer-1',
        vehicleId: 'vehicle-1',
        status: 'pending',
        reportedIssues: 'Engine making strange noise',
        totalCost: 500,
        laborCost: 300,
        partsCost: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        tenantId,
        customerId: 'customer-2',
        vehicleId: 'vehicle-2',
        status: 'pending',
        reportedIssues: 'Brake system needs inspection',
        totalCost: 300,
        laborCost: 200,
        partsCost: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockSchedules: BaySchedule[] = [
      {
        id: '1',
        bayId: '2',
        repairId: '1',
        mechanicId: '2',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'in_progress',
        notes: 'Engine repair in progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setBays(mockBays);
    setMechanics(mockMechanics);
    setRepairs(mockRepairs);
    setSchedules(mockSchedules);
  }, [tenantId]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    setSchedulingState(prev => ({
      ...prev,
      selectedDate: new Date(
        direction === 'next' 
          ? prev.selectedDate.getTime() + 24 * 60 * 60 * 1000
          : prev.selectedDate.getTime() - 24 * 60 * 60 * 1000
      )
    }));
  };

  const handleCreateSchedule = () => {
    setSchedulingState(prev => ({
      ...prev,
      isCreatingSchedule: true,
      scheduleForm: {
        bayId: '',
        repairId: '',
        mechanicId: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        notes: ''
      }
    }));
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!schedulingState.scheduleForm.bayId || 
          !schedulingState.scheduleForm.repairId || 
          !schedulingState.scheduleForm.mechanicId) {
        throw new Error('Please fill in all required fields');
      }

      // Check for scheduling conflicts
      const conflicts = schedules.filter(schedule => 
        schedule.bayId === schedulingState.scheduleForm.bayId &&
        schedule.status !== 'cancelled' &&
        ((schedule.startTime <= schedulingState.scheduleForm.startTime && 
          schedule.endTime > schedulingState.scheduleForm.startTime) ||
         (schedule.startTime < schedulingState.scheduleForm.endTime && 
          schedule.endTime >= schedulingState.scheduleForm.endTime))
      );

      if (conflicts.length > 0) {
        throw new Error('Scheduling conflict detected. Please choose a different time or bay.');
      }

      const newSchedule: BaySchedule = {
        id: Date.now().toString(),
        ...schedulingState.scheduleForm,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSchedules(prev => [...prev, newSchedule]);
      onScheduleCreated?.(newSchedule);

      setSchedulingState(prev => ({
        ...prev,
        isCreatingSchedule: false
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleDelete = async (scheduleId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      onScheduleDeleted?.(scheduleId);
    } catch (err) {
      setError('Failed to delete schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const getBayStatusColor = (bay: Bay) => {
    switch (bay.status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleStatusColor = (schedule: BaySchedule) => {
    switch (schedule.status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBaySchedules = (bayId: string) => {
    return schedules.filter(schedule => 
      schedule.bayId === bayId && 
      schedule.status !== 'cancelled'
    );
  };

  const getMechanicName = (mechanicId: string) => {
    return mechanics.find(m => m.id === mechanicId)?.name || 'Unknown';
  };

  const getRepairInfo = (repairId: string) => {
    return repairs.find(r => r.id === repairId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bay Scheduling System</h3>
          <p className="text-sm text-gray-600">Manage workshop bay assignments and scheduling</p>
        </div>
        <Button onClick={handleCreateSchedule}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Schedule Job
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDateChange('prev')}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatDate(schedulingState.selectedDate)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDateChange('next')}
        >
          Next
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Bay Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bays.map(bay => (
          <div key={bay.id} className="border border-gray-200 rounded-lg p-4">
            {/* Bay Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{bay.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{bay.type.replace('_', ' ')}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBayStatusColor(bay)}`}>
                {bay.status}
              </span>
            </div>

            {/* Bay Equipment */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Equipment:</p>
              <div className="flex flex-wrap gap-1">
                {bay.equipment.map((equipment, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>

            {/* Bay Schedules */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Schedules:</p>
              <div className="space-y-2">
                {getBaySchedules(bay.id).length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No schedules</p>
                ) : (
                  getBaySchedules(bay.id).map(schedule => {
                    const repair = getRepairInfo(schedule.repairId);
                    return (
                      <div
                        key={schedule.id}
                        className={`p-2 rounded border-l-4 ${
                          schedule.status === 'in_progress' ? 'border-green-500 bg-green-50' :
                          schedule.status === 'scheduled' ? 'border-blue-500 bg-blue-50' :
                          'border-gray-500 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">
                              {repair?.reportedIssues.slice(0, 30)}...
                            </p>
                            <p className="text-xs text-gray-600">
                              {getMechanicName(schedule.mechanicId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`px-1 py-0.5 text-xs rounded ${getScheduleStatusColor(schedule)}`}>
                              {schedule.status}
                            </span>
                            <button
                              onClick={() => handleScheduleDelete(schedule.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Schedule Modal */}
      {schedulingState.isCreatingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule New Job</h4>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Bay Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bay *
                </label>
                <select
                  value={schedulingState.scheduleForm.bayId}
                  onChange={(e) => setSchedulingState(prev => ({
                    ...prev,
                    scheduleForm: { ...prev.scheduleForm, bayId: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a bay</option>
                  {bays.filter(bay => bay.status === 'available').map(bay => (
                    <option key={bay.id} value={bay.id}>
                      {bay.name} ({bay.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Repair Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repair Job *
                </label>
                <select
                  value={schedulingState.scheduleForm.repairId}
                  onChange={(e) => setSchedulingState(prev => ({
                    ...prev,
                    scheduleForm: { ...prev.scheduleForm, repairId: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a repair</option>
                  {repairs.filter(repair => repair.status === 'pending').map(repair => (
                    <option key={repair.id} value={repair.id}>
                      {repair.reportedIssues.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Mechanic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mechanic *
                </label>
                <select
                  value={schedulingState.scheduleForm.mechanicId}
                  onChange={(e) => setSchedulingState(prev => ({
                    ...prev,
                    scheduleForm: { ...prev.scheduleForm, mechanicId: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a mechanic</option>
                  {mechanics.filter(mechanic => mechanic.availability === 'available').map(mechanic => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name} - {mechanic.specialization.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={schedulingState.scheduleForm.startTime.toISOString().slice(0, 16)}
                    onChange={(e) => setSchedulingState(prev => ({
                      ...prev,
                      scheduleForm: { 
                        ...prev.scheduleForm, 
                        startTime: new Date(e.target.value),
                        endTime: new Date(new Date(e.target.value).getTime() + 2 * 60 * 60 * 1000)
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={schedulingState.scheduleForm.endTime.toISOString().slice(0, 16)}
                    onChange={(e) => setSchedulingState(prev => ({
                      ...prev,
                      scheduleForm: { ...prev.scheduleForm, endTime: new Date(e.target.value) }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={schedulingState.scheduleForm.notes}
                  onChange={(e) => setSchedulingState(prev => ({
                    ...prev,
                    scheduleForm: { ...prev.scheduleForm, notes: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSchedulingState(prev => ({ ...prev, isCreatingSchedule: false }))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 