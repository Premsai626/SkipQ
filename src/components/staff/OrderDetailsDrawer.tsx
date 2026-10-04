import React from 'react';
import {
  CheckCircle,
  Clock,
  Printer,
  FileText,
  Download,
  AlertOctagon,
  User,
  MapPin,
  Sparkles,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Order } from '../../types';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatBytes } from '../../utils/formatting';

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: any) => void;
  onVerifyPayment: (orderId: string) => void;
  onOpenRejectModal: (order: Order) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  isOpen,
  order,
  onClose,
  onUpdateStatus,
  onVerifyPayment,
  onOpenRejectModal,
}) => {
  if (!order) return null;

  const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.token}`}
      subtitle={`Created ${formatDate(order.createdAt)}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Status and Action Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Lifecycle
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Badge status={order.status} size="lg" />
              {order.paymentStatus === 'VERIFIED' ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                  Paid
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full">
                  Payment Due
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Charge
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(order.pricing.total)}
            </p>
          </div>
        </div>

        {/* Dynamic Contextual Action Buttons (Specification 29) */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Operational Action Required
          </span>

          <div className="flex flex-wrap gap-2">
            {order.status === 'PENDING' && (
              <>
                <Button
                  size="md"
                  onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Accept Order
                </Button>
                <Button
                  size="md"
                  variant="danger"
                  onClick={() => onOpenRejectModal(order)}
                  leftIcon={<AlertOctagon className="w-4 h-4" />}
                >
                  Reject Order
                </Button>
              </>
            )}

            {order.status === 'ACCEPTED' && (
              <>
                {order.paymentStatus !== 'VERIFIED' ? (
                  <Button
                    size="md"
                    variant="success"
                    onClick={() => onVerifyPayment(order.id)}
                    leftIcon={<CreditCard className="w-4 h-4" />}
                  >
                    Verify Counter Cash ({formatCurrency(order.pricing.total)})
                  </Button>
                ) : (
                  <Button
                    size="md"
                    onClick={() => onUpdateStatus(order.id, 'PRINTING')}
                    leftIcon={<Printer className="w-4 h-4" />}
                  >
                    Start Printing
                  </Button>
                )}
                <Button
                  size="md"
                  variant="danger"
                  onClick={() => onOpenRejectModal(order)}
                >
                  Reject
                </Button>
              </>
            )}

            {order.status === 'PAYMENT_VERIFIED' && (
              <Button
                size="md"
                onClick={() => onUpdateStatus(order.id, 'PRINTING')}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Send to Xerox Machine (Start Printing)
              </Button>
            )}

            {order.status === 'PRINTING' && (
              <Button
                size="md"
                variant="success"
                onClick={() => onUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Mark Ready for Pickup
              </Button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <Button
                size="md"
                onClick={() => onUpdateStatus(order.id, 'COLLECTED')}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Student Collection (Complete)
              </Button>
            )}

            {order.status === 'COLLECTED' && (
              <span className="text-xs font-semibold text-slate-500 py-1">
                ✓ Order has been fulfilled and collected by student.
              </span>
            )}

            {order.status === 'REJECTED' && (
              <div className="text-xs text-rose-700">
                <strong>Declined:</strong> {order.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Student Details
          </h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <User className="w-4 h-4 text-slate-400" />
              <span>{order.studentName}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{order.studentPhone}</span>
          </div>
          <p className="text-xs text-slate-500">{order.studentEmail}</p>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
            <span>Pickup OTP Verification Code:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {order.otpCode}
            </span>
          </div>
        </div>

        {/* Print Specifications Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Print Configuration
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-400 block">Service</span>
              <span className="font-bold text-slate-800">{order.config.service}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-400 block">Color</span>
              <span className="font-bold text-slate-800">{order.config.color === 'COLOR' ? 'Color' : 'B&W'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-400 block">Paper & Sides</span>
              <span className="font-bold text-slate-800">
                {order.config.paperSize} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-400 block">Copies & Binding</span>
              <span className="font-bold text-slate-800">
                {order.config.copies} Sets • {order.config.finishing}
              </span>
            </div>
          </div>

          {order.config.instructions && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block">Operator Instructions:</span>
              <span>"{order.config.instructions}"</span>
            </div>
          )}
        </div>

        {/* Uploaded Documents List with simulated file inspection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Documents ({order.documents.length})
            </h4>
            <span className="text-xs font-bold text-slate-700">
              {totalPages} Pages total
            </span>
          </div>

          <div className="space-y-2">
            {order.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(doc.size)} • {doc.pages} pages
                    </p>
                  </div>
                </div>

                <a
                  href={`#inspect-${doc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Simulated document viewer for: ${doc.name}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-brand-600 flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3 h-3" />
                  <span>View</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
