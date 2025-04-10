'use client';

import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { cn } from '@/app/lib/utils';

interface ModalProps {
  /**
   * Whether the modal is open or not
   */
  isOpen: boolean;
  /**
   * Callback when the modal should close
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Modal footer content
   */
  footer?: ReactNode;
  /**
   * Modal description shown under title
   */
  description?: string;
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /**
   * Prevent closing when clicking outside
   */
  preventOutsideClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  description,
  size = 'md',
  preventOutsideClose = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Close when pressing Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !preventOutsideClose) {
        onClose();
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventOutsideClose]);
  
  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (preventOutsideClose) return;
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Size class mapping with improved responsive sizes
  const sizeClasses = {
    sm: 'max-w-[90%] sm:max-w-sm',
    md: 'max-w-[95%] sm:max-w-md',
    lg: 'max-w-[98%] sm:max-w-lg md:max-w-xl',
    full: 'max-w-[98%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl',
  };

  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  // Use portal to render the modal at the document body level
  return createPortal(
    <Fragment>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        {/* Modal */}
        <div
          className={cn(
            "w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-all max-h-[95vh] flex flex-col",
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="mr-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full flex-shrink-0"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-grow">{children}</div>
          
          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>,
    document.body
  );
}