import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Order } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface RejectModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirmReject: (orderId: string, reason: string) => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('Document quality / scan resolution is unclear');
  const [customReason, setCustomReason] = useState('');

  if (!order) return null;

  const defaultReasons = [
    'Document quality / scan resolution is unclear',
    'Requested paper size (A3) currently out of stock',
    'File is corrupted or password protected',
    'Incomplete assignment sheets uploaded',
    'Other reason (specified below)',
  ];

  const handleReject = () => {
    const finalReason = reason === 'Other reason (specified below)' ? customReason : reason;
    if (!finalReason.trim()) return;
    onConfirmReject(order.id, finalReason.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Decline Order ${order.token}`}
      description="A mandatory reason will be sent immediately to the student's notification center."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            This action will mark the token as <strong>REJECTED</strong> and remove it from the active printing line.
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Rejection Reason
          </label>
          <div className="space-y-1.5">
            {defaultReasons.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  reason === r
                    ? 'border-brand-600 bg-brand-50/50 font-bold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {reason === 'Other reason (specified below)' && (
          <div>
            <label className="text-xs font-semibold text-slate-700">Detailed Message</label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain why this order could not be printed..."
              className="w-full mt-1 p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReject}
            disabled={reason === 'Other reason (specified below)' && !customReason.trim()}
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
    </Modal>
  );
};
