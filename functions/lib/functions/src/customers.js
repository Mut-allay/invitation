"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const v1_1 = require("firebase-functions/v1");
const zod_1 = require("zod");
// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
// Zod schema for validation
const CustomerSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
}).passthrough();
// Get customers for a tenant
exports.getCustomers = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customersRef = db.collection('customers');
        const snapshot = await customersRef.where('tenantId', '==', tenantId).get();
        const customers = snapshot.docs.map(doc => {
            var _a, _b;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
        });
        return { customers };
    }
    catch (error) {
        v1_1.logger.error('Error fetching customers:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch customers');
    }
});
// Get a single customer
exports.getCustomer = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const customerData = customerDoc.data();
        if (!customerData || customerData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        return Object.assign(Object.assign({ id: customerDoc.id }, customerData), { createdAt: (_a = customerData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = customerData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() });
    }
    catch (error) {
        v1_1.logger.error('Error fetching customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to fetch customer');
    }
});
// Create a new customer
exports.createCustomer = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customer } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerData = Object.assign(Object.assign({}, customer), { tenantId, createdAt: new Date(), updatedAt: new Date() });
        const validatedData = CustomerSchema.parse(customerData);
        const customerRef = await db.collection('customers').add(validatedData);
        const newCustomerDoc = await customerRef.get();
        return Object.assign(Object.assign({ id: customerRef.id }, newCustomerDoc.data()), { createdAt: (_b = (_a = newCustomerDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate(), updatedAt: (_d = (_c = newCustomerDoc.data()) === null || _c === void 0 ? void 0 : _c.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate() });
    }
    catch (error) {
        v1_1.logger.error('Error creating customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to create customer');
    }
});
// Update a customer
exports.updateCustomer = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId, customer } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const existingData = customerDoc.data();
        if (!existingData || existingData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        const updateData = Object.assign(Object.assign({}, customer), { tenantId, updatedAt: new Date() });
        const validatedData = CustomerSchema.parse(updateData);
        await customerRef.update(validatedData);
        return Object.assign(Object.assign({ id: customerId }, existingData), updateData);
    }
    catch (error) {
        v1_1.logger.error('Error updating customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to update customer');
    }
});
// Delete a customer
exports.deleteCustomer = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tenantId, customerId } = request.data;
    const userClaims = request.auth.token;
    if (userClaims.tenantId !== tenantId) {
        throw new https_1.HttpsError('permission-denied', 'Access denied to this tenant');
    }
    try {
        const customerRef = db.collection('customers').doc(customerId);
        const customerDoc = await customerRef.get();
        if (!customerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Customer not found');
        }
        const customerData = customerDoc.data();
        if (!customerData || customerData.tenantId !== tenantId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to this customer');
        }
        await customerRef.delete();
        return { success: true };
    }
    catch (error) {
        v1_1.logger.error('Error deleting customer:', error);
        throw new https_1.HttpsError('internal', 'Failed to delete customer');
    }
});
//# sourceMappingURL=customers.js.map