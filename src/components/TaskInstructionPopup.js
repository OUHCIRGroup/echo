import React from "react";

const TaskInstructionPopup = ({
  popup,
  onDismiss,
  onConfirm,
  isSubmitConfirmation = false,
}) => {
  if (!popup) return null;

  const getPopupStyle = () => {
    switch (popup.trigger) {
      case "onStart":
        return {
          bg: "bg-blue-50",
          border: "border-blue-300",
          icon: "📋",
          buttonBg: "bg-blue-500 hover:bg-blue-600",
        };
      case "afterResponse":
        if (popup.id === "rateResponse") {
          return {
            bg: "bg-yellow-50",
            border: "border-yellow-300",
            icon: "⭐",
            buttonBg: "bg-yellow-500 hover:bg-yellow-600",
          };
        }
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          icon: "📝",
          buttonBg: "bg-green-500 hover:bg-green-600",
        };
      case "periodic":
        return {
          bg: "bg-purple-50",
          border: "border-purple-300",
          icon: "💾",
          buttonBg: "bg-purple-500 hover:bg-purple-600",
        };
      case "timeRemaining":
        return {
          bg: "bg-orange-50",
          border: "border-orange-300",
          icon: "⏰",
          buttonBg: "bg-orange-500 hover:bg-orange-600",
        };
      case "onSubmit":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-300",
          icon: "✅",
          buttonBg: "bg-indigo-500 hover:bg-indigo-600",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-300",
          icon: "ℹ️",
          buttonBg: "bg-gray-500 hover:bg-gray-600",
        };
    }
  };

  const style = getPopupStyle();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onDismiss();
  };

  const handleCancel = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal */}
      <div
        className={`relative max-w-md w-full mx-4 p-6 rounded-xl shadow-2xl ${style.bg} border-2 ${style.border}`}
      >
        {/* Icon */}
        <div className="text-5xl text-center mb-4">{style.icon}</div>

        {/* Title */}
        {popup.title && (
          <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
            {popup.title}
          </h2>
        )}

        {/* Message */}
        {popup.message && (
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {popup.message}
          </p>
        )}

        {/* Buttons */}
        {isSubmitConfirmation ? (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 text-white font-medium rounded-lg transition-colors ${style.buttonBg}`}
            >
              Confirm Submit
            </button>
          </div>
        ) : (
          <button
            onClick={onDismiss}
            className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${style.buttonBg}`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskInstructionPopup;
