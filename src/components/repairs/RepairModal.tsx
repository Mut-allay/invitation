import React, { useState, useEffect } from 'react';
import type { Repair, RepairFormData } from '../../types/index';

interface RepairModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
}

export const RepairModal: React.FC<RepairModalProps> = ({ repair, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Repair Details</h2>
        <p className="text-gray-600 mb-4">Repair #{repair.id.slice(-6)}</p>
        <p className="text-gray-700 mb-4">{repair.reportedIssues}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 