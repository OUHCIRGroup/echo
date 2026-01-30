import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

import NoteContainer from "./NoteContainer";
import TaskContext from "../context/task-context";
import { useLocation } from "react-router-dom";

const NoteBar = ({ triggerBeforeSubmit, onSurveyCompleteRef }) => {
  const taskCtx = useContext(TaskContext);
  const location = useLocation();

  // State for minimum interactions (loaded from admin settings)
  const [minimumInteractions, setMinimumInteractions] = useState(4);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Load minimum interactions from admin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "admin", "studySettings");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMinimumInteractions(data.minimumInteractions || 4);
        }
      } catch (error) {
        console.error("Error loading study settings:", error);
        // Keep default of 4 if error
      }
    };

    loadSettings();
  }, []);

  // Handle survey completion - proceed with submit
  const handleSurveyComplete = () => {
    if (pendingSubmit) {
      setPendingSubmit(false);
      proceedWithSubmit();
    }
  };

  // Expose the handler to parent via ref
  if (onSurveyCompleteRef) {
    onSurveyCompleteRef.current = handleSurveyComplete;
  }

  // Actually proceed with showing the end task popup
  const proceedWithSubmit = () => {
    if (taskCtx.showEditNoteReminder) {
      // Notes need to be saved - show reminder with clear message
      alert(
        "Please save your notes before submitting. Click the 'Save' button in the notes area.",
      );
      taskCtx.setShowSaveButton(true);
      return;
    }
    taskCtx.setShowEndTaskPopUp(true);
  };

  const handleEndTask = async () => {
    const currentPath = location.pathname;
    let alertMessage;
    if (currentPath === "/chat") {
      alertMessage = `You can end the task only after ${minimumInteractions} interactions with the ChatGPT utilizing 'Type a prompt..'.`;
    } else {
      alertMessage = `You can end the task only after ${minimumInteractions} interactions with the search engine utilizing 'Search the web..'`;
    }

    if (taskCtx.queryCount >= minimumInteractions) {
      // Check for "beforeSubmit" survey only (not afterResponseReceive - that's for next query)
      if (triggerBeforeSubmit) {
        const beforeSubmitSurvey = triggerBeforeSubmit();
        if (beforeSubmitSurvey) {
          // Survey is now showing, mark that we want to submit after
          setPendingSubmit(true);
          return;
        }
      }

      // No pending survey, proceed with submit flow
      proceedWithSubmit();
    } else {
      console.log("taskCtx.queryCount", taskCtx.queryCount);
      alert(alertMessage);
      return;
    }
  };

  return (
    <div className="bg-[#e3e3e3] w-[50%] h-screen sticky flex top-0 pl-1 flex-col text-[18px] pb-10 pt-10 justify-between items-center overflow-y-auto">
      <div className="flex flex-col space-y-10">
        <div className="bg-[#FFFFFF] h-fit rounded-md mx-5 px-4 py-2 text-[16px] text-black">
          <label className="">
            Please add your answer to the task below. You can always click and
            edit it before final submission
          </label>
        </div>
        <div>
          <NoteContainer />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <button
          className="bg-[#FFFFFF] text-black px-6 py-2 rounded-lg w-fit mt-4"
          onClick={handleEndTask}
        >
          Submit
        </button>
        <label className="text-[12px] italic mt-2">
          Please submit your response ONLY when you are ready to complete/exit
          the current task. You can edit and save your response at any time
          before the completion.
        </label>
        {/* Show interaction progress */}
        <div className="text-[12px] mt-2 text-gray-600">
          Interactions: {taskCtx.queryCount} / {minimumInteractions} required
        </div>
      </div>
    </div>
  );
};

export default NoteBar;
