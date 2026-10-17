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
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-[#273244] -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#00D4FF] -z-0 transition-all duration-300 shadow-sm shadow-[#00D4FF]/40"
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
                    ? 'bg-[#00D4FF] text-black shadow-md shadow-[#00D4FF]/30 font-black cursor-pointer'
                    : isCurrent
                    ? 'bg-[#080B12] text-[#00D4FF] border-2 border-[#00D4FF] ring-4 ring-[#00D4FF]/20 shadow-lg shadow-[#00D4FF]/20 font-black'
                    : 'bg-[#111827] text-[#6B7280] border border-[#273244] cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </button>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[#00D4FF] font-bold'
                    : isCompleted
                    ? 'text-[#F9FAFB]'
                    : 'text-[#6B7280]'
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
export default Stepper;
