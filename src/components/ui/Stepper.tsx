import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  shortName?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-600 -z-0 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 select-none"
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'bg-brand-600 text-white shadow-sm ring-4 ring-brand-50 cursor-pointer'
                    : isCurrent
                    ? 'bg-white text-brand-600 border-2 border-brand-600 ring-4 ring-brand-100 shadow-sm'
                    : 'bg-white text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </button>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-brand-600 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">{step.name}</span>
                <span className="sm:hidden">{step.shortName || step.name}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
