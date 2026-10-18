import React, { useState, useMemo } from 'react';
import { Stepper } from '../../components/ui/Stepper';
import { StepUpload } from '../../components/student/StepUpload';
import { StepConfigure } from '../../components/student/StepConfigure';
import { StepReview } from '../../components/student/StepReview';
import { StepPayment } from '../../components/student/StepPayment';
import { StepSuccessToken } from '../../components/student/StepSuccessToken';
import { PriceSummaryCard } from '../../components/student/PriceSummaryCard';
import { DocumentItem, PrintConfiguration, PaymentMethod, Order } from '../../types';
import { calculatePrice } from '../../services/pricingService';
import { useOrders } from '../../context/OrderContext';

interface NewOrderPageProps {
  onNavigate: (path: string) => void;
}

export const NewOrderPage: React.FC<NewOrderPageProps> = ({ onNavigate }) => {
  const { createOrder } = useOrders();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Order state
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc_init_1',
      name: 'Compiler_Design_Unit2_Assignment.pdf',
      size: 1950000,
      type: 'application/pdf',
      pages: 8,
      uploadedAt: new Date().toISOString(),
    },
  ]);

  const [config, setConfig] = useState<PrintConfiguration>({
    service: 'PRINT',
    color: 'BW',
    paperSize: 'A4',
    sides: 'DOUBLE',
    copies: 2,
    finishing: 'STAPLE',
    instructions: 'Please staple top left corner.',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Dynamic price calculation
  const pricing = useMemo(() => calculatePrice(documents, config), [documents, config]);

  const steps = [
    { id: 1, name: 'Upload Files', shortName: 'Upload' },
    { id: 2, name: 'Configure Specs', shortName: 'Specs' },
    { id: 3, name: 'Review Order', shortName: 'Review' },
    { id: 4, name: 'Payment', shortName: 'Payment' },
    { id: 5, name: 'Token Generated', shortName: 'Token' },
  ];

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitPayment = async (method: PaymentMethod) => {
    const order = await createOrder({
      documents,
      config,
      paymentMethod: method,
    });

    setCreatedOrder(order);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Stepper Header */}
      <div className="bg-[#121821] rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border border-[#273244] shadow-md">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep && currentStep !== 5) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {/* Main Builder Grid */}
      {currentStep === 5 && createdOrder ? (
        <StepSuccessToken
          order={createdOrder}
          onTrackOrder={() => onNavigate(`/student/orders/${createdOrder.id}/tracking`)}
          onGoToDashboard={() => onNavigate('/student')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Step Form Area (7-8 cols on desktop) */}
          <div className="lg:col-span-8 bg-[#121821] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-[#273244] shadow-xl text-[#F1F5F9] min-w-0">
            {currentStep === 1 && (
              <StepUpload
                documents={documents}
                onChange={setDocuments}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <StepConfigure
                config={config}
                onChange={setConfig}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
              />
            )}

            {currentStep === 3 && (
              <StepReview
                documents={documents}
                config={config}
                pricing={pricing}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
              />
            )}

            {currentStep === 4 && (
              <StepPayment
                pricing={pricing}
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                onSubmitPayment={handleSubmitPayment}
                onPrev={handlePrevStep}
              />
            )}
          </div>

          {/* Floating Sticky Price Summary (4 cols on desktop) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <PriceSummaryCard
              documents={documents}
              config={config}
              pricing={pricing}
              onContinue={handleNextStep}
              continueText={
                currentStep === 1
                  ? 'Configure Print Specs →'
                  : currentStep === 2
                  ? 'Review Order Details →'
                  : currentStep === 3
                  ? 'Continue to Payment →'
                  : 'Authorize Payment'
              }
              showContinueButton={currentStep < 4}
              disabled={documents.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};
