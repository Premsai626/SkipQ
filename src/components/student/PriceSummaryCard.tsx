import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-[#111827] border border-[#273244] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-[#F9FAFB] backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#273244]">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#00D4FF] font-mono">
            Live Pricing Engine
          </span>
          <h3 className="text-base font-bold text-[#F9FAFB]">Order Summary</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-bold border border-[#00D4FF]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Quick Spec Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2232] border border-[#273244] text-[#9CA3AF] font-medium">
          {documents.length} File{documents.length !== 1 ? 's' : ''} ({totalPages} pgs)
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2232] border border-[#273244] text-[#9CA3AF] font-medium">
          {config.color === 'COLOR' ? '🎨 Full Color' : '📄 Monochrome B&W'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2232] border border-[#273244] text-[#9CA3AF] font-medium">
          {config.paperSize} • {config.sides === 'DOUBLE' ? 'Duplex (2-sided)' : 'Single-sided'}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2232] border border-[#273244] text-[#9CA3AF] font-medium">
          {config.copies} Cop{config.copies !== 1 ? 'ies' : 'y'}
        </span>
        {config.finishing !== 'NONE' && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] font-bold border border-[#00D4FF]/30">
            {config.finishing}
          </span>
        )}
      </div>

      {/* Itemized Price Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-[#9CA3AF]">
          <span>
            {config.service === 'XEROX' ? 'Photocopy base' : 'Laser Print base'} ({totalPages} pgs × {config.copies}x)
          </span>
          <span className="font-semibold text-[#F9FAFB] font-mono">{formatCurrency(pricing.baseCost)}</span>
        </div>

        {pricing.colorSurcharge > 0 && (
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Color pigment surcharge</span>
            <span className="font-semibold text-[#F9FAFB] font-mono">+{formatCurrency(pricing.colorSurcharge)}</span>
          </div>
        )}

        {pricing.paperSurcharge > 0 && (
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>A3 oversized paper sheet</span>
            <span className="font-semibold text-[#F9FAFB] font-mono">+{formatCurrency(pricing.paperSurcharge)}</span>
          </div>
        )}

        {pricing.duplexAdjustment > 0 && (
          <div className="flex items-center justify-between text-[#34D399]">
            <span>Duplex eco paper discount</span>
            <span className="font-semibold font-mono">-{formatCurrency(pricing.duplexAdjustment)}</span>
          </div>
        )}

        {pricing.finishingCost > 0 && (
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Binding / Finishing ({config.finishing})</span>
            <span className="font-semibold text-[#F9FAFB] font-mono">+{formatCurrency(pricing.finishingCost)}</span>
          </div>
        )}

        {/* Separator */}
        <div className="pt-3 border-t border-[#273244] flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Estimated Total</p>
            <p className="text-[11px] text-[#6B7280]">Taxes included • Zero queue fee</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-[#00D4FF] font-mono tracking-tight transition-all">
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
            className="w-full py-4 text-sm font-bold shadow-lg shadow-[#00D4FF]/25"
          >
            {continueText}
          </Button>
        </div>
      )}

      {/* Queue speed reassurance */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#1A2232] border border-[#273244] text-[11px] text-[#9CA3AF]">
        <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
        <span>Token assigned instantly upon order placement. Track live position.</span>
      </div>
    </div>
  );
};
export default PriceSummaryCard;
