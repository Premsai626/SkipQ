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
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { QueueVisualizer } from '../../components/student/QueueVisualizer';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { Order, OrderStatus, DocumentItem } from '../../types';

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

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Active Order Found</h2>
        <p className="text-sm text-slate-500">You haven't placed an active printing order yet.</p>
        <Button onClick={() => onNavigate('/student/orders/new')}>Start New Order</Button>
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

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'PAYMENT_VERIFIED': return 2;
      case 'PRINTING': return 3;
      case 'READY_FOR_PICKUP': return 4;
      case 'COLLECTED': return 5;
      case 'REJECTED': return -1;
      case 'CANCELLED': return -2;
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
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
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
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Tracking Hero Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-floating space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                LIVE QUEUE TRACKER
              </span>
              <Badge status={order.status} size="md" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Token {order.token}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {formatDate(order.createdAt)} • {order.documents.length} document{order.documents.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100 text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                Estimated Wait
              </span>
              <span className="text-2xl font-black text-brand-900">
                {order.status === 'READY_FOR_PICKUP' ? 'Ready Now!' : `~${order.estimatedMinutes}m`}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection / Cancellation Banner */}
        {order.status === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              This order was declined by Xerox staff
            </p>
            <p className="text-rose-700">Reason: "{order.rejectionReason || 'Staff declined'}"</p>
          </div>
        )}

        {/* 6-Stage Timeline Stepper */}
        {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
          <div className="py-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
              Live Fulfillment Progress
            </h3>

            <div className="relative">
              {/* Timeline connecting line */}
              <div className="hidden sm:block absolute left-0 top-4 right-0 h-0.5 bg-slate-100 -z-0" />
              <div
                className="hidden sm:block absolute left-0 top-4 h-0.5 bg-brand-600 -z-0 transition-all duration-500"
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
                            ? 'bg-brand-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-white text-brand-600 border-2 border-brand-600 ring-4 ring-brand-100 animate-pulse'
                            : 'bg-white text-slate-300 border-2 border-slate-200'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <p
                        className={`text-xs font-bold mt-2 ${
                          isCurrent ? 'text-brand-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
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
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Collection Desk
              </p>
              <h4 className="text-base font-bold text-slate-900">{order.pickupCounter}</h4>
              <p className="text-xs text-slate-500">
                Ground Floor Foyer • Show your 4-digit pickup OTP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verification OTP
              </span>
              <span className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                {order.otpCode}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
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
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Order Specifications
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Service:</span>
              <span className="font-bold text-slate-900">{order.config.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Color Mode:</span>
              <span className="font-bold text-slate-900">
                {order.config.color === 'COLOR' ? 'Full Color' : 'B&W Monochrome'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Paper & Sides:</span>
              <span className="font-bold text-slate-900">
                {order.config.paperSize} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single-sided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Copies / Sets:</span>
              <span className="font-bold text-slate-900">{order.config.copies} sets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Binding / Finishing:</span>
              <span className="font-bold text-slate-900">{order.config.finishing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment:</span>
              <span className="font-bold text-emerald-700">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
              <span className="font-bold text-slate-800">Total Paid:</span>
              <span className="font-black text-slate-900">{formatCurrency(order.pricing.total)}</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Uploaded Documents
            </h4>
            <div className="space-y-1.5">
              {(order.documents || []).map((doc: DocumentItem) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                  </div>
                  <span className="text-slate-400 shrink-0 ml-2">{doc.pages} pgs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-floating border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Token {order.token}?</h3>
            <p className="text-xs text-slate-500">
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
