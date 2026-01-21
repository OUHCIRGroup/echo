import React from "react";

const InstructionPopup = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "ℹ️",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "✅",
      buttonBg: "bg-green-500 hover:bg-green-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "⚠️",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
    },
    welcome: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "👋",
      buttonBg: "bg-purple-500 hover:bg-purple-600",
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative max-w-md w-full mx-4 p-6 rounded-xl shadow-2xl ${styles.bg} border-2 ${styles.border}`}
      >
        {/* Icon */}
        <div className="text-4xl text-center mb-4">{styles.icon}</div>

        {/* Title */}
        {title && (
          <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
            {title}
          </h2>
        )}

        {/* Message */}
        {message && (
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {message}
          </p>
        )}

        {/* Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${styles.buttonBg}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default InstructionPopup;
