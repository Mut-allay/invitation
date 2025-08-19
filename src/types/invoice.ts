export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  saleId?: string;
  repairId?: string;
  customerId: string;
  vehicleId?: string;
  totalAmount: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  taxBreakdown: {
    vat: number;
    otherTaxes?: number;
  };
  markId?: string; // ZRA Mark ID
  qrCode?: string; // ZRA QR Code
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  reference?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'vehicle' | 'service' | 'part' | 'labor';
  itemId?: string; // Reference to vehicle, repair, or inventory item
}

export interface InvoiceFormData {
  customerId: string;
  vehicleId?: string;
  saleId?: string;
  repairId?: string;
  items: InvoiceItemFormData[];
  dueDate: Date;
  notes?: string;
}

export interface InvoiceItemFormData {
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'vehicle' | 'service' | 'part' | 'labor';
  itemId?: string;
}

export interface PaymentFormData {
  invoiceId: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  reference?: string;
  notes?: string;
} 