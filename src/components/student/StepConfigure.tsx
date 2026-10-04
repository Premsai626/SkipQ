import React from 'react';
import {
  Printer,
  Copy,
  Palette,
  FileCheck,
  FileSpreadsheet,
  BookOpen,
  Scissors,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { PrintConfiguration, PrintService, ColorMode, PaperSize, Sides, FinishingOption } from '../../types';
import { Button } from '../ui/Button';

interface StepConfigureProps {
  config: PrintConfiguration;
  onChange: (config: PrintConfiguration) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepConfigure: React.FC<StepConfigureProps> = ({
  config,
  onChange,
  onNext,
  onPrev,
}) => {
  const updateField = <K extends keyof PrintConfiguration>(key: K, value: PrintConfiguration[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleCopyChange = (delta: number) => {
    const next = Math.max(1, Math.min(50, config.copies + delta));
    updateField('copies', next);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Printing & Binding Requirements</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select your paper size, color preferences, and finishing options.
        </p>
      </div>

      {/* 1. Service Type */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          1. Service Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField('service', 'PRINT')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              config.service === 'PRINT'
                ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                config.service === 'PRINT' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Laser Print</p>
              <p className="text-xs text-slate-500 mt-0.5">High-definition digital print from file</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('service', 'XEROX')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              config.service === 'XEROX'
                ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                config.service === 'XEROX' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Standard Xerox</p>
              <p className="text-xs text-slate-500 mt-0.5">Fast economical photocopy reproduction</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Color Mode & Paper Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Color Mode */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Color Output
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('color', 'BW')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                config.color === 'BW'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold">B&W (Monochrome)</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Standard ₹2/page</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('color', 'COLOR')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                config.color === 'COLOR'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <p className="text-sm font-bold">Full Color</p>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">+₹6 surcharge</p>
            </button>
          </div>
        </div>

        {/* Paper Size */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Paper Size
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('paperSize', 'A4')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                config.paperSize === 'A4'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold">A4 Standard</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">210 × 297 mm</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('paperSize', 'A3')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                config.paperSize === 'A3'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold">A3 Poster / Large</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">297 × 420 mm (+₹5)</p>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sides & Copies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Sides */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            4. Print Sides
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('sides', 'SINGLE')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                config.sides === 'SINGLE'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold">Single-Sided</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">1 page per sheet</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('sides', 'DOUBLE')}
              className={`p-3.5 rounded-2xl border text-center transition-all relative ${
                config.sides === 'DOUBLE'
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 font-bold text-brand-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold">Double-Sided (Duplex)</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">Eco Paper Saver</p>
            </button>
          </div>
        </div>

        {/* Copies Counter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            5. Number of Copies
          </label>
          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-2xl">
            <button
              type="button"
              onClick={() => handleCopyChange(-1)}
              disabled={config.copies <= 1}
              className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Decrease copies"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-lg font-extrabold text-slate-900">{config.copies}</span>
              <span className="text-xs text-slate-500 ml-1 font-medium">
                {config.copies === 1 ? 'set' : 'sets'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopyChange(1)}
              disabled={config.copies >= 50}
              className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Increase copies"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Optional Finishing & Binding */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          6. Binding & Finishing (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'NONE', label: 'None', desc: 'Loose sheets', price: '₹0', icon: FileSpreadsheet },
            { id: 'STAPLE', label: 'Staple', desc: 'Top-left or side', price: '+₹5', icon: Scissors },
            { id: 'SPIRAL', label: 'Spiral Binding', desc: 'Clear sheet cover', price: '+₹25', icon: BookOpen },
            { id: 'LAMINATION', label: 'Lamination', desc: 'Thermal pouch', price: '+₹20/pg', icon: FileCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = config.finishing === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('finishing', item.id as FinishingOption)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.price}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Custom Instructions */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          7. Notes for Xerox Operator (Optional)
        </label>
        <textarea
          rows={2}
          value={config.instructions || ''}
          onChange={(e) => updateField('instructions', e.target.value)}
          placeholder="e.g. Please print page 3-12 only, or use blue front cover for spiral binding..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Upload
        </Button>

        <Button
          type="button"
          onClick={onNext}
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Review Order
        </Button>
      </div>
    </div>
  );
};
