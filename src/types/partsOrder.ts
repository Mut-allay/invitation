// Phase 1: Basic Parts Order Types (Simple Implementation)
// No complex supplier integration - just basic parts ordering functionality

export interface PartsOrder {
  id: string;
  tenantId: string;
  supplierName: string;          // Simple string, not complex supplier integration
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';  // Basic statuses only
  totalAmount: number;
  orderDate: Date;
  expectedDelivery?: Date;
  notes?: string;
  createdBy: string;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  partName: string;              // Simple string, not complex inventory linking
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

// Form data interfaces for creating/updating orders
export interface PartsOrderFormData {
  supplierName: string;
  expectedDelivery?: Date;
  notes?: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  partName: string;
  qty: number;
  unitPrice: number;
}

// API response types
export interface PartsOrderWithItems extends PartsOrder {
  items: OrderItem[];
}

// Status update interface
export interface OrderStatusUpdate {
  status: PartsOrder['status'];
  notes?: string;
}
