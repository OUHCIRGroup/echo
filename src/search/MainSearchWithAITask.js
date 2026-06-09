import { useContext, useEffect, useState, useRef } from "react";
import Navbar from "../chat/navbar";
import NoteBar from "../chat/NoteBar";
import SubmitBar from "../chat/SubmitBar";
import TaskContext from "../context/task-context";
import EndTaskPopUp from "../chat/EndTaskPopUp";
import SearchWithAISummary from "./SearchWithAISummary";
import AuthContext from "../context/auth-context";
import InstructionsPopUp from "../questionnaire/InstructionsPopUp";
import { Timestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import useInSituSurveys from "../hooks/useInSituSurveys";
import InSituSurveyPopup from "../components/InSituSurveyPopup";

const MainSearchWithAITask = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [notesEnabled, setNotesEnabled] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);

  const sidebarSurveyCompleteRef = useRef(null);
  const searchPageSurveyCompleteRef = useRef(null);

  const {
    currentSurvey,
    submitSurveyResponse,
    dismissSurvey,
    triggerAfterSearchQuery,
    markResponseReceived,
    checkPendingResponseSurvey,
    triggerBeforeSubmit,
    hasPendingSurvey,
  } = useInSituSurveys({ taskType: "search" });

  // Load notes setting from admin
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "admin", "studySettings");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNotesEnabled(
            data.notesEnabled !== undefined ? data.notesEnabled : true,
          );
        }
      } catch (error) {
        console.error("Error loading study settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const instructionText = notesEnabled
    ? "Respond to the 'Current task' on the left, using 'Search the web...' for research. An AI summary will appear above results. Compile your answer in the note box on the right before submitting."
    : "Respond to the 'Current task' on the left, using 'Search the web...' for research. An AI summary will appear above results. Click Submit when finished.";

  useEffect(() => {
    const saveStartTime = async () => {
      try {
        const startTime = Timestamp.now();
        const userDocRef = doc(db, "searchTasks", authCtx.user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          await setDoc(userDocRef, { startedTs: startTime });
        } else {
          console.log("Task has already started");
        }
        console.log("Start time saved");
      } catch (error) {
        console.error("Error saving start time:", error);
      }
    };
    if (authCtx.user) {
      saveStartTime();
    }
  }, [authCtx.user]);

  const handleSurveySubmit = (responseData) => {
    submitSurveyResponse(responseData);
    setTimeout(() => {
      if (searchPageSurveyCompleteRef.current) {
        searchPageSurveyCompleteRef.current();
      }
      if (sidebarSurveyCompleteRef.current) {
        sidebarSurveyCompleteRef.current();
      }
    }, 100);
  };

  const handleSurveyDismiss = () => {
    dismissSurvey();
    setTimeout(() => {
      if (searchPageSurveyCompleteRef.current) {
        searchPageSurveyCompleteRef.current();
      }
      if (sidebarSurveyCompleteRef.current) {
        sidebarSurveyCompleteRef.current();
      }
    }, 100);
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e3e3e3]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row bg-[#e3e3e3] w-screen">
      <Navbar setShowInstructions={setShowInstructions} />
      <SearchWithAISummary
        triggerAfterSearchQuery={triggerAfterSearchQuery}
        markResponseReceived={markResponseReceived}
        checkPendingResponseSurvey={checkPendingResponseSurvey}
        onSurveyCompleteRef={searchPageSurveyCompleteRef}
      />
      {notesEnabled ? (
        <NoteBar
          triggerBeforeSubmit={triggerBeforeSubmit}
          onSurveyCompleteRef={sidebarSurveyCompleteRef}
        />
      ) : (
        <SubmitBar
          triggerBeforeSubmit={triggerBeforeSubmit}
          onSurveyCompleteRef={sidebarSurveyCompleteRef}
        />
      )}

      {taskCtx.showEndTaskPopUp && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
          <EndTaskPopUp collectionName="searchTasks" />
        </div>
      )}
      {showInstructions && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
          <InstructionsPopUp
            instructionText={instructionText}
            setShowInstructions={setShowInstructions}
          />
        </div>
      )}

      {currentSurvey && (
        <InSituSurveyPopup
          survey={currentSurvey}
          onSubmit={handleSurveySubmit}
          onDismiss={handleSurveyDismiss}
          allowSkip={false}
        />
      )}
    </div>
  );
};

export default MainSearchWithAITask;
