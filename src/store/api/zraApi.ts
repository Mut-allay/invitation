import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { validateTPIN, validateZRAInvoice, generateZRAReference } from '../../utils/zraValidation';

// ZRA API response types
export interface ZRATPINValidationResponse {
  isValid: boolean;
  businessName?: string;
  registrationDate?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  message?: string;
}

export interface ZRAInvoiceSubmissionResponse {
  success: boolean;
  zraReference: string;
  qrCode?: string;
  message: string;
  submittedAt: Date;
}

export interface ZRAComplianceReport {
  period: string;
  totalInvoices: number;
  totalAmount: number;
  totalVAT: number;
  submittedInvoices: number;
  pendingInvoices: number;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  lastSubmissionDate?: Date;
}

export interface ZRAInvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerTpin: string;
  businessName: string;
  businessTpin: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    vatExempt: boolean;
    total: number;
    vatAmount: number;
  }>;
  subtotal: number;
  totalVat: number;
  totalAmount: number;
  currency: 'ZMW';
  zraReference?: string;
  qrCode?: string;
}

// ZRA API functions
export const zraApi = {
  // Validate TPIN with ZRA
  async validateTPIN(tpin: string): Promise<ZRATPINValidationResponse> {
    try {
      if (!validateTPIN(tpin)) {
        return {
          isValid: false,
          message: 'Invalid TPIN format. Must be 10 digits.'
        };
      }

      const validateTPINFunction = httpsCallable(functions, 'validateTPIN');
      const result = await validateTPINFunction({ tpin });
      
      return result.data as ZRATPINValidationResponse;
    } catch (error) {
      console.error('Error validating TPIN:', error);
      return {
        isValid: false,
        message: 'Failed to validate TPIN. Please try again.'
      };
    }
  },

  // Submit invoice to ZRA
  async submitInvoiceToZRA(invoice: ZRAInvoiceData): Promise<ZRAInvoiceSubmissionResponse> {
    try {
      // Validate invoice before submission
      const validation = validateZRAInvoice(invoice as unknown as Record<string, unknown>);
      if (!validation.isValid) {
        return {
          success: false,
          zraReference: '',
          message: `Validation failed: ${validation.errors.join(', ')}`,
          submittedAt: new Date()
        };
      }

      const submitToZRAFunction = httpsCallable(functions, 'submitToZRA');
      const result = await submitToZRAFunction({
        tenantId: 'default', // This should come from context
        invoiceData: {
          ...invoice,
          zraReference: generateZRAReference()
        }
      });

      return result.data as ZRAInvoiceSubmissionResponse;
    } catch (error) {
      console.error('Error submitting invoice to ZRA:', error);
      return {
        success: false,
        zraReference: '',
        message: 'Failed to submit invoice to ZRA. Please try again.',
        submittedAt: new Date()
      };
    }
  },

  // Get ZRA compliance report
  async getComplianceReport(period: string): Promise<ZRAComplianceReport> {
    try {
      const getComplianceReportFunction = httpsCallable(functions, 'getZRAComplianceReport');
      const result = await getComplianceReportFunction({ period });
      
      return result.data as ZRAComplianceReport;
    } catch (error) {
      console.error('Error fetching ZRA compliance report:', error);
      throw new Error('Failed to fetch ZRA compliance report');
    }
  },

  // Generate QR code for ZRA compliance
  async generateZRAQRCode(invoiceData: ZRAInvoiceData): Promise<string> {
    try {
      const generateQRFunction = httpsCallable(functions, 'generateZRAQRCode');
      const result = await generateQRFunction({ invoiceData });
      
      return result.data as string;
    } catch (error) {
      console.error('Error generating ZRA QR code:', error);
      // Return a fallback QR code
      return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" font-size="8">ZRA:${invoiceData.invoiceNumber}</text></svg>`)}`;
    }
  },

  // Check ZRA API status
  async checkZRAStatus(): Promise<{ status: 'ONLINE' | 'OFFLINE'; message: string }> {
    try {
      const checkStatusFunction = httpsCallable(functions, 'checkZRAStatus');
      const result = await checkStatusFunction();
      
      return result.data as { status: 'ONLINE' | 'OFFLINE'; message: string };
    } catch (error) {
      console.error('Error checking ZRA status:', error);
      return {
        status: 'OFFLINE',
        message: 'Unable to connect to ZRA services'
      };
    }
  },

  // Get ZRA VAT rates
  async getZRAVATRates(): Promise<Array<{ value: number; label: string; description: string }>> {
    try {
      const getVATRatesFunction = httpsCallable(functions, 'getZRAVATRates');
      const result = await getVATRatesFunction();
      
      return result.data as Array<{ value: number; label: string; description: string }>;
    } catch (error) {
      console.error('Error fetching ZRA VAT rates:', error);
      // Return default ZRA VAT rates
      return [
        { value: 0, label: '0% (Exempt)', description: 'VAT Exempt items' },
        { value: 16, label: '16% (Standard)', description: 'Standard VAT rate in Zambia' }
      ];
    }
  },

  // Submit batch invoices to ZRA
  async submitBatchInvoices(invoices: ZRAInvoiceData[]): Promise<{
    success: boolean;
    submitted: number;
    failed: number;
    results: Array<{ invoiceNumber: string; success: boolean; message: string }>;
  }> {
    try {
      const submitBatchFunction = httpsCallable(functions, 'submitBatchToZRA');
      const result = await submitBatchFunction({ invoices });
      
      return result.data as {
        success: boolean;
        submitted: number;
        failed: number;
        results: Array<{ invoiceNumber: string; success: boolean; message: string }>;
      };
    } catch (error) {
      console.error('Error submitting batch invoices to ZRA:', error);
      return {
        success: false,
        submitted: 0,
        failed: invoices.length,
        results: invoices.map(invoice => ({
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: 'Batch submission failed'
        }))
      };
    }
  }
};

// ZRA API hooks for React components
export const useZRAValidation = () => {
  const validateTPINWithZRA = async (tpin: string): Promise<ZRATPINValidationResponse> => {
    return await zraApi.validateTPIN(tpin);
  };

  return { validateTPINWithZRA };
};

export const useZRASubmission = () => {
  const submitInvoice = async (invoice: ZRAInvoiceData): Promise<ZRAInvoiceSubmissionResponse> => {
    return await zraApi.submitInvoiceToZRA(invoice);
  };

  const submitBatch = async (invoices: ZRAInvoiceData[]) => {
    return await zraApi.submitBatchInvoices(invoices);
  };

  return { submitInvoice, submitBatch };
};

export const useZRACompliance = () => {
  const getComplianceReport = async (period: string): Promise<ZRAComplianceReport> => {
    return await zraApi.getComplianceReport(period);
  };

  const checkStatus = async () => {
    return await zraApi.checkZRAStatus();
  };

  return { getComplianceReport, checkStatus };
};
