'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div 
        className="relative bg-gray-900/95 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        data-modal-scroll="true"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#6b7280 #374151'
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <h3 className="text-lg font-semibold text-white font-mono text-center flex-1">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 