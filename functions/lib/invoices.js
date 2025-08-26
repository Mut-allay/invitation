"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitToZRA = exports.createPayment = exports.getPayments = exports.deleteInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoice = exports.getInvoices = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Get invoices for a tenant
exports.getInvoices = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoicesRef = db.collection('invoices');
        const snapshot = await invoicesRef.where('tenantId', '==', tenantId).get();
        const invoices = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
        });
        return { invoices };
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch invoices');
    }
});
// Get a single invoice
exports.getInvoice = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoiceId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const invoiceData = invoiceDoc.data();
        if (!invoiceData || invoiceData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this invoice');
        }
        return Object.assign(Object.assign({ id: invoiceDoc.id }, invoiceData), { createdAt: (_a = invoiceData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = invoiceData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        console.error('Error fetching invoice:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch invoice');
    }
});
// Create a new invoice
exports.createInvoice = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoice } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoiceData = Object.assign(Object.assign({}, invoice), { tenantId, createdAt: new Date(), updatedAt: new Date() });
        const invoiceRef = await db.collection('invoices').add(invoiceData);
        const newInvoiceDoc = await invoiceRef.get();
        return Object.assign(Object.assign({ id: invoiceRef.id }, newInvoiceDoc.data()), { createdAt: (_b = (_a = newInvoiceDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate(), updatedAt: (_d = (_c = newInvoiceDoc.data()) === null || _c === void 0 ? void 0 : _c.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate() });
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        throw new https_1.HttpsError('internal', 'Failed to create invoice');
    }
});
// Update an invoice
exports.updateInvoice = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoiceId, invoice } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const existingData = invoiceDoc.data();
        if (!existingData || existingData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this invoice');
        }
        const updateData = Object.assign(Object.assign({}, invoice), { updatedAt: new Date() });
        await invoiceRef.update(updateData);
        return Object.assign(Object.assign({ id: invoiceId }, existingData), updateData);
    }
    catch (error) {
        console.error('Error updating invoice:', error);
        throw new https_1.HttpsError('internal', 'Failed to update invoice');
    }
});
// Delete an invoice
exports.deleteInvoice = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoiceId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const invoiceData = invoiceDoc.data();
        if (!invoiceData || invoiceData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this invoice');
        }
        await invoiceRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting invoice:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete invoice');
    }
});
// Get payments for an invoice
exports.getPayments = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoiceId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const paymentsRef = db.collection('payments');
        const snapshot = await paymentsRef
            .where('tenantId', '==', tenantId)
            .where('invoiceId', '==', invoiceId)
            .get();
        const payments = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
        });
        return { payments };
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch payments');
    }
});
// Create a payment
exports.createPayment = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, payment } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        // Start a batch write
        const batch = db.batch();
        // Create the payment document
        const paymentRef = db.collection('payments').doc();
        const paymentData = Object.assign(Object.assign({}, payment), { tenantId, status: 'completed', createdAt: new Date(), updatedAt: new Date() });
        batch.set(paymentRef, paymentData);
        // Update invoice status to paid
        const invoiceRef = db.collection('invoices').doc(payment.invoiceId);
        batch.update(invoiceRef, {
            status: 'paid',
            paidDate: new Date(),
            paymentMethod: payment.method,
            updatedAt: new Date(),
        });
        // Commit the batch
        await batch.commit();
        return Object.assign({ id: paymentRef.id }, paymentData);
    }
    catch (error) {
        console.error('Error creating payment:', error);
        throw new https_1.HttpsError('internal', 'Failed to create payment');
    }
});
// Submit invoice to ZRA
exports.submitToZRA = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, invoiceId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const invoiceData = invoiceDoc.data();
        if (!invoiceData || invoiceData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this invoice');
        }
        // Update invoice status to submitted
        await invoiceRef.update({
            status: 'submitted_to_zra',
            submittedAt: new Date(),
            updatedAt: new Date(),
        });
        return {
            success: true,
            message: 'Invoice submitted to ZRA successfully',
            submittedAt: new Date(),
        };
    }
    catch (error) {
        console.error('Error submitting invoice to ZRA:', error);
        throw new https_1.HttpsError('internal', 'Failed to submit invoice to ZRA');
    }
});
//# sourceMappingURL=invoices.js.map