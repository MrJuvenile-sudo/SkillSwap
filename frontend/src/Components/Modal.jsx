// frontend/src/Components/Modal.jsx - Reusable Modal Dialog
import React, { useEffect } from 'react';
import { Icon } from './Icon.jsx';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-navy-100 p-6 sm:p-8 animate-dropdown`}>
          
          <div className="flex items-center justify-between pb-4 border-b border-navy-100">
            <h3 className="text-lg font-bold text-[#0B1E36]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-navy-400 hover:text-navy-900 hover:bg-navy-50 rounded-xl transition-colors"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
