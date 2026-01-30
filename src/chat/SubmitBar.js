import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import TaskContext from "../context/task-context";
import { useLocation } from "react-router-dom";

const SubmitBar = ({ triggerBeforeSubmit, onSurveyCompleteRef }) => {
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
      }
    };

    loadSettings();
  }, []);

  // Handle survey completion - proceed with submit
  const handleSurveyComplete = () => {
    if (pendingSubmit) {
      setPendingSubmit(false);
      taskCtx.setShowEndTaskPopUp(true);
    }
  };

  // Expose the handler to parent via ref
  if (onSurveyCompleteRef) {
    onSurveyCompleteRef.current = handleSurveyComplete;
  }

  const handleEndTask = async () => {
    const currentPath = location.pathname;
    var alert_message;
    if (currentPath === "/chat") {
      alert_message = `You can end the task only after ${minimumInteractions} interactions with the ChatGPT utilizing 'Type a prompt..'.`;
    } else {
      alert_message = `You can end the task only after ${minimumInteractions} interactions with the search engine utilizing 'Search the web..'`;
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

      // No pending survey, proceed with submit
      taskCtx.setShowEndTaskPopUp(true);
    } else {
      console.log("taskCtx.queryCount", taskCtx.queryCount);
      alert(alert_message);
      return;
    }
  };

  return (
    <div className="bg-[#e3e3e3] w-[200px] h-screen sticky flex top-0 pl-1 flex-col text-[18px] pb-10 pt-10 justify-center items-center">
      <div className="flex flex-col items-center">
        <button
          className="bg-[#FFFFFF] text-black px-6 py-2 rounded-lg w-fit"
          onClick={handleEndTask}
        >
          Submit Task
        </button>
        <label className="text-[12px] italic mt-2 text-center px-2">
          Submit when ready to complete the task.
        </label>
        {/* Show interaction progress */}
        <div className="text-[12px] mt-2 text-gray-600 text-center">
          {taskCtx.queryCount} / {minimumInteractions} interactions
        </div>
      </div>
    </div>
  );
};

export default SubmitBar;
