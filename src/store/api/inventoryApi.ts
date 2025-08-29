import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { vehiclesService } from '../../services/firestoreService';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryItem[], { tenantId: string }>({
      async queryFn(arg) {
        try {
          // For now, we'll use vehicles as inventory items
          const vehicles = await vehiclesService.getAll(arg.tenantId);
          // Ensure we always return an array, even if the service returns undefined/null
          const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
          const inventoryItems: InventoryItem[] = safeVehicles.map(vehicle => ({
            id: vehicle.id,
            name: `${vehicle.make} ${vehicle.model}`,
            description: `Vehicle - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            category: 'Vehicles',
            quantity: 1,
            unitPrice: 50000, // Default price
            supplier: 'Auto Supplier',
            tenantId: vehicle.tenantId,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
          }));
          return { data: inventoryItems };
        } catch (error) {
          console.error('Error fetching inventory:', error);
          return { data: [] };
        }
      },
      providesTags: ['Inventory'],
    }),
    
    getInventoryItem: builder.query<InventoryItem, { tenantId: string; itemId: string }>({
      async queryFn(arg) {
        try {
          const vehicle = await vehiclesService.getById(arg.itemId);
          if (!vehicle) {
            return { error: { status: 'NOT_FOUND', error: 'Inventory item not found' } };
          }
          
          const inventoryItem: InventoryItem = {
            id: vehicle.id,
            name: `${vehicle.make} ${vehicle.model}`,
            description: `Vehicle - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            category: 'Vehicles',
            quantity: 1,
            unitPrice: 50000,
            supplier: 'Auto Supplier',
            tenantId: vehicle.tenantId,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
          };
          
          return { data: inventoryItem };
        } catch (error) {
          console.error('Error fetching inventory item:', error);
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch inventory item' } };
        }
      },
      providesTags: (result, error, { itemId }) => [{ type: 'Inventory', id: itemId }],
    }),

    createInventoryItem: builder.mutation<string, { tenantId: string; item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> }>({
      async queryFn(arg) {
        try {
          // Convert inventory item to vehicle for storage
          const vehicle = {
            make: arg.item.name.split(' ')[0],
            model: arg.item.name.split(' ').slice(1).join(' '),
            year: new Date().getFullYear(),
            plateNumber: `INV-${Date.now()}`,
            customerId: '',
            tenantId: arg.item.tenantId,
          };
          
          const vehicleId = await vehiclesService.add(vehicle);
          if (!vehicleId) {
            return { error: { status: 'CREATE_ERROR', error: 'Failed to create inventory item' } };
          }
          return { data: vehicleId };
        } catch (error) {
          console.error('Error creating inventory item:', error);
          return { error: { status: 'CREATE_ERROR', error: 'Failed to create inventory item' } };
        }
      },
      invalidatesTags: ['Inventory'],
    }),

    updateInventoryItem: builder.mutation<boolean, { tenantId: string; itemId: string; item: Partial<InventoryItem> }>({
      async queryFn(arg) {
        try {
          const success = await vehiclesService.update(arg.itemId, {
            make: arg.item.name?.split(' ')[0] || '',
            model: arg.item.name?.split(' ').slice(1).join(' ') || '',
          });
          return { data: success };
        } catch (error) {
          console.error('Error updating inventory item:', error);
          return { error: { status: 'UPDATE_ERROR', error: 'Failed to update inventory item' } };
        }
      },
      invalidatesTags: (result, error, { itemId }) => [
        { type: 'Inventory', id: itemId },
        'Inventory'
      ],
    }),

    deleteInventoryItem: builder.mutation<boolean, { tenantId: string; itemId: string }>({
      async queryFn(arg) {
        try {
          const success = await vehiclesService.delete(arg.itemId);
          return { data: success };
        } catch (error) {
          console.error('Error deleting inventory item:', error);
          return { error: { status: 'DELETE_ERROR', error: 'Failed to delete inventory item' } };
        }
      },
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi; 