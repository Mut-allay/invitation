export interface UploadedFile {
  id: string;
  tenantId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  path: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: {
    vehicleId?: string;
    customerId?: string;
    repairId?: string;
    type: 'vehicle_image' | 'document' | 'invoice' | 'receipt';
  };
}

export interface UploadFile {
  file: File;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadMetadata {
  vehicleId?: string;
  customerId?: string;
  repairId?: string;
  type: 'vehicle_image' | 'document' | 'invoice' | 'receipt';
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  folder: string;
} 