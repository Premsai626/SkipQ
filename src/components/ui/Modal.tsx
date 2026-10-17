import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-[#080B12]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog box in Obsidian Theme */}
      <div
        className={`relative w-full ${widthStyles[maxWidth]} bg-[#111827] rounded-3xl shadow-2xl border border-[#273244] z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 text-[#F9FAFB]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#273244] bg-[#0D111B]/60">
          <div>
            <h3 className="text-lg font-bold text-[#F9FAFB] tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-[#9CA3AF] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#202B3D] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
