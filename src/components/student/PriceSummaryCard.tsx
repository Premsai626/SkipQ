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
    <div className="glass-card-dark border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00] font-mono">
            Live Pricing Engine
          </span>
          <h3 className="text-base font-bold text-white">Order Summary</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold border border-[#CCFF00]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Quick Spec Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
          {documents.length} File{documents.length !== 1 ? 's' : ''} ({totalPages} pgs)
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
          {config.color === 'COLOR' ? '🎨 Full Color' : '📄 Monochrome B&W'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
          {config.paperSize} • {config.sides === 'DOUBLE' ? 'Duplex (2-sided)' : 'Single-sided'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
          {config.copies} Cop{config.copies !== 1 ? 'ies' : 'y'}
        </span>
        {config.finishing !== 'NONE' && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/30">
            {config.finishing}
          </span>
        )}
      </div>

      {/* Itemized Price Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-white/60">
          <span>
            {config.service === 'XEROX' ? 'Photocopy base' : 'Laser Print base'} ({totalPages} pgs × {config.copies}x)
          </span>
          <span className="font-semibold text-white font-mono">{formatCurrency(pricing.baseCost)}</span>
        </div>

        {pricing.colorSurcharge > 0 && (
          <div className="flex items-center justify-between text-white/60">
            <span>Color pigment surcharge</span>
            <span className="font-semibold text-white font-mono">+{formatCurrency(pricing.colorSurcharge)}</span>
          </div>
        )}

        {pricing.paperSurcharge > 0 && (
          <div className="flex items-center justify-between text-white/60">
            <span>A3 oversized paper sheet</span>
            <span className="font-semibold text-white font-mono">+{formatCurrency(pricing.paperSurcharge)}</span>
          </div>
        )}

        {pricing.duplexAdjustment > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span>Duplex eco paper discount</span>
            <span className="font-semibold font-mono">-{formatCurrency(pricing.duplexAdjustment)}</span>
          </div>
        )}

        {pricing.finishingCost > 0 && (
          <div className="flex items-center justify-between text-white/60">
            <span>Binding / Finishing ({config.finishing})</span>
            <span className="font-semibold text-white font-mono">+{formatCurrency(pricing.finishingCost)}</span>
          </div>
        )}

        {/* Separator */}
        <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Estimated Total</p>
            <p className="text-[11px] text-white/30">Taxes included • Zero queue fee</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-[#CCFF00] font-mono tracking-tight transition-all">
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
            className="w-full py-4 text-sm font-bold shadow-lg"
          >
            {continueText}
          </Button>
        </div>
      )}

      {/* Queue speed reassurance */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/60">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Token assigned instantly upon order placement. Track live position.</span>
      </div>
    </div>
  );
};
