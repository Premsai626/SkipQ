import React, { useState } from 'react';
import {
  FileText,
  Clock,
  MapPin,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { DocumentItem, PrintConfiguration, PriceBreakdown } from '../../types';
import { formatCurrency, formatBytes } from '../../utils/formatting';
import { Button } from '../ui/Button';

interface StepReviewProps {
  documents: DocumentItem[];
  config: PrintConfiguration;
  pricing: PriceBreakdown;
  onNext: () => void;
  onPrev: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  documents,
  config,
  pricing,
  onNext,
  onPrev,
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [selectedCounter, setSelectedCounter] = useState('Counter #2 (Main Library Desk)');

  const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Review & Confirm Your Order</h2>
        <p className="text-sm text-white/50 mt-1">
          Double-check your file details and print specifications before proceeding to payment.
        </p>
      </div>

      {/* Documents Card */}
      <div className="glass-card-dark border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Documents ({documents.length})</h3>
          <span className="text-xs text-white/50 font-medium font-mono">Total {totalPages} pages</span>
        </div>

        <div className="divide-y divide-white/5">
          {documents.map((doc) => (
            <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span className="font-semibold text-white truncate">{doc.name}</span>
                <span className="text-white/40">({formatBytes(doc.size)})</span>
              </div>
              <span className="font-bold text-white font-mono shrink-0 ml-2">
                {doc.pages} page{doc.pages !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Service</span>
          <p className="text-sm font-bold text-white mt-0.5">
            {config.service === 'XEROX' ? 'Standard Xerox' : 'Laser Print'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Color Output</span>
          <p className="text-sm font-bold text-white mt-0.5">
            {config.color === 'COLOR' ? '🎨 Full Color' : '📄 Monochrome B&W'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Paper & Sides</span>
          <p className="text-sm font-bold text-white mt-0.5">
            {config.paperSize} • {config.sides === 'DOUBLE' ? '2-Sided Duplex' : 'Single-Sided'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Copies & Binding</span>
          <p className="text-sm font-bold text-white mt-0.5">
            {config.copies} Set{config.copies !== 1 ? 's' : ''} • {config.finishing === 'NONE' ? 'No binding' : config.finishing}
          </p>
        </div>
      </div>

      {/* Pickup Counter Selector & Queue Estimate */}
      <div className="glass-card-dark border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <MapPin className="w-4 h-4 text-[#CCFF00]" />
          <span>Designated Campus Collection Desk</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'Counter #1 (Express Desk)', desc: 'Ground floor, East Wing • Best for < 10 pages' },
            { id: 'Counter #2 (Main Library Desk)', desc: 'Central Library Foyer • Full finishing support' },
          ].map((counter) => (
            <button
              key={counter.id}
              type="button"
              onClick={() => setSelectedCounter(counter.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedCounter === counter.id
                  ? 'bg-[#CCFF00]/10 border-[#CCFF00] ring-2 ring-[#CCFF00]/20 shadow-lg shadow-[#CCFF00]/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{counter.id}</span>
                {selectedCounter === counter.id && <Check className="w-4 h-4 text-[#CCFF00]" />}
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">{counter.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/70">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-[#CCFF00]" />
            Estimated wait time upon queue entry:
          </span>
          <span className="font-black text-sm text-[#CCFF00] font-mono">~10 - 14 minutes</span>
        </div>
      </div>

      {/* Confirmation & Terms Agreement */}
      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/70 backdrop-blur-xl">
        <input
          id="terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#CCFF00] rounded cursor-pointer"
        />
        <label htmlFor="terms" className="cursor-pointer select-none text-white/70 leading-relaxed">
          I confirm that all uploaded files are legitimate academic materials and understand my queue token will be active once payment is confirmed.
        </label>
      </div>

      {/* Navigation CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Configure
        </Button>

        <Button
          type="button"
          onClick={onNext}
          disabled={!agreedToTerms}
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Payment ({formatCurrency(pricing.total)})
        </Button>
      </div>
    </div>
  );
};
