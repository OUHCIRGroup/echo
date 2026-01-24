import React, { createContext, useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

// Default study settings
const DEFAULT_STUDY_SETTINGS = {
  surveyType: "random", // "chatOnly", "searchOnly", "random"
  notesEnabled: true,
  minimumInteractions: 4,
};

export const StudySettingsContext = createContext({
  settings: DEFAULT_STUDY_SETTINGS,
  isLoading: true,
  getSurveyType: () => "random",
  isNotesEnabled: () => true,
  getMinimumInteractions: () => 4,
});

export const StudySettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_STUDY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load study settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "admin", "studySettings");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            surveyType: data.surveyType || DEFAULT_STUDY_SETTINGS.surveyType,
            notesEnabled:
              data.notesEnabled !== undefined
                ? data.notesEnabled
                : DEFAULT_STUDY_SETTINGS.notesEnabled,
            minimumInteractions:
              data.minimumInteractions ||
              DEFAULT_STUDY_SETTINGS.minimumInteractions,
          });
        } else {
          // Use defaults if no settings exist
          setSettings(DEFAULT_STUDY_SETTINGS);
        }
      } catch (error) {
        console.error("Error loading study settings:", error);
        setSettings(DEFAULT_STUDY_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Helper function to get survey type
  const getSurveyType = () => settings.surveyType;

  // Helper function to check if notes are enabled
  const isNotesEnabled = () => settings.notesEnabled;

  // Helper function to get minimum interactions
  const getMinimumInteractions = () => settings.minimumInteractions;

  // Function to determine task type based on survey setting
  const determineTaskType = () => {
    switch (settings.surveyType) {
      case "chatOnly":
        return "chat";
      case "searchOnly":
        return "search";
      case "random":
      default:
        // Random 50/50 assignment
        return Math.random() < 0.5 ? "chat" : "search";
    }
  };

  const contextValue = {
    settings,
    isLoading,
    getSurveyType,
    isNotesEnabled,
    getMinimumInteractions,
    determineTaskType,
  };

  return (
    <StudySettingsContext.Provider value={contextValue}>
      {children}
    </StudySettingsContext.Provider>
  );
};

// Custom hook for easier access
export const useStudySettings = () => {
  const context = useContext(StudySettingsContext);
  if (!context) {
    throw new Error(
      "useStudySettings must be used within a StudySettingsProvider",
    );
  }
  return context;
};

export default StudySettingsContext;
