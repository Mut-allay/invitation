
import { api } from '../api';
import { PartnerBusiness } from '../../types/partnerBusiness';

interface InvitePartnerRequest {
  tenantId: string;
  partnerTenantId: string;
  permissions: {
    canViewInventory: boolean;
    canPlaceOrders: boolean;
  };
}

export const partnerBusinessApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<PartnerBusiness[], string>({
      query: (tenantId) => `tenant/${tenantId}/partners`,
      providesTags: ['Partner'],
    }),
    invitePartner: builder.mutation<void, InvitePartnerRequest>({
      query: ({ tenantId, ...body }) => ({
        url: `tenant/${tenantId}/partners/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Partner'],
    }),
    acceptInvitation: builder.mutation<void, { invitationId: string }>({
      query: ({ invitationId }) => ({
        url: `invitations/${invitationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Partner'],
    }),
    getPartnerCatalog: builder.query<any[], { tenantId: string; partnerTenantId: string }>({
      query: ({ tenantId, partnerTenantId }) => `tenant/${tenantId}/partners/${partnerTenantId}/catalog`,
      providesTags: ['PartnerCatalog'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useInvitePartnerMutation,
  useAcceptInvitationMutation,
  useGetPartnerCatalogQuery,
} = partnerBusinessApi;
