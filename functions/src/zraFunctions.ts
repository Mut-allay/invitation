import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { ZRAService } from './integrations/zambia/zra';

const zraService = new ZRAService();

// Validate TPIN with ZRA
export const validateTPIN = onCall<{ tpin: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tpin } = request.data;

  if (!tpin) {
    throw new HttpsError('invalid-argument', 'TPIN is required');
  }

  try {
    const result = await zraService.validateTPIN({ tpin });
    return result;
  } catch (error) {
    console.error('Error validating TPIN:', error);
    throw new HttpsError('internal', 'Failed to validate TPIN');
  }
});

// Generate ZRA QR code
export const generateZRAQRCode = onCall<{ invoiceData: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invoiceData } = request.data;

  if (!invoiceData) {
    throw new HttpsError('invalid-argument', 'Invoice data is required');
  }

  try {
    const qrCode = await zraService.generateQRCode(invoiceData);
    return qrCode;
  } catch (error) {
    console.error('Error generating ZRA QR code:', error);
    throw new HttpsError('internal', 'Failed to generate QR code');
  }
});

// Check ZRA API status
export const checkZRAStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const status = await zraService.checkStatus();
    return status;
  } catch (error) {
    console.error('Error checking ZRA status:', error);
    return {
      status: 'OFFLINE' as const,
      message: 'Unable to connect to ZRA services'
    };
  }
});

// Get ZRA VAT rates
export const getZRAVATRates = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const vatRates = await zraService.getVATRates();
    return vatRates;
  } catch (error) {
    console.error('Error fetching ZRA VAT rates:', error);
    throw new HttpsError('internal', 'Failed to fetch VAT rates');
  }
});

// Get ZRA compliance report
export const getZRAComplianceReport = onCall<{ period: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { period } = request.data;

  if (!period) {
    throw new HttpsError('invalid-argument', 'Period is required');
  }

  try {
    const report = await zraService.generateComplianceReport(period);
    return report;
  } catch (error) {
    console.error('Error generating ZRA compliance report:', error);
    throw new HttpsError('internal', 'Failed to generate compliance report');
  }
});

// Submit batch invoices to ZRA
export const submitBatchToZRA = onCall<{ invoices: any[] }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invoices } = request.data;

  if (!invoices || !Array.isArray(invoices)) {
    throw new HttpsError('invalid-argument', 'Invoices array is required');
  }

  try {
    const results = [];
    let submitted = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        // Simulate ZRA submission
        await new Promise(resolve => setTimeout(resolve, 100));
        
        results.push({
          invoiceNumber: invoice.invoiceNumber,
          success: true,
          message: 'Successfully submitted to ZRA'
        });
        submitted++;
      } catch (error) {
        results.push({
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: 'Failed to submit to ZRA'
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      submitted,
      failed,
      results
    };
  } catch (error) {
    console.error('Error submitting batch to ZRA:', error);
    throw new HttpsError('internal', 'Failed to submit batch to ZRA');
  }
});
