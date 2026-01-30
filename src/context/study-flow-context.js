import React, { createContext, useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

// Default study flow (fallback if Firestore is empty)
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

// Default task instructions
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
    triggerCount: 2,
    order: 2,
  },
  // rateResponse: {
  //   id: "rateResponse",
  //   name: "Rate Response Reminder",
  //   enabled: true,
  //   title: "Rate the Response",
  //   message:
  //     "Please rate how helpful this response was by clicking the star icon.",
  //   trigger: "afterResponse",
  //   triggerCount: 1,
  //   order: 3,
  // },
  saveDraft: {
    id: "saveDraft",
    name: "Save Draft Reminder",
    enabled: true,
    title: "Save Your Work",
    message:
      "Remember to save your draft periodically to avoid losing your work.",
    trigger: "periodic",
    intervalSeconds: 300,
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
    thresholdSeconds: 300,
    order: 5,
  },
  // submitConfirm: {
  //   id: "submitConfirm",
  //   name: "Submit Confirmation",
  //   enabled: true,
  //   title: "Confirm Submission",
  //   message:
  //     "Are you sure you want to submit? Please make sure you have completed your response and saved your notes.",
  //   trigger: "onSubmit",
  //   order: 6,
  // },
};

export const StudyFlowContext = createContext({
  steps: [],
  enabledSteps: [],
  taskInstructions: {},
  isLoading: true,
  getStepById: () => null,
  getNextStep: () => null,
  getPreviousStep: () => null,
  getTaskInstruction: () => null,
  isInstructionEnabled: () => false,
});

export const StudyFlowProvider = ({ children }) => {
  const [steps, setSteps] = useState([]);
  const [taskInstructions, setTaskInstructions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load study flow from Firestore
  useEffect(() => {
    const loadStudyFlow = async () => {
      try {
        const docRef = doc(db, "admin", "studyFlow");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Sort steps by order
          const sortedSteps = [...(data.steps || DEFAULT_STUDY_FLOW)].sort(
            (a, b) => a.order - b.order,
          );
          setSteps(sortedSteps);
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

  // Get only enabled steps
  const enabledSteps = steps.filter((step) => step.enabled);

  // Get step by ID
  const getStepById = (stepId) => {
    return steps.find((step) => step.id === stepId) || null;
  };

  // Get next step
  const getNextStep = (currentStepId) => {
    const currentIndex = enabledSteps.findIndex(
      (step) => step.id === currentStepId,
    );
    if (currentIndex === -1 || currentIndex >= enabledSteps.length - 1)
      return null;
    return enabledSteps[currentIndex + 1];
  };

  // Get previous step
  const getPreviousStep = (currentStepId) => {
    const currentIndex = enabledSteps.findIndex(
      (step) => step.id === currentStepId,
    );
    if (currentIndex <= 0) return null;
    return enabledSteps[currentIndex - 1];
  };

  // Get task instruction by ID
  const getTaskInstruction = (instructionId) => {
    return taskInstructions[instructionId] || null;
  };

  // Check if instruction is enabled
  const isInstructionEnabled = (instructionId) => {
    const instruction = taskInstructions[instructionId];
    return instruction?.enabled || false;
  };

  const value = {
    steps,
    enabledSteps,
    taskInstructions,
    isLoading,
    getStepById,
    getNextStep,
    getPreviousStep,
    getTaskInstruction,
    isInstructionEnabled,
  };

  return (
    <StudyFlowContext.Provider value={value}>
      {children}
    </StudyFlowContext.Provider>
  );
};

// Custom hook for easy access
export const useStudyFlow = () => {
  const context = useContext(StudyFlowContext);
  if (!context) {
    throw new Error("useStudyFlow must be used within a StudyFlowProvider");
  }
  return context;
};
