import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../config/firebase';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['Vehicle', 'Customer', 'Repair', 'Invoice', 'Inventory', 'PartsEqualization'],
}); 