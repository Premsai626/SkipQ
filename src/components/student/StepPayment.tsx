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
  const [upiId, setUpiId] = useState('student@okcampus');
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
          <h2 className="text-xl font-bold text-slate-900">Choose Payment Method</h2>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
            DEMO / SIMULATED PAYMENT
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
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
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'UPI'
              ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'UPI' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Instant
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">UPI Instant Pay</p>
          <p className="text-xs text-slate-500 mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
        </button>

        {/* Card */}
        <button
          type="button"
          onClick={() => {
            onSelectMethod('CARD');
            setIsFailed(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'CARD'
              ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'CARD' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              Cards
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">Campus / Debit Card</p>
          <p className="text-xs text-slate-500 mt-0.5">Visa, Mastercard, RuPay</p>
        </button>

        {/* Cash at Counter */}
        <button
          type="button"
          onClick={() => {
            onSelectMethod('CASH');
            setIsFailed(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'CASH'
              ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-xl ${
                selectedMethod === 'CASH' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Counter
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">Cash at Counter</p>
          <p className="text-xs text-slate-500 mt-0.5">Pay operator upon pickup</p>
        </button>
      </div>

      {/* Selected Payment Method Interactive Canvas */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {selectedMethod === 'UPI' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Simulated QR Code Box */}
              <div className="w-36 h-36 rounded-2xl bg-slate-900 p-3 flex flex-col items-center justify-center text-white relative shadow-md">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[9px] font-bold tracking-widest text-emerald-400 mt-1">
                  SCAN TO PAY
                </span>
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold shadow">
                  DEMO
                </span>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Scan QR or approve UPI request
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Amount to authorize: <span className="font-extrabold text-slate-900">{formatCurrency(pricing.total)}</span>
                  </p>
                </div>

                <div className="max-w-xs">
                  <label className="text-[11px] font-semibold text-slate-500">Virtual UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="name@upi"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'CARD' && (
          <div className="space-y-4 max-w-md">
            <h4 className="text-sm font-bold text-slate-900">Campus Debit Card Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="888"
                    className="w-full mt-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'CASH' && (
          <div className="space-y-2 text-slate-700">
            <h4 className="text-sm font-bold text-slate-900">Cash Payment at Xerox Counter</h4>
            <p className="text-xs text-slate-500">
              Your order will be queued immediately in <span className="font-semibold text-amber-700">PENDING PAYMENT</span> state. Please hand over {formatCurrency(pricing.total)} to the desk operator when collecting.
            </p>
          </div>
        )}

        {/* Failure Simulation Toggle for Hackathon Evaluators */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tester: Simulate payment gateway rejection?</span>
          </div>
          <button
            type="button"
            onClick={() => setSimulateFailure(!simulateFailure)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              simulateFailure
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {simulateFailure ? 'Failure Simulation ON' : 'Normal (Success)'}
          </button>
        </div>

        {/* Error State Banner */}
        {isFailed && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Simulated Payment Declined</span>
            </div>
            <p className="text-[11px] text-rose-700">
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
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
          className="shadow-md shadow-brand-500/25"
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
