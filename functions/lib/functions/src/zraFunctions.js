"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitBatchToZRA = exports.getZRAComplianceReport = exports.getZRAVATRates = exports.checkZRAStatus = exports.generateZRAQRCode = exports.validateTPIN = void 0;
const https_1 = require("firebase-functions/v2/https");
const zra_1 = require("./integrations/zambia/zra");
const zraService = new zra_1.ZRAService();
// Validate TPIN with ZRA
exports.validateTPIN = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tpin } = request.data;
    if (!tpin) {
        throw new https_1.HttpsError('invalid-argument', 'TPIN is required');
    }
    try {
        const result = await zraService.validateTPIN({ tpin });
        return result;
    }
    catch (error) {
        console.error('Error validating TPIN:', error);
        throw new https_1.HttpsError('internal', 'Failed to validate TPIN');
    }
});
// Generate ZRA QR code
exports.generateZRAQRCode = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { invoiceData } = request.data;
    if (!invoiceData) {
        throw new https_1.HttpsError('invalid-argument', 'Invoice data is required');
    }
    try {
        const qrCode = await zraService.generateQRCode(invoiceData);
        return qrCode;
    }
    catch (error) {
        console.error('Error generating ZRA QR code:', error);
        throw new https_1.HttpsError('internal', 'Failed to generate QR code');
    }
});
// Check ZRA API status
exports.checkZRAStatus = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const status = await zraService.checkStatus();
        return status;
    }
    catch (error) {
        console.error('Error checking ZRA status:', error);
        return {
            status: 'OFFLINE',
            message: 'Unable to connect to ZRA services'
        };
    }
});
// Get ZRA VAT rates
exports.getZRAVATRates = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const vatRates = await zraService.getVATRates();
        return vatRates;
    }
    catch (error) {
        console.error('Error fetching ZRA VAT rates:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch VAT rates');
    }
});
// Get ZRA compliance report
exports.getZRAComplianceReport = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { period } = request.data;
    if (!period) {
        throw new https_1.HttpsError('invalid-argument', 'Period is required');
    }
    try {
        const report = await zraService.generateComplianceReport(period);
        return report;
    }
    catch (error) {
        console.error('Error generating ZRA compliance report:', error);
        throw new https_1.HttpsError('internal', 'Failed to generate compliance report');
    }
});
// Submit batch invoices to ZRA
exports.submitBatchToZRA = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { invoices } = request.data;
    if (!invoices || !Array.isArray(invoices)) {
        throw new https_1.HttpsError('invalid-argument', 'Invoices array is required');
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Error submitting batch to ZRA:', error);
        throw new https_1.HttpsError('internal', 'Failed to submit batch to ZRA');
    }
});
//# sourceMappingURL=zraFunctions.js.map