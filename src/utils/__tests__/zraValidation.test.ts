import {
  validateTPIN,
  formatTPIN,
  generateZRAInvoiceNumber,
  calculateVATAmount,
  validateZRAInvoice,
  isZRACompliant,
  generateZRAReference,
  validateZRAVATRate,
  getZRAVATRates,
  formatZMW,
  validateZRADates,
  generateZRAQRData
} from '../zraValidation';

describe('ZRA Validation Utilities', () => {
  describe('validateTPIN', () => {
    it('should validate correct 10-digit TPIN', () => {
      expect(validateTPIN('1234567890')).toBe(true);
    });

    it('should reject TPIN with less than 10 digits', () => {
      expect(validateTPIN('123456789')).toBe(false);
    });

    it('should reject TPIN with more than 10 digits', () => {
      expect(validateTPIN('12345678901')).toBe(false);
    });

    it('should reject TPIN with non-numeric characters', () => {
      expect(validateTPIN('123456789a')).toBe(false);
    });

    it('should reject empty TPIN', () => {
      expect(validateTPIN('')).toBe(false);
    });
  });

  describe('formatTPIN', () => {
    it('should format 10-digit TPIN with dashes', () => {
      expect(formatTPIN('1234567890')).toBe('123-456-7890');
    });

    it('should handle TPIN with non-numeric characters', () => {
      expect(formatTPIN('123-456-7890')).toBe('123-456-7890');
    });

    it('should handle incomplete TPIN', () => {
      expect(formatTPIN('123456')).toBe('123456');
    });
  });

  describe('generateZRAInvoiceNumber', () => {
    it('should generate invoice number with correct format', () => {
      const invoiceNumber = generateZRAInvoiceNumber();
      expect(invoiceNumber).toMatch(/^ZRA-\d{8}-\d{3}$/);
    });

    it('should generate unique invoice numbers', () => {
      const number1 = generateZRAInvoiceNumber();
      const number2 = generateZRAInvoiceNumber();
      expect(number1).not.toBe(number2);
    });
  });

  describe('calculateVATAmount', () => {
    it('should calculate VAT for standard rate', () => {
      expect(calculateVATAmount(100, 16)).toBe(16);
    });

    it('should return 0 for VAT exempt items', () => {
      expect(calculateVATAmount(100, 16, true)).toBe(0);
    });

    it('should handle decimal amounts', () => {
      expect(calculateVATAmount(99.99, 16)).toBe(16);
    });
  });

  describe('validateZRAInvoice', () => {
    const validInvoice = {
      invoiceNumber: 'ZRA-20241201-001',
      invoiceDate: new Date(),
      customerName: 'Test Customer',
      customerTpin: '1234567890',
      businessName: 'Test Business',
      businessTpin: '0987654321',
      items: [{
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        vatRate: 16,
        vatExempt: false,
        total: 116,
        vatAmount: 16
      }],
      subtotal: 100,
      totalVat: 16,
      totalAmount: 116,
      currency: 'ZMW' as const
    };

    it('should validate correct invoice', () => {
      const result = validateZRAInvoice(validInvoice);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invoice without customer name', () => {
      const invalidInvoice = { ...validInvoice, customerName: '' };
      const result = validateZRAInvoice(invalidInvoice);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('customerName: Customer name is required');
    });

    it('should reject invoice with invalid TPIN', () => {
      const invalidInvoice = { ...validInvoice, customerTpin: '123' };
      const result = validateZRAInvoice(invalidInvoice);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('customerTpin: Customer TPIN must be exactly 10 digits');
    });

    it('should reject invoice without items', () => {
      const invalidInvoice = { ...validInvoice, items: [] };
      const result = validateZRAInvoice(invalidInvoice);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('items: At least one item is required');
    });
  });

  describe('isZRACompliant', () => {
    it('should return true for compliant business', () => {
      expect(isZRACompliant('1234567890', 'Test Business')).toBe(true);
    });

    it('should return false for invalid TPIN', () => {
      expect(isZRACompliant('123', 'Test Business')).toBe(false);
    });

    it('should return false for empty business name', () => {
      expect(isZRACompliant('1234567890', '')).toBe(false);
    });
  });

  describe('generateZRAReference', () => {
    it('should generate reference with correct format', () => {
      const reference = generateZRAReference();
      expect(reference).toMatch(/^ZRA-REF-\d+-[A-Z0-9]{9}$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateZRAReference();
      const ref2 = generateZRAReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('validateZRAVATRate', () => {
    it('should accept standard ZRA VAT rates', () => {
      expect(validateZRAVATRate(0)).toBe(true);
      expect(validateZRAVATRate(16)).toBe(true);
    });

    it('should reject non-standard VAT rates', () => {
      expect(validateZRAVATRate(10)).toBe(false);
      expect(validateZRAVATRate(20)).toBe(false);
    });
  });

  describe('getZRAVATRates', () => {
    it('should return ZRA VAT rate options', () => {
      const rates = getZRAVATRates();
      expect(rates).toHaveLength(2);
      expect(rates[0].value).toBe(0);
      expect(rates[1].value).toBe(16);
    });
  });

  describe('formatZMW', () => {
    it('should format currency in Zambian Kwacha', () => {
      expect(formatZMW(100)).toContain('ZMW');
      expect(formatZMW(100)).toContain('100.00');
    });

    it('should handle decimal amounts', () => {
      expect(formatZMW(99.99)).toContain('99.99');
    });
  });

  describe('validateZRADates', () => {
    it('should validate correct invoice dates', () => {
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(validateZRADates(invoiceDate, dueDate)).toBe(true);
    });

    it('should reject due date before invoice date', () => {
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate.getTime() - 24 * 60 * 60 * 1000);
      expect(validateZRADates(invoiceDate, dueDate)).toBe(false);
    });
  });

  describe('generateZRAQRData', () => {
    it('should generate QR data with invoice information', () => {
      const invoice = {
        invoiceNumber: 'ZRA-20241201-001',
        businessTpin: '1234567890',
        customerTpin: '0987654321',
        totalAmount: 116,
        totalVat: 16,
        invoiceDate: new Date('2024-12-01'),
        zraReference: 'ZRA-REF-123'
      };

      const qrData = generateZRAQRData(invoice);
      const parsed = JSON.parse(qrData);
      
      expect(parsed.invoiceNumber).toBe('ZRA-20241201-001');
      expect(parsed.businessTpin).toBe('1234567890');
      expect(parsed.customerTpin).toBe('0987654321');
      expect(parsed.totalAmount).toBe(116);
      expect(parsed.totalVat).toBe(16);
    });
  });
});
