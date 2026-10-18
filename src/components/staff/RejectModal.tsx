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
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            This action will mark the token as <strong className="text-rose-400">REJECTED</strong> and remove it from the active printing line.
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Select Rejection Reason
          </label>
          <div className="space-y-1.5">
            {defaultReasons.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  reason === r
                    ? 'border-[#F87171] bg-[#F87171]/10 font-bold text-[#F1F5F9] ring-1 ring-[#F87171]/30'
                    : 'border-[#273244] text-[#94A3B8] hover:bg-[#18212C]'
                }`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="text-[#F87171] focus:ring-[#F87171]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {reason === 'Other reason (specified below)' && (
          <div>
            <label className="text-xs font-semibold text-[#94A3B8]">Detailed Message</label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain why this order could not be printed..."
              className="w-full mt-1 p-3 text-xs rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#F87171] focus:ring-1 focus:ring-[#F87171]/30"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#273244]">
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
