import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

// Default study flow configuration
const DEFAULT_STUDY_FLOW = [
  {
    id: "background",
    title: "Background Survey",
    path: "/demography",
    flowStateKey: "demographyCompleted",
    enabled: true,
    order: 1,
    estimatedTime: "1-2 minutes",
    isTaskStep: false,
  },
  {
    id: "preTask",
    title: "Pre-task Questionnaire",
    path: "/pre-task",
    flowStateKey: "preTask1Completed",
    enabled: true,
    order: 2,
    estimatedTime: "3-4 minutes",
    isTaskStep: false,
    requiresTask: true,
  },
  {
    id: "mainTask",
    title: "Main Task (Chat/Search)",
    path: "/{taskType}",
    flowStateKey: "task1Completed",
    enabled: true,
    order: 3,
    estimatedTime: "15-20 minutes",
    isTaskStep: true,
  },
  {
    id: "postTask",
    title: "Post-task Questionnaire",
    path: "/post-task",
    flowStateKey: "postTask1Completed",
    enabled: true,
    order: 4,
    estimatedTime: "3-4 minutes",
    isTaskStep: false,
    requiresTask: true,
  },
  {
    id: "sessionExperience",
    title: "Session Experience Survey",
    path: "/session-experience",
    flowStateKey: "sessionExperienceSurvey1Completed",
    enabled: true,
    order: 5,
    estimatedTime: "1-2 minutes",
    isTaskStep: false,
    requiresTask: true,
  },
  {
    id: "endOfStudy",
    title: "End of Study Survey",
    path: "/end",
    flowStateKey: "isEndOfStudySurveyCompleted",
    enabled: true,
    order: 6,
    estimatedTime: "1 minute",
    isTaskStep: false,
  },
];

// Default task instructions configuration
const DEFAULT_TASK_INSTRUCTIONS = {
  dataQuality: {
    id: "dataQuality",
    name: "Data Quality Reminder",
    enabled: true,
    title: "Important Reminder",
    message:
      "Please provide thoughtful and detailed responses. Your input is valuable for our research.",
    trigger: "onStart",
    order: 1,
  },
  takeNotes: {
    id: "takeNotes",
    name: "Take Notes Reminder",
    enabled: true,
    title: "Remember to Take Notes",
    message:
      "Don't forget to write down your findings and thoughts in the notes section on the right.",
    trigger: "afterResponse",
    triggerCount: 2, // Show after every N responses
    order: 2,
  },
  rateResponse: {
    id: "rateResponse",
    name: "Rate Response Reminder",
    enabled: true,
    title: "Rate the Response",
    message:
      "Please rate how helpful this response was by clicking the star icon.",
    trigger: "afterResponse",
    triggerCount: 1, // Show after every response
    order: 3,
  },
  saveDraft: {
    id: "saveDraft",
    name: "Save Draft Reminder",
    enabled: true,
    title: "Save Your Work",
    message:
      "Remember to save your draft periodically to avoid losing your work.",
    trigger: "periodic",
    intervalSeconds: 300, // Every 5 minutes
    order: 4,
  },
  timeWarning: {
    id: "timeWarning",
    name: "Time Warning",
    enabled: true,
    title: "Time Reminder",
    message:
      "You have 5 minutes remaining. Please start wrapping up your response.",
    trigger: "timeRemaining",
    thresholdSeconds: 300, // 5 minutes remaining
    order: 5,
  },
  submitConfirm: {
    id: "submitConfirm",
    name: "Submit Confirmation",
    enabled: true,
    title: "Confirm Submission",
    message:
      "Are you sure you want to submit? Please make sure you have completed your response and saved your notes.",
    trigger: "onSubmit",
    order: 6,
  },
};

