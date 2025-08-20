import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { UploadProgress, UploadConfig } from '../../types/upload';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileUpload: (file: File) => Promise<void>;
  uploads: UploadProgress[];
  config: UploadConfig;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onFileUpload,
  uploads,
  config,
  className = ''
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
    acceptedFiles.forEach(file => {
      onFileUpload(file);
    });
  }, [onFilesSelected, onFileUpload]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: config.allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: config.maxFileSize,
    maxFiles: config.maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          or click to select files
        </p>
        <div className="text-xs text-gray-500">
          <p>Max file size: {formatFileSize(config.maxFileSize)}</p>
          <p>Allowed types: {config.allowedTypes.join(', ')}</p>
          <p>Max files: {config.maxFiles}</p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
          {uploads.map((upload, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon(upload.fileName)}
                  <span className="text-sm font-medium text-gray-900">
                    {upload.fileName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {upload.status === 'completed' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {upload.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
              
              {upload.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              )}
              
              {upload.status === 'error' && (
                <p className="text-sm text-red-600">{upload.error}</p>
              )}
              
              {upload.status === 'completed' && (
                <p className="text-sm text-green-600">Upload completed</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 