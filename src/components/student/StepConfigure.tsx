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
import { PrintConfiguration, FinishingOption } from '../../types';
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
        <h2 className="text-xl font-black text-[#F9FAFB] tracking-tight">Printing & Binding Requirements</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Select your paper size, color preferences, and finishing options.
        </p>
      </div>

      {/* 1. Service Type */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#06D6F0] font-mono">
          1. Service Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => updateField('service', 'PRINT')}
            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              config.service === 'PRINT'
                ? 'border-[#06D6F0] bg-[#06D6F0]/10 ring-2 ring-[#06D6F0]/20 shadow-md'
                : 'border-[#273244] bg-[#121821] hover:border-[#06D6F0]/30'
            }`}
          >
            <div
              className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                config.service === 'PRINT' ? 'bg-[#06D6F0] text-[#0B0F14] font-black' : 'bg-[#18212C] text-[#94A3B8]'
              }`}
            >
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#F1F5F9]">Laser Print</p>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">High-definition digital print from file</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('service', 'XEROX')}
            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              config.service === 'XEROX'
                ? 'border-[#06D6F0] bg-[#06D6F0]/10 ring-2 ring-[#06D6F0]/20 shadow-md'
                : 'border-[#273244] bg-[#121821] hover:border-[#06D6F0]/30'
            }`}
          >
            <div
              className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                config.service === 'XEROX' ? 'bg-[#06D6F0] text-[#0B0F14] font-black' : 'bg-[#18212C] text-[#94A3B8]'
              }`}
            >
              <Copy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#F1F5F9]">Standard Xerox</p>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">Fast economical photocopy reproduction</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Color Mode & Paper Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Color Mode */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
            2. Color Output
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('color', 'BW')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                config.color === 'BW'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <p className="text-sm font-bold">B&W (Monochrome)</p>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">Standard ₹2/page</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('color', 'COLOR')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                config.color === 'COLOR'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#00D4FF]" />
                <p className="text-sm font-bold">Full Color</p>
              </div>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">+₹6 surcharge</p>
            </button>
          </div>
        </div>

        {/* Paper Size */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
            3. Paper Size
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('paperSize', 'A4')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                config.paperSize === 'A4'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <p className="text-sm font-bold">A4 Standard</p>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">210 × 297 mm</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('paperSize', 'A3')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                config.paperSize === 'A3'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <p className="text-sm font-bold">A3 Poster / Large</p>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">297 × 420 mm (+₹5)</p>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sides & Copies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Sides */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
            4. Print Sides
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('sides', 'SINGLE')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                config.sides === 'SINGLE'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <p className="text-sm font-bold">Single-Sided</p>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">1 page per sheet</p>
            </button>

            <button
              type="button"
              onClick={() => updateField('sides', 'DOUBLE')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                config.sides === 'DOUBLE'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 font-bold text-[#F9FAFB]'
                  : 'border-[#273244] bg-[#0D111B] text-[#9CA3AF] hover:border-[#273244]'
              }`}
            >
              <p className="text-sm font-bold">Double-Sided (Duplex)</p>
              <p className="text-xs text-[#34D399] font-semibold mt-0.5">Eco Paper Saver</p>
            </button>
          </div>
        </div>

        {/* Copies Counter */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
            5. Number of Copies
          </label>
          <div className="flex items-center justify-between p-2.5 bg-[#0D111B] border border-[#273244] rounded-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => handleCopyChange(-1)}
              disabled={config.copies <= 1}
              className="w-10 h-10 rounded-xl bg-[#1A2232] text-[#F9FAFB] hover:bg-[#202B3D] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Decrease copies"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-lg font-black text-[#F9FAFB] font-mono">{config.copies}</span>
              <span className="text-xs text-[#9CA3AF] ml-1 font-medium">
                {config.copies === 1 ? 'set' : 'sets'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopyChange(1)}
              disabled={config.copies >= 50}
              className="w-10 h-10 rounded-xl bg-[#1A2232] text-[#F9FAFB] hover:bg-[#202B3D] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Increase copies"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Optional Finishing & Binding */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
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
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#00D4FF] bg-[#00D4FF]/10 ring-2 ring-[#00D4FF]/20 shadow-lg shadow-[#00D4FF]/10'
                    : 'border-[#273244] bg-[#0D111B] hover:border-[#273244]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#00D4FF]' : 'text-[#6B7280]'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-[#00D4FF] text-black font-black'
                        : 'bg-[#1A2232] text-[#9CA3AF]'
                    }`}
                  >
                    {item.price}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#F9FAFB]">{item.label}</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Custom Instructions */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-[#00D4FF] font-mono">
          7. Notes for Xerox Operator (Optional)
        </label>
        <textarea
          rows={2}
          value={config.instructions || ''}
          onChange={(e) => updateField('instructions', e.target.value)}
          placeholder="e.g. Please print page 3-12 only, or use blue front cover for spiral binding..."
          className="w-full px-4 py-3 rounded-2xl border border-[#273244] bg-[#0D111B] text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF]"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#273244]">
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
export default StepConfigure;
