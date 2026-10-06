import React, { useState } from 'react';
import {
  QrCode,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PaymentMethod, PriceBreakdown } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { Button } from '../ui/Button';

interface StepPaymentProps {
  pricing: PriceBreakdown;
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onSubmitPayment: (method: PaymentMethod) => Promise<void>;
  onPrev: () => void;
}

export const StepPayment: React.FC<StepPaymentProps> = ({
  pricing,
  selectedMethod,
  onSelectMethod,
  onSubmitPayment,
  onPrev,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    setIsFailed(false);

    // Realistic simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (simulateFailure) {
      setIsProcessing(false);
      setIsFailed(true);
      return;
    }

    try {
      await onSubmitPayment(selectedMethod);
    } catch {
      setIsFailed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-white tracking-tight">Choose Payment Method</h2>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/20 font-mono">
            DEMO / SIMULATED PAYMENT
          </span>
        </div>
        <p className="text-sm text-white/50 mt-1">
          This is an academic demo transaction. No actual bank charges will occur.
        </p>
      </div>

      {/* Payment Methods Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* UPI */}
        <button
          type="button"
          onClick={() => {
            onSelectMethod('UPI');
            setIsFailed(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedMethod === 'UPI'
              ? 'border-[#CCFF00] bg-[#CCFF00]/10 ring-2 ring-[#CCFF00]/20 shadow-lg shadow-[#CCFF00]/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'UPI' ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Instant
            </span>
          </div>
          <p className="text-sm font-bold text-white">UPI Instant Pay</p>
          <p className="text-xs text-white/40 mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
        </button>

        {/* Card */}
        <button
          type="button"
          onClick={() => {
            onSelectMethod('CARD');
            setIsFailed(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedMethod === 'CARD'
              ? 'border-[#CCFF00] bg-[#CCFF00]/10 ring-2 ring-[#CCFF00]/20 shadow-lg shadow-[#CCFF00]/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'CARD' ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
              Cards
            </span>
          </div>
          <p className="text-sm font-bold text-white">Campus / Debit Card</p>
          <p className="text-xs text-white/40 mt-0.5">Visa, Mastercard, RuPay</p>
        </button>

        {/* Cash at Counter */}
        <button
          type="button"
          onClick={() => {
            onSelectMethod('CASH');
            setIsFailed(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedMethod === 'CASH'
              ? 'border-[#CCFF00] bg-[#CCFF00]/10 ring-2 ring-[#CCFF00]/20 shadow-lg shadow-[#CCFF00]/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'CASH' ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              Counter
            </span>
          </div>
          <p className="text-sm font-bold text-white">Cash at Counter</p>
          <p className="text-xs text-white/40 mt-0.5">Pay operator upon pickup</p>
        </button>
      </div>

      {/* Selected Payment Method Interactive Canvas */}
      <div className="glass-card-dark border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {selectedMethod === 'UPI' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Simulated QR Code Box */}
              <div className="w-36 h-36 rounded-2xl bg-black/80 border border-white/10 p-3 flex flex-col items-center justify-center text-white relative shadow-xl">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[9px] font-black tracking-widest text-[#CCFF00] mt-1 font-mono">
                  SCAN TO PAY
                </span>
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-[#CCFF00] text-black text-[9px] font-black shadow font-mono">
                  DEMO
                </span>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Scan QR or approve UPI request
                  </h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Amount to authorize: <span className="font-black text-[#CCFF00] font-mono">{formatCurrency(pricing.total)}</span>
                  </p>
                </div>

                <div className="max-w-xs">
                  <label className="text-[11px] font-semibold text-white/60">Virtual UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/40 focus:border-[#CCFF00]"
                    placeholder="name@upi"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'CARD' && (
          <div className="space-y-4 max-w-md">
            <h4 className="text-sm font-bold text-white">Campus Debit Card Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/60">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-white/5 text-white/80"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/60">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-white/5 text-white/80"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/60">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="888"
                    className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-white/5 text-white/80"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'CASH' && (
          <div className="space-y-2 text-white/80">
            <h4 className="text-sm font-bold text-white">Cash Payment at Xerox Counter</h4>
            <p className="text-xs text-white/60">
              Your order will be queued immediately in <span className="font-bold text-amber-400">PENDING PAYMENT</span> state. Please hand over {formatCurrency(pricing.total)} to the desk operator when collecting.
            </p>
          </div>
        )}

        {/* Failure Simulation Toggle for Hackathon Evaluators */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Tester: Simulate payment gateway rejection?</span>
          </div>
          <button
            type="button"
            onClick={() => setSimulateFailure(!simulateFailure)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              simulateFailure
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {simulateFailure ? 'Failure Simulation ON' : 'Normal (Success)'}
          </button>
        </div>

        {/* Error State Banner */}
        {isFailed && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Simulated Payment Declined</span>
            </div>
            <p className="text-[11px] text-rose-300/80">
              The simulated campus gateway timed out. You can retry with UPI or choose "Cash at Counter" instead.
            </p>
            <div className="pt-1 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePay}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Payment
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSimulateFailure(false);
                  onSelectMethod('CASH');
                  setIsFailed(false);
                }}
              >
                Switch to Cash
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation & Submit CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isProcessing}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Review
        </Button>

        <Button
          type="button"
          onClick={handlePay}
          disabled={isProcessing}
          isLoading={isProcessing}
          size="lg"
          rightIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          {isProcessing
            ? 'Authorizing Simulated Payment...'
            : `Authorize & Place Order (${formatCurrency(pricing.total)})`}
        </Button>
      </div>
    </div>
  );
};
