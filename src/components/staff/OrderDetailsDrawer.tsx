import React, { useState } from 'react';
import {
  CheckCircle,
  Printer,
  FileText,
  Download,
  AlertOctagon,
  User,
  CreditCard,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Order, DocumentItem } from '../../types';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatBytes } from '../../utils/formatting';
import { documentsApi } from '../../services/api';

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
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [docErrors, setDocErrors] = useState<{ [id: string]: string }>({});

  if (!order) return null;

  const handleOpenDocument = async (doc: DocumentItem, forceDownload = false) => {
    const targetIdentifier: string = doc.id || doc.filename || doc.name || 'doc';
    setLoadingDocId(targetIdentifier);
    setDocErrors((prev) => ({ ...prev, [targetIdentifier]: '' }));

    try {
      const data = await documentsApi.getViewUrl(targetIdentifier);
      const isOfficeDoc = /\.(docx?|pptx?|xlsx?)$/i.test(doc.name || doc.filename || '');

      if (forceDownload || isOfficeDoc) {
        const downloadUrl = data.downloadUrl || data.signedUrl;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.name || data.name || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF or Image: Open in new browser tab
        const viewUrl = data.viewUrl || data.signedUrl;
        window.open(viewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('Failed to view document:', err);
      setDocErrors((prev) => ({
        ...prev,
        [targetIdentifier]: err.message || 'Unable to access document',
      }));
    } finally {
      setLoadingDocId(null);
    }
  };

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
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
              Current Lifecycle
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Badge status={order.status} size="lg" />
              {order.paymentStatus === 'VERIFIED' ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Paid
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Payment Due
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
              Total Charge
            </span>
            <p className="text-2xl font-black text-[#CCFF00] font-mono mt-0.5">
              {formatCurrency(order.pricing.total)}
            </p>
          </div>
        </div>

        {/* Dynamic Contextual Action Buttons (Specification 29) */}
        <div className="p-4 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 space-y-3 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
            Operational Action Required
          </span>

          <div className="flex flex-wrap gap-2">
            {order.status === 'PENDING' && (
              <>
                <Button
                  size="md"
                  variant="primary"
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
                    variant="primary"
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
                variant="primary"
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
                variant="primary"
                onClick={() => onUpdateStatus(order.id, 'COLLECTED')}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Student Collection (Complete)
              </Button>
            )}

            {order.status === 'COLLECTED' && (
              <span className="text-xs font-semibold text-white/50 py-1">
                ✓ Order has been fulfilled and collected by student.
              </span>
            )}

            {order.status === 'REJECTED' && (
              <div className="text-xs text-rose-400">
                <strong>Declined:</strong> {order.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* Student Information */}
        <div className="glass-card-dark rounded-2xl p-4 space-y-2 border border-white/10">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-white/40">
            Student Details
          </h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-bold text-white">
              <User className="w-4 h-4 text-[#CCFF00]" />
              <span>{order.studentName}</span>
            </div>
            <span className="text-xs text-white/50 font-mono">{order.studentPhone}</span>
          </div>
          <p className="text-xs text-white/50">{order.studentEmail}</p>
          <div className="pt-2 flex items-center justify-between text-xs text-white/70 border-t border-white/10">
            <span>Pickup OTP Verification Code:</span>
            <span className="font-mono font-bold text-[#CCFF00] bg-black/50 border border-[#CCFF00]/30 px-2 py-0.5 rounded">
              {order.otpCode}
            </span>
          </div>
        </div>

        {/* Print Specifications Checklist */}
        <div className="glass-card-dark rounded-2xl p-4 space-y-3 border border-white/10">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-white/40">
            Print Configuration
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block">Service</span>
              <span className="font-bold text-white">{order.config.service}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block">Color</span>
              <span className="font-bold text-white">{order.config.color === 'COLOR' ? 'Color' : 'B&W'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block">Paper & Sides</span>
              <span className="font-bold text-white">
                {order.config.paperSize} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block">Copies & Binding</span>
              <span className="font-bold text-white">
                {order.config.copies} Sets • {order.config.finishing}
              </span>
            </div>
          </div>

          {order.config.instructions && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <span className="font-bold block text-amber-400">Operator Instructions:</span>
              <span>"{order.config.instructions}"</span>
            </div>
          )}
        </div>

        {/* Uploaded Documents List with Secure Authorized Access */}
        <div className="glass-card-dark rounded-2xl p-4 space-y-3 border border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/40">
              Documents ({order.documents.length})
            </h4>
            <span className="text-xs font-bold text-[#CCFF00]">
              {totalPages} Pages total
            </span>
          </div>

          <div className="space-y-2.5">
            {order.documents.map((doc) => {
              const targetIdentifier: string = doc.id || doc.filename || doc.name || 'doc';
              const isLoading = loadingDocId === targetIdentifier;
              const error = docErrors[targetIdentifier];

              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {formatBytes(doc.size)} • {doc.pages} pages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* View Document Button */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleOpenDocument(doc, false)}
                        className="px-3 py-1.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-bold flex items-center gap-1.5 shadow-md shadow-[#CCFF00]/10 transition-colors cursor-pointer"
                        title="View Document in browser"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>View</span>
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleOpenDocument(doc, true)}
                        className="p-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 disabled:opacity-50 text-white transition-colors shadow-sm cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Error display if access fails */}
                  {error && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
