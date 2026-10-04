import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { Order } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatting';

interface StepSuccessTokenProps {
  order: Order;
  onTrackOrder: () => void;
  onGoToDashboard: () => void;
}

export const StepSuccessToken: React.FC<StepSuccessTokenProps> = ({
  order,
  onTrackOrder,
  onGoToDashboard,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Subtle celebratory confetti
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#4f46e5', '#10b981', '#fbbf24'],
      });
    } catch {
      // ignore
    }
  }, []);

  const copyToken = () => {
    navigator.clipboard.writeText(order.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-4 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Success Eyebrow */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>ORDER CONFIRMED & QUEUED</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Printing Token is Ready!
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Skip waiting at the counter. Track your queue position in real time and collect when ready.
        </p>
      </div>

      {/* Hero Token Showcase Card */}
      <div className="relative group">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-45 transition duration-500" />

        <div className="relative bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-floating space-y-6">
          {/* Top Row: Token Label & Live Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              OFFICIAL CAMPUS TOKEN
            </span>
            <Badge status={order.status} size="lg" />
          </div>

          {/* Large Token Identifier */}
          <div className="py-2">
            <button
              onClick={copyToken}
              className="inline-flex items-center gap-3 font-mono text-4xl sm:text-5xl font-black text-slate-900 tracking-tight hover:text-brand-600 transition-colors cursor-pointer group/token"
              title="Click to copy token"
            >
              <span>{order.token}</span>
              <span className="p-1.5 rounded-lg bg-slate-100 group-hover/token:bg-brand-50 text-slate-400 group-hover/token:text-brand-600 transition-colors">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </span>
            </button>
            <p className="text-xs text-slate-400 mt-1">
              {copied ? 'Copied to clipboard!' : 'Show this token at the collection counter'}
            </p>
          </div>

          {/* Queue Statistics Bento */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Queue Position
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {order.queuePosition > 1 ? `${order.queuePosition - 1} ahead` : 'Next in line'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Moving quickly</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Time
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <p className="text-xl font-extrabold text-slate-900">
                  ~{order.estimatedMinutes} mins
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Live calculation</p>
            </div>
          </div>

          {/* Pickup Counter & Verification OTP */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-600 text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{order.pickupCounter}</p>
                <p className="text-[11px] text-slate-500">Pickup OTP: <span className="font-mono font-bold text-slate-800">{order.otpCode}</span></p>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-white px-3 py-1 rounded-xl shadow-2xs border border-brand-200/60">
              {formatCurrency(order.pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={onTrackOrder}
          size="lg"
          className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/25"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Track Live Queue
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onGoToDashboard}
          className="w-full sm:w-auto"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