const ManageStudyFlow = () => {
  const [steps, setSteps] = useState([]);
  const [taskInstructions, setTaskInstructions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("flow"); // "flow" or "instructions"

  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  // Load study flow from Firestore
  useEffect(() => {
    const loadStudyFlow = async () => {
      try {
        const docRef = doc(db, "admin", "studyFlow");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSteps(data.steps || DEFAULT_STUDY_FLOW);
          setTaskInstructions(
            data.taskInstructions || DEFAULT_TASK_INSTRUCTIONS,
          );
        } else {
          setSteps(DEFAULT_STUDY_FLOW);
          setTaskInstructions(DEFAULT_TASK_INSTRUCTIONS);
        }
      } catch (error) {
        console.error("Error loading study flow:", error);
        setSteps(DEFAULT_STUDY_FLOW);
        setTaskInstructions(DEFAULT_TASK_INSTRUCTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudyFlow();
  }, []);

  // Save study flow to Firestore
  const saveStudyFlow = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const docRef = doc(db, "admin", "studyFlow");
      await setDoc(docRef, {
        steps: steps,
        taskInstructions: taskInstructions,
        updatedAt: serverTimestamp(),
        updatedBy: authCtx.user?.uid || null,
      });

      setHasChanges(false);
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving study flow:", error);
      setSaveMessage("Error saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetToDefault = () => {
    const message =
      activeTab === "flow"
        ? "Are you sure you want to reset the study flow to default?"
        : "Are you sure you want to reset task instructions to default?";

    if (window.confirm(message)) {
      if (activeTab === "flow") {
        setSteps(DEFAULT_STUDY_FLOW);
      } else {
        setTaskInstructions(DEFAULT_TASK_INSTRUCTIONS);
      }
      setHasChanges(true);
    }
  };

  // Toggle step enabled/disabled
  const toggleStepEnabled = (stepId) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, enabled: !step.enabled } : step,
      ),
    );
    setHasChanges(true);
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedStep);

    // Update order numbers
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });

    setSteps(newSteps);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move step up/down
  const moveStep = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];

    // Update order numbers
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });

    setSteps(newSteps);
    setHasChanges(true);
  };

  // Toggle task instruction enabled/disabled
  const toggleInstructionEnabled = (instructionId) => {
    setTaskInstructions((prev) => ({
      ...prev,
      [instructionId]: {
        ...prev[instructionId],
        enabled: !prev[instructionId].enabled,
      },
    }));
    setHasChanges(true);
  };

  // Update task instruction field
  const updateInstructionField = (instructionId, field, value) => {
    setTaskInstructions((prev) => ({
      ...prev,
      [instructionId]: {
        ...prev[instructionId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Get trigger label
  const getTriggerLabel = (trigger) => {
    const labels = {
      onStart: "When task starts",
      afterResponse: "After AI/Search response",
      periodic: "Periodically",
      timeRemaining: "When time is low",
      onSubmit: "When submitting",
    };
    return labels[trigger] || trigger;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading study flow...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Study Flow Manager
              </h1>
              <p className="text-gray-600">
                Configure study steps order and task instructions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={saveStudyFlow}
                disabled={!hasChanges || isSaving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Messages */}
          {saveMessage && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                saveMessage.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {saveMessage}
            </div>
          )}

          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
              ⚠️ You have unsaved changes
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("flow")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "flow"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            }`}
          >
            📋 Study Flow Order
          </button>
          <button
            onClick={() => setActiveTab("instructions")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "instructions"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            }`}
          >
            💬 Task Instructions
          </button>
        </div>

        {/* Study Flow Tab */}
        {activeTab === "flow" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Study Steps Order
              </h2>
              <p className="text-sm text-gray-500">
                Drag and drop to reorder steps, or use the arrow buttons. Toggle
                the switch to enable/disable steps.
              </p>
            </div>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    step.enabled
                      ? "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-60"
                  } ${draggedIndex === index ? "shadow-lg scale-[1.02] border-blue-400" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Drag handle */}
                    <div className="text-gray-400 cursor-grab hover:text-gray-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>

                    {/* Order number */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>

                    {/* Step info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-lg">
                          {step.title}
                        </span>
                        {step.isTaskStep && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Main Task
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Estimated: {step.estimatedTime}
                      </div>
                    </div>

                    {/* Move buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
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
                        onClick={() => moveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
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

                    {/* Enable/Disable toggle */}
                    <button
                      onClick={() => toggleStepEnabled(step.id)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        step.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={step.enabled ? "Disable step" : "Enable step"}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          step.enabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Preview */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">
                Flow Preview (Enabled Steps)
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {steps
                  .filter((s) => s.enabled)
                  .map((step, idx, arr) => (
                    <React.Fragment key={step.id}>
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {step.title}
                      </span>
                      {idx < arr.length - 1 && (
                        <span className="text-gray-400 text-xl">→</span>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Task Instructions Tab */}
        {activeTab === "instructions" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Task Instructions & Reminders
              </h2>
              <p className="text-sm text-gray-500">
                Configure popup messages shown to participants during the main
                task (Chat/Search).
              </p>
            </div>

            <div className="space-y-4">
              {Object.values(taskInstructions)
                .sort((a, b) => a.order - b.order)
                .map((instruction) => (
                  <div
                    key={instruction.id}
                    className={`p-5 rounded-lg border-2 transition-all ${
                      instruction.enabled
                        ? "border-gray-200 bg-white"
                        : "border-gray-100 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">
                            {instruction.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {getTriggerLabel(instruction.trigger)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleInstructionEnabled(instruction.id)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          instruction.enabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                            instruction.enabled
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {instruction.enabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Popup Title
                          </label>
                          <input
                            type="text"
                            value={instruction.title}
                            onChange={(e) =>
                              updateInstructionField(
                                instruction.id,
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Message
                          </label>
                          <textarea
                            value={instruction.message}
                            onChange={(e) =>
                              updateInstructionField(
                                instruction.id,
                                "message",
                                e.target.value,
                              )
                            }
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Trigger-specific settings */}
                        {instruction.trigger === "afterResponse" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Show after every N responses
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={instruction.triggerCount || 1}
                              onChange={(e) =>
                                updateInstructionField(
                                  instruction.id,
                                  "triggerCount",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}

                        {instruction.trigger === "periodic" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Interval (seconds)
                            </label>
                            <input
                              type="number"
                              min="60"
                              step="60"
                              value={instruction.intervalSeconds || 300}
                              onChange={(e) =>
                                updateInstructionField(
                                  instruction.id,
                                  "intervalSeconds",
                                  parseInt(e.target.value) || 300,
                                )
                              }
                              className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500 ml-2">
                              (
                              {Math.floor(
                                (instruction.intervalSeconds || 300) / 60,
                              )}{" "}
                              minutes)
                            </span>
                          </div>
                        )}

                        {instruction.trigger === "timeRemaining" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Show when time remaining (seconds)
                            </label>
                            <input
                              type="number"
                              min="60"
                              step="60"
                              value={instruction.thresholdSeconds || 300}
                              onChange={(e) =>
                                updateInstructionField(
                                  instruction.id,
                                  "thresholdSeconds",
                                  parseInt(e.target.value) || 300,
                                )
                              }
                              className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500 ml-2">
                              (
                              {Math.floor(
                                (instruction.thresholdSeconds || 300) / 60,
                              )}{" "}
                              minutes)
                            </span>
                          </div>
                        )}

                        {/* Preview */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 mb-1">
                            Preview:
                          </div>
                          <div className="font-semibold text-gray-800">
                            {instruction.title || "(No title)"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {instruction.message || "(No message)"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudyFlow;
