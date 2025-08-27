
import { api } from '../api';
import { PartsEqualization } from '../../types/partsEqualization';

export const paymentEqualizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEqualizations: builder.query<PartsEqualization[], string>({
      query: (tenantId) => `tenant/${tenantId}/parts-equalizations`,
      providesTags: ['PartsEqualization'],
    }),
    createEqualization: builder.mutation<void, { tenantId: string }>({
      query: ({ tenantId }) => ({
        url: `tenant/${tenantId}/parts-equalizations`,
        method: 'POST',
      }),
      invalidatesTags: ['PartsEqualization'],
    }),
    processSettlement: builder.mutation<void, { tenantId: string; equalizationId: string; settlementDetails: any }>({
      query: ({ tenantId, equalizationId, settlementDetails }) => ({
        url: `tenant/${tenantId}/parts-equalizations/${equalizationId}/settle`,
        method: 'POST',
        body: settlementDetails,
      }),
      invalidatesTags: ['PartsEqualization'],
    }),
  }),
});

export const {
  useGetEqualizationsQuery,
  useCreateEqualizationMutation,
  useProcessSettlementMutation,
} = paymentEqualizationApi;
