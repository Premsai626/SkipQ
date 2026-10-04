import React from 'react';
import { Sparkles, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PriceBreakdown, PrintConfiguration, DocumentItem } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { Button } from '../ui/Button';

interface PriceSummaryCardProps {
  documents: DocumentItem[];
  config: PrintConfiguration;
  pricing: PriceBreakdown;
  onContinue?: () => void;
  continueText?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  showContinueButton?: boolean;
}

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  documents,
  config,
  pricing,
  onContinue,
  continueText = 'Continue to Next Step',
  isSubmitting = false,
  disabled = false,
  showContinueButton = true,
}) => {
  const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-floating space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
            Live Pricing Engine
          </span>
          <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Quick Spec Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          {documents.length} File{documents.length !== 1 ? 's' : ''} ({totalPages} pgs)
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          {config.color === 'COLOR' ? '🎨 Full Color' : '📄 Monochrome B&W'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          {config.paperSize} • {config.sides === 'DOUBLE' ? 'Duplex (2-sided)' : 'Single-sided'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          {config.copies} Cop{config.copies !== 1 ? 'ies' : 'y'}
        </span>
        {config.finishing !== 'NONE' && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
            {config.finishing}
          </span>
        )}
      </div>

      {/* Itemized Price Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>
            {config.service === 'XEROX' ? 'Photocopy base' : 'Laser Print base'} ({totalPages} pgs × {config.copies}x)
          </span>
          <span className="font-semibold text-slate-900">{formatCurrency(pricing.baseCost)}</span>
        </div>

        {pricing.colorSurcharge > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span>Color pigment surcharge</span>
            <span className="font-semibold text-slate-900">+{formatCurrency(pricing.colorSurcharge)}</span>
          </div>
        )}

        {pricing.paperSurcharge > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span>A3 oversized paper sheet</span>
            <span className="font-semibold text-slate-900">+{formatCurrency(pricing.paperSurcharge)}</span>
          </div>
        )}

        {pricing.duplexAdjustment > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Duplex eco paper discount</span>
            <span className="font-semibold">-{formatCurrency(pricing.duplexAdjustment)}</span>
          </div>
        )}

        {pricing.finishingCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span>Binding / Finishing ({config.finishing})</span>
            <span className="font-semibold text-slate-900">+{formatCurrency(pricing.finishingCost)}</span>
          </div>
        )}

        {/* Separator */}
        <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total</p>
            <p className="text-[11px] text-slate-400">Taxes included • Zero queue fee</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight transition-all">
              {formatCurrency(pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {showContinueButton && onContinue && (
        <div className="pt-2">
          <Button
            type="button"
            onClick={onContinue}
            disabled={disabled || documents.length === 0}
            isLoading={isSubmitting}
            size="lg"
            className="w-full py-4 text-sm font-bold shadow-md shadow-brand-500/25"
          >
            {continueText}
          </Button>
        </div>
      )}

      {/* Queue speed reassurance */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Token assigned instantly upon order placement. Track live position.</span>
      </div>
    </div>
  );
};
