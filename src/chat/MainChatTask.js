// import { useContext, useState, useEffect } from "react";
// import Navbar from "./navbar";
// import Chatbox from "./chatbox";
// import NoteBar from "./NoteBar";
// import SubmitBar from "./SubmitBar";
// import TaskContext from "../context/task-context";
// import EndTaskPopUp from "./EndTaskPopUp";
// import InstructionsPopUp from "../questionnaire/InstructionsPopUp";
// import { Timestamp, setDoc, doc, getDoc } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";

// const MainChatTask = () => {
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [notesEnabled, setNotesEnabled] = useState(true);
//   const [isLoadingSettings, setIsLoadingSettings] = useState(true);

//   const authCtx = useContext(AuthContext);
//   const taskCtx = useContext(TaskContext);

//   // Load notes setting from admin
//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         const docRef = doc(db, "admin", "studySettings");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setNotesEnabled(
//             data.notesEnabled !== undefined ? data.notesEnabled : true,
//           );
//         }
//       } catch (error) {
//         console.error("Error loading study settings:", error);
//       } finally {
//         setIsLoadingSettings(false);
//       }
//     };

//     loadSettings();
//   }, []);

//   const instructionText = notesEnabled
//     ? "Your task is under 'Current Task' on the left. Interact with ChatGPT using 'Type a prompt...' and compile your answer in the note box on the right before submitting."
//     : "Your task is under 'Current Task' on the left. Interact with ChatGPT using 'Type a prompt...' to complete your task, then click Submit when finished.";

//   useEffect(() => {
//     const saveStartTime = async () => {
//       try {
//         const startTime = Timestamp.now();
//         const userDocRef = doc(db, "chatTasks", authCtx.user.uid);
//         const docSnap = await getDoc(userDocRef);

//         if (!docSnap.exists()) {
//           await setDoc(userDocRef, { startedTs: startTime });
//         } else {
//           console.log("Task has already started");
//         }
//         console.log("Start time saved");
//       } catch (error) {
//         console.error("Error saving start time:", error);
//       }
//     };
//     if (authCtx.user) {
//       saveStartTime();
//     }
//   }, [authCtx.user]);

//   // Show loading while checking settings
//   if (isLoadingSettings) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#e3e3e3]">
//         <div className="text-lg text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-row bg-[#e3e3e3] w-screen">
//       <Navbar setShowInstructions={setShowInstructions} />
//       <Chatbox />
//       {/* Conditionally render NoteBar or SubmitBar based on admin setting */}
//       {notesEnabled ? <NoteBar /> : <SubmitBar />}
//       {taskCtx.showEndTaskPopUp && (
//         <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
//           <EndTaskPopUp collectionName="chatTasks" />
//         </div>
//       )}
//       {showInstructions && (
//         <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
//           <InstructionsPopUp
//             instructionText={instructionText}
//             setShowInstructions={setShowInstructions}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainChatTask;

import { useContext, useState, useEffect, useRef } from "react";
import Navbar from "./navbar";
import Chatbox from "./chatbox";
import NoteBar from "./NoteBar";
import SubmitBar from "./SubmitBar";
import TaskContext from "../context/task-context";
import EndTaskPopUp from "./EndTaskPopUp";
import InstructionsPopUp from "../questionnaire/InstructionsPopUp";
import { Timestamp, setDoc, doc, getDoc } from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
// Import in-situ surveys hook
import useInSituSurveys from "../hooks/useInSituSurveys";
import InSituSurveyPopup from "../components/InSituSurveyPopup";

const MainChatTask = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [notesEnabled, setNotesEnabled] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);

  // Ref for survey complete callback from sidebar
  const sidebarSurveyCompleteRef = useRef(null);
  // Ref for survey complete callback from chatbox
  const chatboxSurveyCompleteRef = useRef(null);

  // Single instance of in-situ surveys hook - shared across chatbox and sidebar
  const {
    currentSurvey,
    submitSurveyResponse,
    dismissSurvey,
    triggerAfterPromptSubmit,
    markResponseReceived,
    checkPendingResponseSurvey,
    triggerBeforeSubmit,
    hasPendingSurvey,
  } = useInSituSurveys({ taskType: "chat" });

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
    ? "Your task is under 'Current Task' on the left. Interact with ChatGPT using 'Type a prompt...' and compile your answer in the note box on the right before submitting."
    : "Your task is under 'Current Task' on the left. Interact with ChatGPT using 'Type a prompt...' to complete your task, then click Submit when finished.";

  useEffect(() => {
    const saveStartTime = async () => {
      try {
        const startTime = Timestamp.now();
        const userDocRef = doc(db, "chatTasks", authCtx.user.uid);
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

  // Handle survey submission - notify both chatbox and sidebar
  const handleSurveySubmit = (responseData) => {
    submitSurveyResponse(responseData);
    // Trigger callbacks for both chatbox and sidebar
    setTimeout(() => {
      if (chatboxSurveyCompleteRef.current) {
        chatboxSurveyCompleteRef.current();
      }
      if (sidebarSurveyCompleteRef.current) {
        sidebarSurveyCompleteRef.current();
      }
    }, 100);
  };

  // Handle survey dismissal - notify both chatbox and sidebar
  const handleSurveyDismiss = () => {
    dismissSurvey();
    // Trigger callbacks for both chatbox and sidebar
    setTimeout(() => {
      if (chatboxSurveyCompleteRef.current) {
        chatboxSurveyCompleteRef.current();
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
      <Chatbox
        triggerAfterPromptSubmit={triggerAfterPromptSubmit}
        markResponseReceived={markResponseReceived}
        checkPendingResponseSurvey={checkPendingResponseSurvey}
        onSurveyCompleteRef={chatboxSurveyCompleteRef}
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
          <EndTaskPopUp collectionName="chatTasks" />
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

      {/* Single In-situ survey popup for both chatbox and sidebar */}
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

export default MainChatTask;
