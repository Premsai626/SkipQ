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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ORDER CONFIRMED & QUEUED</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Your Printing Token is Ready!
        </h2>
        <p className="text-sm text-white/50 max-w-md mx-auto font-normal">
          Skip waiting at the counter. Track your queue position in real time and collect when ready.
        </p>
      </div>

      {/* Hero Token Showcase Card */}
      <div className="relative group">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#CCFF00]/20 via-[#00F0FF]/20 to-emerald-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />

        <div className="relative glass-card-dark border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
          {/* Top Row: Token Label & Live Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-white/40 font-mono">
              OFFICIAL CAMPUS TOKEN
            </span>
            <Badge status={order.status} size="lg" />
          </div>

          {/* Large Token Identifier */}
          <div className="py-2">
            <button
              onClick={copyToken}
              className="inline-flex items-center gap-3 font-mono text-4xl sm:text-5xl font-black text-white tracking-tight hover:text-[#CCFF00] transition-colors cursor-pointer group/token"
              title="Click to copy token"
            >
              <span>{order.token}</span>
              <span className="p-1.5 rounded-lg bg-white/5 group-hover/token:bg-[#CCFF00]/10 text-white/50 group-hover/token:text-[#CCFF00] transition-colors border border-white/10">
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </span>
            </button>
            <p className="text-xs text-white/40 mt-1 font-normal">
              {copied ? 'Copied to clipboard!' : 'Show this token at the collection counter'}
            </p>
          </div>

          {/* Queue Statistics Bento */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-mono">
                Queue Position
              </span>
              <p className="text-xl font-black text-white mt-0.5 font-mono">
                {order.queuePosition > 1 ? `${order.queuePosition - 1} ahead` : 'Next in line'}
              </p>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Moving quickly</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-mono">
                Estimated Time
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-[#CCFF00]" />
                <p className="text-xl font-black text-[#CCFF00] font-mono">
                  ~{order.estimatedMinutes} mins
                </p>
              </div>
              <p className="text-[11px] text-white/40 font-medium mt-0.5">Live calculation</p>
            </div>
          </div>

          {/* Pickup Counter & Verification OTP */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#CCFF00] text-black">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{order.pickupCounter}</p>
                <p className="text-[11px] text-white/50 font-normal">
                  Pickup OTP: <span className="font-mono font-black text-[#CCFF00]">{order.otpCode}</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#CCFF00] bg-black/50 px-3 py-1.5 rounded-xl border border-[#CCFF00]/30 font-mono">
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
          className="w-full sm:w-auto px-8"
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
