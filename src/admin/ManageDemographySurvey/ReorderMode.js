import React, { useState, useEffect } from "react";
import { loadDemographyQuestions } from "./shared/demographyUtils";

const ReorderMode = ({ onSave, isLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const loadedQuestions = await loadDemographyQuestions();
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    setTimeout(() => {
      e.target.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newQuestions = [...questions];
    const draggedItem = newQuestions[draggedIndex];

    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedItem);

    setQuestions(newQuestions);
    setHasChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= questions.length) return;

    const newQuestions = [...questions];
    const item = newQuestions[fromIndex];
    newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, item);

    setQuestions(newQuestions);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    try {
      await onSave(questions);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8 text-gray-500">
          Loading questions...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">No questions found to reorder.</div>
          <p className="text-sm text-gray-400 mt-2">
            Use Form Mode or JSON Mode to add some questions first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Reorder Questions ({questions.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop questions to change their order, or use the arrow
            buttons
          </p>
        </div>
        {hasChanges && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {questions.map((question, index) => (
          <div
            key={question.id || index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all
              ${draggedIndex === index ? "opacity-40" : "opacity-100"}
              ${
                dragOverIndex === index
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }
              hover:border-gray-300 hover:shadow-sm
            `}
          >
            {/* Drag Handle */}
            <div className="flex flex-col gap-1 text-gray-400 cursor-grab active:cursor-grabbing">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            {/* Order Number */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 font-semibold rounded-full text-sm">
              {index + 1}
            </div>

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">
                {question.category}
              </div>
              <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {question.options?.length || 0} options
                </span>
                {question.required && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                    Required
                  </span>
                )}
                {question.allowMultipleSelections && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    Multiple{" "}
                    {question.selectUpto ? `(max ${question.selectUpto})` : ""}
                  </span>
                )}
              </div>
              {question.options && question.options.length > 0 && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  Options: {question.options.slice(0, 3).join(", ")}
                  {question.options.length > 3 &&
                    ` +${question.options.length - 3} more`}
                </div>
              )}
            </div>

            {/* Arrow Buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveQuestion(index, index - 1)}
                disabled={index === 0}
                className={`p-1 rounded transition-colors ${
                  index === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                title="Move up"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => moveQuestion(index, index + 1)}
                disabled={index === questions.length - 1}
                className={`p-1 rounded transition-colors ${
                  index === questions.length - 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                title="Move down"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleSaveOrder}
          disabled={!hasChanges || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            hasChanges && !isLoading
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Saving..." : "Save Order"}
        </button>
      </div>
    </div>
  );
};

export default ReorderMode;
