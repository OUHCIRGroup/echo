import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

// Default in-situ survey configuration
const DEFAULT_INSITU_SURVEYS = {
  afterResponseReceive: {
    id: "afterResponseReceive",
    name: "After Response Receive Survey",
    enabled: false,
    trigger: "afterResponseReceive",
    triggerCount: 1, // Show after every N responses
    title: "Response Feedback",
    description: "Help us understand your experience with this response.",
    questions: [
      {
        id: "helpfulness",
        type: "likert",
        question: "How helpful was this response?",
        scale: 5,
        labels: { min: "Not helpful", max: "Very helpful" },
        required: true,
      },
      {
        id: "clarity",
        type: "likert",
        question: "How clear and understandable was the response?",
        scale: 5,
        labels: { min: "Very unclear", max: "Very clear" },
        required: true,
      },
    ],
    order: 1,
  },
  periodicCheckIn: {
    id: "periodicCheckIn",
    name: "Periodic Check-in Survey",
    enabled: false,
    trigger: "periodic",
    intervalSeconds: 300, // Every 5 minutes
    title: "How's it going?",
    description: "Quick check-in on your progress.",
    questions: [
      {
        id: "progress",
        type: "multipleChoice",
        question: "How would you describe your progress on the task?",
        options: [
          "Making good progress",
          "Somewhat stuck",
          "Very stuck",
          "Almost done",
        ],
        required: true,
      },
      {
        id: "frustration",
        type: "likert",
        question: "How frustrated are you feeling right now?",
        scale: 5,
        labels: { min: "Not frustrated", max: "Very frustrated" },
        required: true,
      },
    ],
    order: 3,
  },
  //   onSearchQuery: {
  //     id: "onSearchQuery",
  //     name: "After Search Query Survey",
  //     enabled: false,
  //     trigger: "afterSearchQuery",
  //     triggerCount: 3, // Show after every N queries
  //     title: "Search Feedback",
  //     description: "Tell us about this search.",
  //     questions: [
  //       {
  //         id: "searchRelevance",
  //         type: "likert",
  //         question: "How relevant were the search results?",
  //         scale: 5,
  //         labels: { min: "Not relevant", max: "Very relevant" },
  //         required: true,
  //       },
  //     ],
  //     order: 4,
  //   },
  beforeSubmit: {
    id: "beforeSubmit",
    name: "Before Task Submit Survey",
    enabled: false,
    trigger: "beforeSubmit",
    title: "Final Thoughts",
    description: "Before you submit, please answer these questions.",
    questions: [
      {
        id: "satisfaction",
        type: "likert",
        question: "How satisfied are you with your final answer?",
        scale: 5,
        labels: { min: "Very unsatisfied", max: "Very satisfied" },
        required: true,
      },
      {
        id: "openFeedback",
        type: "openEnded",
        question: "Any additional thoughts about the task?",
        placeholder: "Optional feedback...",
        required: false,
      },
    ],
    order: 2,
  },
};

// Question type options
const QUESTION_TYPES = [
  { value: "likert", label: "Likert Scale (1-5 or 1-7)" },
  { value: "multipleChoice", label: "Multiple Choice" },
  { value: "openEnded", label: "Open-Ended Text" },
  { value: "yesNo", label: "Yes/No" },
  { value: "slider", label: "Slider (0-100)" },
];

// Trigger type options
const TRIGGER_TYPES = [
  {
    value: "afterResponseReceive",
    label: "After LLM/Search returns a response",
  },
  { value: "periodic", label: "Periodically (time-based)" },
  { value: "beforeSubmit", label: "Before task submission" },
];

