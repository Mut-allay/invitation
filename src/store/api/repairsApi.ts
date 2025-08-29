import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { repairsService } from '../../services/firestoreService';

export interface Repair {
  id: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  startDate: Date;
  completionDate?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const repairsApi = createApi({
  reducerPath: 'repairsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Repair'],
  endpoints: (builder) => ({
    getRepairs: builder.query<Repair[], { tenantId: string }>({
      async queryFn(arg) {
        try {
          const repairs = await repairsService.getAll(arg.tenantId);
          // Ensure we always return an array, even if the service returns undefined/null
          const safeRepairs = Array.isArray(repairs) ? repairs : [];
          return { data: safeRepairs };
        } catch (error) {
          console.error('Error fetching repairs:', error);
          return { data: [] };
        }
      },
      providesTags: ['Repair'],
    }),
    
    getRepair: builder.query<Repair, { tenantId: string; repairId: string }>({
      async queryFn(arg) {
        try {
          const repair = await repairsService.getById(arg.repairId);
          if (!repair) {
            return { error: { status: 'NOT_FOUND', error: 'Repair not found' } };
          }
          return { data: repair };
        } catch (error) {
          console.error('Error fetching repair:', error);
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch repair' } };
        }
      },
      providesTags: (result, error, { repairId }) => [{ type: 'Repair', id: repairId }],
    }),

    createRepair: builder.mutation<string, { tenantId: string; repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'> }>({
      async queryFn(arg) {
        try {
          const repairId = await repairsService.add(arg.repair);
          if (!repairId) {
            return { error: { status: 'CREATE_ERROR', error: 'Failed to create repair' } };
          }
          return { data: repairId };
        } catch (error) {
          console.error('Error creating repair:', error);
          return { error: { status: 'CREATE_ERROR', error: 'Failed to create repair' } };
        }
      },
      invalidatesTags: ['Repair'],
    }),

    updateRepair: builder.mutation<boolean, { tenantId: string; repairId: string; repair: Partial<Repair> }>({
      async queryFn(arg) {
        try {
          const success = await repairsService.update(arg.repairId, arg.repair);
          return { data: success };
        } catch (error) {
          console.error('Error updating repair:', error);
          return { error: { status: 'UPDATE_ERROR', error: 'Failed to update repair' } };
        }
      },
      invalidatesTags: (result, error, { repairId }) => [
        { type: 'Repair', id: repairId },
        'Repair'
      ],
    }),

    deleteRepair: builder.mutation<boolean, { tenantId: string; repairId: string }>({
      async queryFn(arg) {
        try {
          const success = await repairsService.delete(arg.repairId);
          return { data: success };
        } catch (error) {
          console.error('Error deleting repair:', error);
          return { error: { status: 'DELETE_ERROR', error: 'Failed to delete repair' } };
        }
      },
      invalidatesTags: ['Repair'],
    }),
  }),
});

export const {
  useGetRepairsQuery,
  useGetRepairQuery,
  useCreateRepairMutation,
  useUpdateRepairMutation,
  useDeleteRepairMutation,
} = repairsApi;
