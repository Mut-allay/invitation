
import React, { useState } from 'react';
import { PartsEqualization } from '../../types/partsEqualization';
import { useProcessSettlementMutation } from '../../store/api/paymentEqualizationApi';

interface SettlementFormProps {
  equalization: PartsEqualization;
  onClose: () => void;
}

export const SettlementForm: React.FC<SettlementFormProps> = ({ equalization, onClose }) => {
  const [settlementMethod, setSettlementMethod] = useState<'mobile_money' | 'bank_transfer' | 'cash'>('bank_transfer');
  const [settlementReference, setSettlementReference] = useState('');
  const [processSettlement, { isLoading }] = useProcessSettlementMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await processSettlement({
        tenantId: equalization.tenantId,
        equalizationId: equalization.id,
        settlementDetails: {
          settlementMethod,
          settlementReference,
        },
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to process settlement:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Settle Payment for {equalization.period}</h2>
      <p>Total Amount: {equalization.totalAmount.toFixed(2)}</p>
      <div>
        <label htmlFor="settlementMethod">Settlement Method</label>
        <select
          id="settlementMethod"
          value={settlementMethod}
          onChange={(e) => setSettlementMethod(e.target.value as any)}
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="cash">Cash</option>
        </select>
      </div>
      <div>
        <label htmlFor="settlementReference">Reference</label>
        <input
          id="settlementReference"
          type="text"
          value={settlementReference}
          onChange={(e) => setSettlementReference(e.target.value)}
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Settle Payment'}
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};
