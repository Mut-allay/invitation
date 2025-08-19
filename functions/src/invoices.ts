import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const auth = getAuth();

// Get invoices for a tenant
export const getInvoices = onCall<{ tenantId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const invoicesRef = db.collection('invoices');
    const snapshot = await invoicesRef.where('tenantId', '==', tenantId).get();
    
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
    }));

    return { invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new HttpsError('internal', 'Failed to fetch invoices');
  }
});

// Get a single invoice
export const getInvoice = onCall<{ tenantId: string; invoiceId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoiceId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this invoice');
    }

    return {
      id: invoiceDoc.id,
      ...invoiceData,
      createdAt: invoiceData.createdAt?.toDate(),
      updatedAt: invoiceData.updatedAt?.toDate(),
      issueDate: invoiceData.issueDate?.toDate(),
      dueDate: invoiceData.dueDate?.toDate(),
      paidDate: invoiceData.paidDate?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw new HttpsError('internal', 'Failed to fetch invoice');
  }
});

// Create a new invoice
export const createInvoice = onCall<{ tenantId: string; invoice: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoice } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // Calculate VAT (16% in Zambia)
    const vatRate = 0.16;
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const invoiceData = {
      ...invoice,
      tenantId,
      invoiceNumber,
      subtotal,
      vatAmount,
      vatRate,
      totalAmount,
      taxBreakdown: {
        vat: vatAmount,
      },
      status: 'draft',
      issueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const invoiceRef = await db.collection('invoices').add(invoiceData);
    
    return {
      id: invoiceRef.id,
      ...invoiceData,
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new HttpsError('internal', 'Failed to create invoice');
  }
});

// Update an invoice
export const updateInvoice = onCall<{ tenantId: string; invoiceId: string; invoice: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoiceId, invoice } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const existingData = invoiceDoc.data();
    if (existingData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this invoice');
    }

    const updateData = {
      ...invoice,
      updatedAt: new Date(),
    };

    await invoiceRef.update(updateData);

    return {
      id: invoiceId,
      ...existingData,
      ...updateData,
    };
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw new HttpsError('internal', 'Failed to update invoice');
  }
});

// Delete an invoice
export const deleteInvoice = onCall<{ tenantId: string; invoiceId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoiceId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData?.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this invoice');
    }

    await invoiceRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw new HttpsError('internal', 'Failed to delete invoice');
  }
});

// Get payments for an invoice
export const getPayments = onCall<{ tenantId: string; invoiceId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoiceId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const paymentsRef = db.collection('payments');
    const snapshot = await paymentsRef
      .where('tenantId', '==', tenantId)
      .where('invoiceId', '==', invoiceId)
      .get();
    
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return { payments };
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new HttpsError('internal', 'Failed to fetch payments');
  }
});

// Create a payment
export const createPayment = onCall<{ tenantId: string; payment: any }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, payment } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // Start a batch write
    const batch = db.batch();

    // Create the payment document
    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      ...payment,
      tenantId,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

    return {
      id: paymentRef.id,
      ...paymentData,
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new HttpsError('internal', 'Failed to create payment');
  }
});

// Submit invoice to ZRA (placeholder for ZRA integration)
export const submitToZRA = onCall<{ tenantId: string; invoiceId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoiceId } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    // This would integrate with ZRA Smart-Invoice API
    // For now, we'll simulate the response
    const markId = `ZRA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${markId}`;

    // Update invoice with ZRA data
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    await invoiceRef.update({
      markId,
      qrCode,
      status: 'sent',
      updatedAt: new Date(),
    });

    return { markId, qrCode };
  } catch (error) {
    console.error('Error submitting to ZRA:', error);
    throw new HttpsError('internal', 'Failed to submit to ZRA');
  }
}); 