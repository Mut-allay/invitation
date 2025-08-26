import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UploadedFile } from '../../types/index';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadedFile, { tenantId: string; file: File }>({
      query: ({ tenantId, file }) => ({
        url: `/tenant/${tenantId}/upload`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: ['Upload'],
    }),
  }),
});

export const { useUploadFileMutation } = uploadApi; 