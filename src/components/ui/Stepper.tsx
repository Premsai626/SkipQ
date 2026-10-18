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
              className="flex flex-col items-center relative z-10 select-none min-w-0"
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#06D6F0] text-[#0B0F14] shadow-sm font-black cursor-pointer'
                    : isCurrent
                    ? 'bg-[#0B0F14] text-[#06D6F0] border-2 border-[#06D6F0] ring-2 sm:ring-4 ring-[#06D6F0]/20 shadow-md font-black'
                    : 'bg-[#18212C] text-[#6B7280] border border-[#273244] cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </button>
              <span
                className={`text-[9px] sm:text-xs mt-1 font-medium transition-colors text-center max-w-[54px] sm:max-w-none truncate sm:whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#06D6F0] font-bold'
                    : isCompleted
                    ? 'text-[#F1F5F9]'
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
