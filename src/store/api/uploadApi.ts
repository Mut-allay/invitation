import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UploadedFile } from '../../types/upload';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadedFile, { tenantId: string; file: File; metadata?: any }>({
      query: ({ tenantId, file, metadata }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);
        if (metadata) {
          formData.append('metadata', JSON.stringify(metadata));
        }
        
        return {
          url: `/tenant/${tenantId}/upload`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Upload'],
    }),
    
    getUploadedFiles: builder.query<UploadedFile[], { tenantId: string; type?: string; itemId?: string }>({
      query: ({ tenantId, type, itemId }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (itemId) params.append('itemId', itemId);
        
        return `/tenant/${tenantId}/files?${params.toString()}`;
      },
      providesTags: ['Upload'],
    }),
    
    deleteFile: builder.mutation<void, { tenantId: string; fileId: string }>({
      query: ({ tenantId, fileId }) => ({
        url: `/tenant/${tenantId}/files/${fileId}`,
        method: 'DELETE',
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