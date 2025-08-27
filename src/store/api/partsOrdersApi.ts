import { createApi } from '@reduxjs/toolkit/query/react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import type { PartsOrder, PartsOrderFormData, PartsOrderWithItems, OrderStatusUpdate } from '../../types/partsOrder';

// Phase 1: Basic Parts Ordering API using Firebase callable functions
// Simple CRUD operations without complex supplier integration

// Custom base query for Firebase callable functions
const firebaseBaseQuery = () => async (args: { functionName: string; data: unknown }) => {
  try {
    const { functionName, data } = args;
    const callable = httpsCallable(functions, functionName);
    const result = await callable(data);
    return { data: result.data };
  } catch (error: unknown) {
    const errorObj = error as { code?: string; message?: string };
    return { 
      error: { 
        status: errorObj.code || 'UNKNOWN_ERROR',
        data: errorObj.message || 'An unknown error occurred'
      } 
    };
  }
};

export const partsOrdersApi = createApi({
  reducerPath: 'partsOrdersApi',
  baseQuery: firebaseBaseQuery(),
  tagTypes: ['PartsOrder'],
  endpoints: (builder) => ({
    // Get all parts orders for a tenant
    getPartsOrders: builder.query<PartsOrderWithItems[], string>({
      query: (tenantId) => ({
        functionName: 'getPartsOrders',
        data: { tenantId },
      }),
      transformResponse: (response: { orders: PartsOrderWithItems[] }) => 
        response.orders.map(order => ({
          ...order,
          orderDate: new Date(order.orderDate),
          expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery) : undefined,
          updatedAt: new Date(order.updatedAt),
        })),
      providesTags: ['PartsOrder'],
    }),

    // Get a single parts order by ID
    getPartsOrder: builder.query<PartsOrderWithItems, { tenantId: string; orderId: string }>({
      query: ({ tenantId, orderId }) => ({
        functionName: 'getPartsOrder',
        data: { tenantId, orderId },
      }),
      transformResponse: (response: { order: PartsOrderWithItems }) => ({
        ...response.order,
        orderDate: new Date(response.order.orderDate),
        expectedDelivery: response.order.expectedDelivery ? new Date(response.order.expectedDelivery) : undefined,
        updatedAt: new Date(response.order.updatedAt),
      }),
      providesTags: (result, error, { orderId }) => [{ type: 'PartsOrder', id: orderId }],
    }),

    // Create a new parts order
    createPartsOrder: builder.mutation<PartsOrderWithItems, { tenantId: string; order: PartsOrderFormData }>({
      query: ({ tenantId, order }) => ({
        functionName: 'createPartsOrder',
        data: { tenantId, order },
      }),
      transformResponse: (response: { order: PartsOrderWithItems }) => ({
        ...response.order,
        orderDate: new Date(response.order.orderDate),
        expectedDelivery: response.order.expectedDelivery ? new Date(response.order.expectedDelivery) : undefined,
        updatedAt: new Date(response.order.updatedAt),
      }),
      invalidatesTags: ['PartsOrder'],
    }),

    // Update parts order status
    updateOrderStatus: builder.mutation<PartsOrder, { tenantId: string; orderId: string; status: OrderStatusUpdate['status']; notes?: string }>({
      query: ({ tenantId, orderId, status, notes }) => ({
        functionName: 'updateOrderStatus',
        data: { 
          tenantId, 
          data: { orderId, status, notes } 
        },
      }),
      transformResponse: (response: { order: PartsOrder }) => ({
        ...response.order,
        orderDate: new Date(response.order.orderDate),
        expectedDelivery: response.order.expectedDelivery ? new Date(response.order.expectedDelivery) : undefined,
        updatedAt: new Date(response.order.updatedAt),
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'PartsOrder', id: orderId },
        'PartsOrder',
      ],
    }),

    // Process parts order fulfillment
    processOrderFulfillment: builder.mutation<{ success: boolean }, { tenantId: string; orderId: string }>({
      query: ({ tenantId, orderId }) => ({
        functionName: 'processOrderFulfillment',
        data: { tenantId, orderId },
      }),
      invalidatesTags: ['PartsOrder'],
    }),

    // Delete a parts order
    deletePartsOrder: builder.mutation<{ success: boolean }, { tenantId: string; orderId: string }>({
      query: ({ tenantId, orderId }) => ({
        functionName: 'deletePartsOrder',
        data: { tenantId, orderId },
      }),
      invalidatesTags: ['PartsOrder'],
    }),
  }),
});

export const {
  useGetPartsOrdersQuery,
  useGetPartsOrderQuery,
  useCreatePartsOrderMutation,
  useUpdateOrderStatusMutation,
  useProcessOrderFulfillmentMutation,
  useDeletePartsOrderMutation,
} = partsOrdersApi;