const ManageInSituSurveys = () => {
  const [surveys, setSurveys] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedSurvey, setExpandedSurvey] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  // Load surveys from Firestore
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const docRef = doc(db, "admin", "inSituSurveys");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSurveys(docSnap.data().surveys || DEFAULT_INSITU_SURVEYS);
        } else {
          setSurveys(DEFAULT_INSITU_SURVEYS);
        }
      } catch (error) {
        console.error("Error loading in-situ surveys:", error);
        setSurveys(DEFAULT_INSITU_SURVEYS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
  }, []);

  // Save surveys to Firestore
  const saveSurveys = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const docRef = doc(db, "admin", "inSituSurveys");
      await setDoc(docRef, {
        surveys: surveys,
        updatedAt: serverTimestamp(),
        updatedBy: authCtx.user?.uid || null,
      });

      setHasChanges(false);
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving surveys:", error);
      setSaveMessage("Error saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle survey enabled/disabled
  const toggleSurveyEnabled = (surveyId) => {
    setSurveys((prev) => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        enabled: !prev[surveyId].enabled,
      },
    }));
    setHasChanges(true);
  };

  // Update survey field
  const updateSurveyField = (surveyId, field, value) => {
    setSurveys((prev) => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Add question to survey
  const addQuestion = (surveyId) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: "likert",
      question: "New question",
      scale: 5,
      labels: { min: "Low", max: "High" },
      required: true,
    };

    setSurveys((prev) => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        questions: [...(prev[surveyId].questions || []), newQuestion],
      },
    }));
    setHasChanges(true);
    setEditingQuestion({
      surveyId,
      questionIndex: surveys[surveyId].questions.length,
    });
  };

  // Update question
  const updateQuestion = (surveyId, questionIndex, field, value) => {
    setSurveys((prev) => {
      const newQuestions = [...prev[surveyId].questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [field]: value,
      };
      return {
        ...prev,
        [surveyId]: {
          ...prev[surveyId],
          questions: newQuestions,
        },
      };
    });
    setHasChanges(true);
  };

  // Remove question
  const removeQuestion = (surveyId, questionIndex) => {
    if (window.confirm("Are you sure you want to remove this question?")) {
      setSurveys((prev) => ({
        ...prev,
        [surveyId]: {
          ...prev[surveyId],
          questions: prev[surveyId].questions.filter(
            (_, i) => i !== questionIndex,
          ),
        },
      }));
      setHasChanges(true);
      setEditingQuestion(null);
    }
  };

  // Add new custom survey
  const addNewSurvey = () => {
    const newId = `custom_${Date.now()}`;
    const newSurvey = {
      id: newId,
      name: "New Custom Survey",
      enabled: false,
      trigger: "afterResponseReceive",
      triggerCount: 2,
      title: "Survey Title",
      description: "Survey description",
      questions: [],
      order: Object.keys(surveys).length + 1,
    };

    setSurveys((prev) => ({
      ...prev,
      [newId]: newSurvey,
    }));
    setHasChanges(true);
    setExpandedSurvey(newId);
  };

  // Remove custom survey
  const removeSurvey = (surveyId) => {
    if (window.confirm("Are you sure you want to remove this survey?")) {
      setSurveys((prev) => {
        const newSurveys = { ...prev };
        delete newSurveys[surveyId];
        return newSurveys;
      });
      setHasChanges(true);
      setExpandedSurvey(null);
    }
  };

  // Reset to defaults
  const resetToDefault = () => {
    if (
      window.confirm("Are you sure you want to reset all surveys to default?")
    ) {
      setSurveys(DEFAULT_INSITU_SURVEYS);
      setHasChanges(true);
    }
  };

  // Get trigger label
  const getTriggerLabel = (trigger) => {
    const found = TRIGGER_TYPES.find((t) => t.value === trigger);
    return found ? found.label : trigger;
  };

  // Render question editor
  const renderQuestionEditor = (surveyId, question, questionIndex) => {
    const isEditing =
      editingQuestion?.surveyId === surveyId &&
      editingQuestion?.questionIndex === questionIndex;

    return (
      <div
        key={question.id}
        className={`p-4 rounded-lg border ${
          isEditing
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-medium text-gray-500">
            Question {questionIndex + 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditingQuestion(
                  isEditing ? null : { surveyId, questionIndex },
                )
              }
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => removeQuestion(surveyId, questionIndex)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Question Type
              </label>
              <select
                value={question.type}
                onChange={(e) =>
                  updateQuestion(
                    surveyId,
                    questionIndex,
                    "type",
                    e.target.value,
                  )
                }
                className="w-full p-2 border rounded-lg"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Question Text
              </label>
              <textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(
                    surveyId,
                    questionIndex,
                    "question",
                    e.target.value,
                  )
                }
                className="w-full p-2 border rounded-lg"
                rows={2}
              />
            </div>

            {/* Type-specific options */}
            {question.type === "likert" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Scale Points
                  </label>
                  <select
                    value={question.scale}
                    onChange={(e) =>
                      updateQuestion(
                        surveyId,
                        questionIndex,
                        "scale",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-24 p-2 border rounded-lg"
                  >
                    <option value={5}>5-point</option>
                    <option value={7}>7-point</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Min Label
                    </label>
                    <input
                      type="text"
                      value={question.labels?.min || ""}
                      onChange={(e) =>
                        updateQuestion(surveyId, questionIndex, "labels", {
                          ...question.labels,
                          min: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Max Label
                    </label>
                    <input
                      type="text"
                      value={question.labels?.max || ""}
                      onChange={(e) =>
                        updateQuestion(surveyId, questionIndex, "labels", {
                          ...question.labels,
                          max: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {question.type === "multipleChoice" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Options (one per line)
                </label>
                <textarea
                  value={(question.options || []).join("\n")}
                  onChange={(e) =>
                    updateQuestion(
                      surveyId,
                      questionIndex,
                      "options",
                      e.target.value.split("\n").filter((o) => o.trim()),
                    )
                  }
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            {question.type === "openEnded" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={question.placeholder || ""}
                  onChange={(e) =>
                    updateQuestion(
                      surveyId,
                      questionIndex,
                      "placeholder",
                      e.target.value,
                    )
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`required-${question.id}`}
                checked={question.required}
                onChange={(e) =>
                  updateQuestion(
                    surveyId,
                    questionIndex,
                    "required",
                    e.target.checked,
                  )
                }
                className="rounded"
              />
              <label
                htmlFor={`required-${question.id}`}
                className="text-sm text-gray-700"
              >
                Required question
              </label>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-800">{question.question}</p>
            <p className="text-sm text-gray-500 mt-1">
              Type:{" "}
              {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
              {question.required && " • Required"}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading surveys...</div>
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
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                In-Situ Survey Manager
              </h1>
              <p className="text-gray-600">
                Configure pop-up questionnaires triggered by participant actions
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
                onClick={saveSurveys}
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

        {/* Add New Survey Button */}
        <div className="mb-6">
          <button
            onClick={addNewSurvey}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            + Add Custom Survey
          </button>
        </div>

        {/* Survey Cards */}
        <div className="space-y-4">
          {Object.values(surveys)
            .sort((a, b) => a.order - b.order)
            .map((survey) => (
              <div
                key={survey.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  survey.enabled ? "border-green-300" : "border-gray-200"
                }`}
              >
                {/* Survey Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedSurvey(
                      expandedSurvey === survey.id ? null : survey.id,
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl ${
                          expandedSurvey === survey.id ? "rotate-90" : ""
                        } transition-transform`}
                      >
                        ▸
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {survey.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getTriggerLabel(survey.trigger)}
                          {survey.triggerCount &&
                            ` (every ${survey.triggerCount} interactions)`}
                          {survey.intervalSeconds &&
                            ` (every ${survey.intervalSeconds / 60} minutes)`}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          survey.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {survey.enabled ? "ENABLED" : "DISABLED"}
                      </span>
                      <button
                        onClick={() => toggleSurveyEnabled(survey.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          survey.enabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            survey.enabled ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedSurvey === survey.id && (
                  <div className="border-t px-4 py-4 space-y-4">
                    {/* Survey Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Survey Name
                        </label>
                        <input
                          type="text"
                          value={survey.name}
                          onChange={(e) =>
                            updateSurveyField(survey.id, "name", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Trigger Type
                        </label>
                        <select
                          value={survey.trigger}
                          onChange={(e) =>
                            updateSurveyField(
                              survey.id,
                              "trigger",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        >
                          {TRIGGER_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Trigger-specific settings */}
                    {[
                      "afterPromptSubmit",
                      "afterResponseReceive",
                      "afterSearchQuery",
                    ].includes(survey.trigger) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Show after every N interactions
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={survey.triggerCount || 1}
                          onChange={(e) =>
                            updateSurveyField(
                              survey.id,
                              "triggerCount",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-24 p-2 border rounded-lg"
                        />
                      </div>
                    )}

                    {survey.trigger === "periodic" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Interval (seconds)
                        </label>
                        <input
                          type="number"
                          min="60"
                          value={survey.intervalSeconds || 300}
                          onChange={(e) =>
                            updateSurveyField(
                              survey.id,
                              "intervalSeconds",
                              parseInt(e.target.value) || 300,
                            )
                          }
                          className="w-32 p-2 border rounded-lg"
                        />
                        <span className="text-sm text-gray-500 ml-2">
                          ({(survey.intervalSeconds || 300) / 60} minutes)
                        </span>
                      </div>
                    )}

                    {/* Title and Description */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Popup Title
                        </label>
                        <input
                          type="text"
                          value={survey.title}
                          onChange={(e) =>
                            updateSurveyField(
                              survey.id,
                              "title",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={survey.description}
                          onChange={(e) =>
                            updateSurveyField(
                              survey.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Questions Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">
                          Questions ({survey.questions?.length || 0})
                        </h4>
                        <button
                          onClick={() => addQuestion(survey.id)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(survey.questions || []).map((question, index) =>
                          renderQuestionEditor(survey.id, question, index),
                        )}

                        {(!survey.questions ||
                          survey.questions.length === 0) && (
                          <p className="text-gray-500 text-center py-4 italic">
                            No questions yet. Click "Add Question" to create
                            one.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remove Survey Button (only for custom surveys) */}
                    {survey.id.startsWith("custom_") && (
                      <div className="border-t pt-4 mt-4">
                        <button
                          onClick={() => removeSurvey(survey.id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                          Remove This Survey
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageInSituSurveys;
