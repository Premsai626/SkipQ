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
        <h2 className="text-xl font-bold text-slate-900">Review & Confirm Your Order</h2>
        <p className="text-sm text-slate-500 mt-1">
          Double-check your file details and print specifications before proceeding to payment.
        </p>
      </div>

      {/* Documents Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Documents ({documents.length})</h3>
          <span className="text-xs text-slate-500 font-medium">Total {totalPages} pages</span>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                <span className="text-slate-400">({formatBytes(doc.size)})</span>
              </div>
              <span className="font-bold text-slate-700 shrink-0 ml-2">
                {doc.pages} page{doc.pages !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {config.service === 'XEROX' ? 'Standard Xerox' : 'Laser Print'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Output</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {config.color === 'COLOR' ? '🎨 Full Color' : '📄 Monochrome B&W'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paper & Sides</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {config.paperSize} • {config.sides === 'DOUBLE' ? '2-Sided Duplex' : 'Single-Sided'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Copies & Binding</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {config.copies} Set{config.copies !== 1 ? 's' : ''} • {config.finishing === 'NONE' ? 'No binding' : config.finishing}
          </p>
        </div>
      </div>

      {/* Pickup Counter Selector & Queue Estimate */}
      <div className="bg-brand-50/50 border border-brand-100 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
          <MapPin className="w-4 h-4 text-brand-600" />
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
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedCounter === counter.id
                  ? 'bg-white border-brand-600 ring-2 ring-brand-200 shadow-xs'
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{counter.id}</span>
                {selectedCounter === counter.id && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{counter.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-brand-100/60 text-xs text-brand-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-brand-600" />
            Estimated wait time upon queue entry:
          </span>
          <span className="font-extrabold text-sm">~10 - 14 minutes</span>
        </div>
      </div>

      {/* Confirmation & Terms Agreement */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <input
          id="terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
        />
        <label htmlFor="terms" className="cursor-pointer select-none">
          I confirm that all uploaded files are legitimate academic materials and understand my queue token will be active once payment is confirmed.
        </label>
      </div>

      {/* Navigation CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
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
