import React, { useState } from "react";

/**
 * InSituSurveyPopup - A popup component for displaying in-situ survey questions
 *
 * Props:
 * - survey: The survey configuration object with questions
 * - onSubmit: Callback function with survey responses
 * - onDismiss: Callback function when survey is dismissed/skipped
 * - allowSkip: Whether to show a skip button (default: false)
 */
const InSituSurveyPopup = ({
  survey,
  onSubmit,
  onDismiss,
  allowSkip = false,
}) => {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!survey) return null;

  const { title, description, questions = [] } = survey;

  // Update response for a question
  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Validate and submit
  const handleSubmit = () => {
    const newErrors = {};

    questions.forEach((question) => {
      if (question.required) {
        const response = responses[question.id];
        if (
          response === undefined ||
          response === null ||
          response === "" ||
          (typeof response === "string" && response.trim() === "")
        ) {
          newErrors[question.id] = "This question is required";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      surveyId: survey.id,
      responses,
      submittedAt: new Date().toISOString(),
    });
  };

  // Render question based on type
  const renderQuestion = (question, index) => {
    const { id, type, question: questionText, required } = question;
    const hasError = !!errors[id];

    return (
      <div
        key={id}
        className={`mb-6 p-4 rounded-lg ${
          hasError ? "bg-red-50 border border-red-200" : "bg-gray-50"
        }`}
      >
        <label className="block text-gray-800 font-medium mb-3">
          {index + 1}. {questionText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === "likert" && renderLikertScale(question)}
        {type === "multipleChoice" && renderMultipleChoice(question)}
        {type === "openEnded" && renderOpenEnded(question)}
        {type === "yesNo" && renderYesNo(question)}
        {type === "slider" && renderSlider(question)}

        {hasError && <p className="text-red-500 text-sm mt-2">{errors[id]}</p>}
      </div>
    );
  };

  // Likert scale renderer
  const renderLikertScale = (question) => {
    const { id, scale = 5, labels = {} } = question;
    const points = Array.from({ length: scale }, (_, i) => i + 1);
    const currentValue = responses[id];

    return (
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{labels.min || "Low"}</span>
          <span>{labels.max || "High"}</span>
        </div>
        <div className="flex justify-between gap-2">
          {points.map((point) => (
            <button
              key={point}
              onClick={() => handleResponseChange(id, point)}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                currentValue === point
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              {point}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Multiple choice renderer
  const renderMultipleChoice = (question) => {
    const { id, options = [] } = question;
    const currentValue = responses[id];

    return (
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              currentValue === option
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={currentValue === option}
              onChange={() => handleResponseChange(id, option)}
              className="mr-3"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    );
  };

  // Open-ended text renderer
  const renderOpenEnded = (question) => {
    const { id, placeholder = "Enter your response..." } = question;

    return (
      <textarea
        value={responses[id] || ""}
        onChange={(e) => handleResponseChange(id, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
      />
    );
  };

  // Yes/No renderer
  const renderYesNo = (question) => {
    const { id } = question;
    const currentValue = responses[id];

    return (
      <div className="flex gap-4">
        {["Yes", "No"].map((option) => (
          <button
            key={option}
            onClick={() => handleResponseChange(id, option)}
            className={`flex-1 py-3 rounded-lg border-2 transition-all ${
              currentValue === option
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  // Slider renderer
  const renderSlider = (question) => {
    const { id, labels = {} } = question;
    const currentValue = responses[id] ?? 50;

    return (
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{labels.min || "0"}</span>
          <span className="font-bold text-blue-500">{currentValue}</span>
          <span>{labels.max || "100"}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          onChange={(e) => handleResponseChange(id, parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${currentValue}%, #E5E7EB ${currentValue}%, #E5E7EB 100%)`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal */}
      <div className="relative max-w-lg w-full mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-4xl text-center mb-3">📋</div>
          {title && (
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 text-center mt-2">{description}</p>
          )}
        </div>

        {/* Questions - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {questions.map((question, index) => renderQuestion(question, index))}
        </div>

        {/* Footer with buttons */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          {allowSkip && (
            <button
              onClick={onDismiss}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Skip
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InSituSurveyPopup;
