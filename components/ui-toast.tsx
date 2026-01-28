"use client";

import React from "react";

// Reuse our simple cn utility for now
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  isVisible,
  onClose,
}) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3s
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: "bg-cta text-white",
    error: "bg-red-500 text-white",
    info: "bg-primary text-white",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100 font-medium font-body flex items-center gap-2",
        styles[type],
      )}
    >
      {message}
    </div>
  );
};

// Simple hook usage pattern:
// const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
// showToast('Saved!', 'success')
