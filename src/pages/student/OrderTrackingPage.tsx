import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  AlertOctagon,
  ArrowLeft,
  Share2,
  Sparkles,
  QrCode,
  ShieldCheck,
  RotateCcw,
  Eye,
  Loader2,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { QueueVisualizer } from '../../components/student/QueueVisualizer';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { Order, OrderStatus, DocumentItem } from '../../types';
import { documentsApi } from '../../services/api';

interface OrderTrackingPageProps {
  orderId?: string;
  onNavigate: (path: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const { orders, activeOrder, cancelOrder, getOrderById } = useOrders();
  const [resolvedOrder, setResolvedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      if (orderId) {
        const found = await getOrderById(orderId);
        if (isMounted && found) {
          setResolvedOrder(found);
          return;
        }
      }
      if (isMounted) {
        const fallback = orders.find((o) => o.id === orderId || o.token === orderId) || activeOrder || orders[0] || null;
        setResolvedOrder(fallback);
      }
    };
    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId, orders, activeOrder, getOrderById]);

  const order = resolvedOrder || orders.find((o) => o.id === orderId || o.token === orderId) || activeOrder || orders[0] || null;

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);

  const handleViewDoc = async (doc: DocumentItem) => {
    const targetIdentifier: string = doc.id || doc.filename || doc.name || 'doc';
    setLoadingDocId(targetIdentifier);
    try {
      const data = await documentsApi.getViewUrl(targetIdentifier);
      const isOfficeDoc = /\.(docx?|pptx?|xlsx?)$/i.test(doc.name || doc.filename || '');
      if (isOfficeDoc && data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = doc.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const viewUrl = data.viewUrl || data.signedUrl;
        window.open(viewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      alert(err.message || 'Unable to open document');
    } finally {
      setLoadingDocId(null);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4 glass-card-dark rounded-3xl p-8 border border-white/10">
        <h2 className="text-xl font-bold text-white">No Active Order Found</h2>
        <p className="text-sm text-white/50">You haven't placed an active printing order yet.</p>
        <Button variant="primary" onClick={() => onNavigate('/student/orders/new')}>Start New Order</Button>
      </div>
    );
  }

  // 6-stage lifecycle pipeline (Specification 21)
  const timelineStages: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Order Placed', desc: 'Received in campus system' },
    { status: 'ACCEPTED', label: 'Accepted', desc: 'Approved by Xerox desk operator' },
    { status: 'PAYMENT_VERIFIED', label: 'Payment Verified', desc: 'Payment cleared & queued' },
    { status: 'PRINTING', label: 'Printing', desc: 'Currently running on Xerox machine' },
    { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Available at designated counter' },
    { status: 'COLLECTED', label: 'Collected', desc: 'Picked up by student' },
  ];

  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'PAYMENT_VERIFIED': return 2;
      case 'PRINTING': return 3;
      case 'READY_FOR_PICKUP': return 4;
      case 'COLLECTED': return 5;
      case 'REJECTED':
      case 'DECLINED': return -1;
      case 'CANCELLED': return -2;
      default: return 0;
    }
  };

  const currentStageIndex = getStageIndex(order.status);
  const totalPages = (order.documents || []).reduce((s: number, d: DocumentItem) => s + d.pages, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/student')}
          className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {order.status === 'PENDING' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelConfirmOpen(true)}
              className="text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Tracking Hero Card */}
      <div className="glass-card-dark rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> LIVE QUEUE TRACKER
              </span>
              <Badge status={order.status} size="md" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Token {order.token}
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Created {formatDate(order.createdAt)} • {order.documents.length} document{order.documents.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-center min-w-[130px] shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] block">
                Estimated Wait
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {order.status === 'READY_FOR_PICKUP' ? 'Ready Now!' : `~${order.estimatedMinutes}m`}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection / Cancellation Banner */}
        {order.status === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              This order was declined by Xerox staff
            </p>
            <p className="text-rose-300/80">Reason: "{order.rejectionReason || 'Staff declined'}"</p>
          </div>
        )}

        {/* 6-Stage Timeline Stepper */}
        {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
          <div className="py-2">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span>Live Fulfillment Progress</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            </h3>

            <div className="relative">
              {/* Timeline connecting line */}
              <div className="hidden sm:block absolute left-0 top-4 right-0 h-0.5 bg-white/10 -z-0" />
              <div
                className="hidden sm:block absolute left-0 top-4 h-0.5 bg-[#CCFF00] -z-0 transition-all duration-500 shadow-sm shadow-[#CCFF00]/50"
                style={{
                  width: `${(Math.max(0, currentStageIndex) / (timelineStages.length - 1)) * 100}%`,
                }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                {timelineStages.map((stage, idx) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div key={stage.status} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isDone
                            ? 'bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/30 font-black'
                            : isCurrent
                            ? 'bg-black text-[#CCFF00] border-2 border-[#CCFF00] ring-4 ring-[#CCFF00]/20 animate-pulse font-black'
                            : 'bg-white/5 text-white/30 border border-white/10'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <p
                        className={`text-xs font-bold mt-2 ${
                          isCurrent ? 'text-[#CCFF00]' : isDone ? 'text-white' : 'text-white/40'
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5 hidden sm:block">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Counter Pickup Instructions & OTP Card */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 shrink-0 font-black">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Collection Desk
              </p>
              <h4 className="text-base font-bold text-white">{order.pickupCounter}</h4>
              <p className="text-xs text-white/50">
                Ground Floor Foyer • Show your 4-digit pickup OTP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/15 shadow-inner">
            <div className="text-right">
              <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-wider block">
                Verification OTP
              </span>
              <span className="font-mono text-2xl font-black text-white tracking-wider">
                {order.otpCode}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#CCFF00]">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Queue Visualizer & Order Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Queue Visualizer Component */}
        <div className="lg:col-span-7">
          <QueueVisualizer currentOrder={order} allOrders={orders} />
        </div>

        {/* Order Details & Receipt Specs */}
        <div className="lg:col-span-5 glass-card-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl backdrop-blur-2xl">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-white/10">
            Order Specifications
          </h3>

          <div className="space-y-2.5 text-xs text-white/70">
            <div className="flex justify-between">
              <span className="text-white/40">Service:</span>
              <span className="font-bold text-white">{order.config.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Color Mode:</span>
              <span className="font-bold text-white">
                {order.config.color === 'COLOR' ? 'Full Color' : 'B&W Monochrome'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Paper & Sides:</span>
              <span className="font-bold text-white">
                {order.config.paperSize} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single-sided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Copies / Sets:</span>
              <span className="font-bold text-white">{order.config.copies} sets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Binding / Finishing:</span>
              <span className="font-bold text-white">{order.config.finishing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Payment:</span>
              <span className="font-bold text-emerald-400">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
              <span className="font-bold text-white">Total Paid:</span>
              <span className="font-black text-[#CCFF00] font-mono">{formatCurrency(order.pricing.total)}</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Uploaded Documents
            </h4>
            <div className="space-y-1.5">
              {(order.documents || []).map((doc: DocumentItem) => {
                const targetId = doc.id || doc.filename;
                const isLoading = loadingDocId === targetId;

                return (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                      <span className="font-semibold text-white truncate">{doc.name}</span>
                      <span className="text-white/40 shrink-0 ml-1">({doc.pages} pgs)</span>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleViewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white hover:text-[#CCFF00] hover:border-[#CCFF00]/30 font-semibold flex items-center gap-1 shadow-sm transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>View</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-card-dark rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-white">Cancel Token {order.token}?</h3>
            <p className="text-xs text-white/60">
              Are you sure you want to remove this order from the printing line?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCancelConfirmOpen(false)}>
                Keep Order
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  cancelOrder(order.id);
                  setCancelConfirmOpen(false);
                }}
              >
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
