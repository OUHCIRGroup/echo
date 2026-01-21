import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/auth-context";
import FormMode from "./FormMode";
import JsonMode from "./JsonMode";
import ViewMode from "./ViewMode";
import ReorderMode from "./ReorderMode";
import { saveDemographyQuestions } from "./shared/demographyUtils";

const ManageDemographySurvey = () => {
  const [mode, setMode] = useState("view");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSave = async (items) => {
    setStatus(null);
    setIsLoading(true);

    try {
      await saveDemographyQuestions(items, authCtx);
      setStatus({
        type: "success",
        message: `Saved ${items.length} questions to admin/demographySurvey.`,
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: `Failed to save questions: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manage Demography Survey
          </h1>
          <p className="text-gray-600">
            Create, manage, and reorder demographic survey questions
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Mode
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMode("view")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "view"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📋 View
            </button>
            <button
              onClick={() => setMode("reorder")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "reorder"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ↕️ Reorder
            </button>
            <button
              onClick={() => setMode("form")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "form"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ✏️ Form Mode
            </button>
            <button
              onClick={() => setMode("json")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "json"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {"{ }"} JSON Mode
            </button>
          </div>

          {/* Mode Description */}
          <div className="mt-4 text-sm text-gray-600">
            {mode === "view" &&
              "View all current demographic questions and their configuration."}
            {mode === "reorder" &&
              "Drag and drop to change the order questions appear to participants."}
            {mode === "form" &&
              "Create new questions using an interactive form."}
            {mode === "json" && "Import/export questions using JSON format."}
          </div>
        </div>

        {/* Status Messages */}
        {status && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Render appropriate mode component */}
        {mode === "view" && <ViewMode />}

        {mode === "reorder" && (
          <ReorderMode onSave={handleSave} isLoading={isLoading} />
        )}

        {mode === "form" && (
          <FormMode onSave={handleSave} isLoading={isLoading} />
        )}

        {mode === "json" && (
          <JsonMode onSave={handleSave} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ManageDemographySurvey;
