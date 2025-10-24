// src/components/ConfirmationDialog.jsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

// Define styles for different dialog variants
const variantStyles = {
    danger: {
        icon: Trash2,
        iconContainer: 'bg-red-100',
        iconColor: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    success: {
        icon: CheckCircle,
        iconContainer: 'bg-green-100',
        iconColor: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
    warning: {
        icon: AlertTriangle,
        iconContainer: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        button: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
    },
    info: {
        icon: Info,
        iconContainer: 'bg-blue-100',
        iconColor: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
};

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  variant = 'danger',
  icon: CustomIcon,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  // Effect to handle the mounting and unmounting animations
  useEffect(() => {
    if (isOpen) {
      // When the dialog is opened, we want to trigger the animation
      const timer = setTimeout(() => {
        setIsShowing(true);
      }, 10); // A tiny delay to allow the DOM to update for the transition
      return () => clearTimeout(timer);
    } else {
      // When closing, the animation is handled by the handleClose function
      setIsShowing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 200); // Duration should match the transition duration
  };
  
  const handleConfirm = () => {
    onConfirm();
    handleClose(); // Close the modal after confirming
  }

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // We render the component if isOpen is true, allowing the exit animation to play
  if (!isOpen) {
    return null;
  }

  const styles = variantStyles[variant] || variantStyles.danger;
  const Icon = CustomIcon || styles.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="dialog-title"
      role="dialog"
      aria-modal="true"
    >
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-900 transition-opacity duration-200 ease-out ${isShowing ? 'bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`} 
          onClick={handleClose}
        ></div>

        {/* Modal Content */}
        <div
            className={`relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all duration-200 ease-out ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start space-x-4">
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconContainer} sm:mx-0 sm:h-10 sm:w-10`}>
                <Icon className={`h-6 w-6 ${styles.iconColor}`} aria-hidden="true" />
            </div>
            <div className="mt-0 flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold leading-6 text-gray-900" id="dialog-title">
                {title}
                </h3>
                <div className="mt-2">
                <p className="text-sm text-gray-600">
                    {description}
                </p>
                </div>
            </div>
            </div>

            <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
                type="button"
                className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm transition-colors ${styles.button}`}
                onClick={handleConfirm}
            >
                {confirmButtonText}
            </button>
            <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                onClick={handleClose}
            >
                {cancelButtonText}
            </button>
            </div>
        </div>
    </div>
  );
};


export default ConfirmationDialog;