import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { db } from './firebase-admin';

// Type definitions
interface InvoiceData {
  tenantId: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

// Get invoices for a tenant
export const getInvoices = onCall<{ tenantId: string }>(async (request: CallableRequest<{ tenantId: string }>) => {
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
    
    const invoices = snapshot.docs.map(doc => {
      const data = doc.data() as InvoiceData;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return { invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new HttpsError('internal', 'Failed to fetch invoices');
  }
});

// Get a single invoice
export const getInvoice = onCall<{ tenantId: string; invoiceId: string }>(async (request: CallableRequest<{ tenantId: string; invoiceId: string }>) => {
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

    const invoiceData = invoiceDoc.data() as InvoiceData;
    if (!invoiceData || invoiceData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this invoice');
    }

    return {
      id: invoiceDoc.id,
      ...invoiceData,
      createdAt: invoiceData.createdAt?.toDate(),
      updatedAt: invoiceData.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw new HttpsError('internal', 'Failed to fetch invoice');
  }
});

// Create a new invoice
export const createInvoice = onCall<{ tenantId: string; invoice: InvoiceData }>(async (request: CallableRequest<{ tenantId: string; invoice: InvoiceData }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tenantId, invoice } = request.data;
  const userClaims = request.auth.token;

  if (userClaims.tenantId !== tenantId) {
    throw new HttpsError('permission-denied', 'Access denied to this tenant');
  }

  try {
    const invoiceData = {
      ...invoice,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const invoiceRef = await db.collection('invoices').add(invoiceData);
    const newInvoiceDoc = await invoiceRef.get();

    return {
      id: invoiceRef.id,
      ...newInvoiceDoc.data(),
      createdAt: newInvoiceDoc.data()?.createdAt?.toDate(),
      updatedAt: newInvoiceDoc.data()?.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new HttpsError('internal', 'Failed to create invoice');
  }
});

// Update an invoice
export const updateInvoice = onCall<{ tenantId: string; invoiceId: string; invoice: InvoiceData }>(async (request: CallableRequest<{ tenantId: string; invoiceId: string; invoice: InvoiceData }>) => {
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

    const existingData = invoiceDoc.data() as InvoiceData;
    if (!existingData || existingData.tenantId !== tenantId) {
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
export const deleteInvoice = onCall<{ tenantId: string; invoiceId: string }>(async (request: CallableRequest<{ tenantId: string; invoiceId: string }>) => {
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

    const invoiceData = invoiceDoc.data() as InvoiceData;
    if (!invoiceData || invoiceData.tenantId !== tenantId) {
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

// Submit invoice to ZRA
export const submitToZRA = onCall<{ tenantId: string; invoiceId: string }>(async (request: CallableRequest<{ tenantId: string; invoiceId: string }>) => {
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

    const invoiceData = invoiceDoc.data() as InvoiceData;
    if (!invoiceData || invoiceData.tenantId !== tenantId) {
      throw new HttpsError('permission-denied', 'Access denied to this invoice');
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
  } catch (error) {
    console.error('Error submitting invoice to ZRA:', error);
    throw new HttpsError('internal', 'Failed to submit invoice to ZRA');
  }
}); 