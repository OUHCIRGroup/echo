import { useContext, useEffect, useState, useRef } from "react";
import Navbar from "../chat/navbar";
import NoteBar from "../chat/NoteBar";
import SubmitBar from "../chat/SubmitBar";
import TaskContext from "../context/task-context";
import EndTaskPopUp from "../chat/EndTaskPopUp";
import SearchPage from "./SearchPage";
import AuthContext from "../context/auth-context";
import InstructionsPopUp from "../questionnaire/InstructionsPopUp";
import { Timestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
// Import in-situ surveys hook
import useInSituSurveys from "../hooks/useInSituSurveys";
import InSituSurveyPopup from "../components/InSituSurveyPopup";

const MainSearchTask = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [notesEnabled, setNotesEnabled] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);

  // Ref for survey complete callback from sidebar
  const sidebarSurveyCompleteRef = useRef(null);
  // Ref for survey complete callback from search page
  const searchPageSurveyCompleteRef = useRef(null);

  // Single instance of in-situ surveys hook - shared across search page and sidebar
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
    ? "Respond to the 'Current task' on the left, using 'Search the web...' for research. Compile your answer in the note box on the right before submitting."
    : "Respond to the 'Current task' on the left, using 'Search the web...' for research. Click Submit when finished.";

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

  // Handle survey submission - notify both search page and sidebar
  const handleSurveySubmit = (responseData) => {
    submitSurveyResponse(responseData);
    // Trigger callbacks for both search page and sidebar
    setTimeout(() => {
      if (searchPageSurveyCompleteRef.current) {
        searchPageSurveyCompleteRef.current();
      }
      if (sidebarSurveyCompleteRef.current) {
        sidebarSurveyCompleteRef.current();
      }
    }, 100);
  };

  // Handle survey dismissal - notify both search page and sidebar
  const handleSurveyDismiss = () => {
    dismissSurvey();
    // Trigger callbacks for both search page and sidebar
    setTimeout(() => {
      if (searchPageSurveyCompleteRef.current) {
        searchPageSurveyCompleteRef.current();
      }
      if (sidebarSurveyCompleteRef.current) {
        sidebarSurveyCompleteRef.current();
      }
    }, 100);
  };

  // Show loading while checking settings
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
      <SearchPage
        triggerAfterSearchQuery={triggerAfterSearchQuery}
        markResponseReceived={markResponseReceived}
        checkPendingResponseSurvey={checkPendingResponseSurvey}
        onSurveyCompleteRef={searchPageSurveyCompleteRef}
      />
      {/* Conditionally render NoteBar or SubmitBar based on admin setting */}
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

      {/* Single In-situ survey popup for both search page and sidebar */}
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

export default MainSearchTask;
