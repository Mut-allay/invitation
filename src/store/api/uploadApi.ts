import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UploadFile, UploadMetadata } from '../../types/index';
import { getApiBaseUrl } from '../../config/api';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFile, { tenantId: string; file: File; metadata?: UploadMetadata }>({
      query: ({ tenantId, file, metadata }) => ({
        url: '/uploadFile',
        method: 'POST',
        body: { tenantId, file, metadata },
      }),
      invalidatesTags: ['Upload'],
    }),
    getUploadedFiles: builder.query<UploadFile[], { tenantId: string; type?: string; itemId?: string }>({
      query: ({ tenantId, type, itemId }) => ({
        url: '/getUploadedFiles',
        method: 'POST',
        body: { tenantId, type, itemId },
      }),
      providesTags: ['Upload'],
    }),
    deleteFile: builder.mutation<void, { tenantId: string; fileId: string }>({
      query: ({ tenantId, fileId }) => ({
        url: '/deleteFile',
        method: 'POST',
        body: { tenantId, fileId },
      }),
      invalidatesTags: ['Upload'],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetUploadedFilesQuery,
  useDeleteFileMutation,
} = uploadApi; 