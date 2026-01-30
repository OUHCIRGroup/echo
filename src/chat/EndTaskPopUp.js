// import React, { useState, useRef, useContext } from "react";
// import { Timestamp, setDoc, doc, arrayUnion } from "firebase/firestore";
// import { db } from "../firebase-config";
// import TaskContext from "../context/task-context";
// import AuthContext from "../context/auth-context";
// import { useNavigate } from "react-router-dom";
// import { FlowContext } from "../context/flow-context";

// const EndTaskPopUp = (props) => {
//   const taskCtx = useContext(TaskContext);
//   const authCtx = useContext(AuthContext);
//   const flowCtx = useContext(FlowContext);
//   const navigate = useNavigate();

//   const handleYesClicked = () => {
//     if (taskCtx.showEditNoteReminder) {
//       taskCtx.setShowPopUp(true);
//       return;
//     }
//     taskCtx.setShowEndTaskPopUp(false);
//     const collectionRef = doc(db, props.collectionName, authCtx.user.uid);
//     setDoc(
//       collectionRef,
//       {
//         endTime: Timestamp.now(),
//         status: "completed",
//       },
//       { merge: true }
//     );
//     // see the url parameter and get firstTask
//     const urlParams = new URLSearchParams(window.location.search);
//     const flowState = urlParams.get("flowState");
//     flowCtx.updateFlowState(flowState);
//     // delay for 1 second
//     setTimeout(() => {
//       navigate("/home");
//     }, 1000);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center bg-[#e3e3e3] py-12 px-16 h-fit rounded-xl max-w-lg mx-auto">
//       <p className="text-black mb-8">
//         Are you sure that you are ready to submit the final answer? You will no
//         be able to do any further edits after final submission
//       </p>
//       <div className="flex space-x-4">
//         <button
//           className="bg-[#FFFFFF] text-black px-6 py-2 rounded-lg"
//           onClick={handleYesClicked}
//         >
//           Yes
//         </button>
//         <button
//           className="bg-white text-[#e3e3e3] px-6 py-2 rounded-lg"
//           onClick={() => taskCtx.setShowEndTaskPopUp(false)}
//         >
//           No
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EndTaskPopUp;

import React, { useState, useContext } from "react";
import { Timestamp, setDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase-config";
import TaskContext from "../context/task-context";
import AuthContext from "../context/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { FlowContext } from "../context/flow-context";

const EndTaskPopUp = (props) => {
  const taskCtx = useContext(TaskContext);
  const authCtx = useContext(AuthContext);
  const flowCtx = useContext(FlowContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYesClicked = async () => {
    // Check if notes need to be saved (only if notes feature is enabled)
    if (taskCtx.showEditNoteReminder) {
      // Auto-save the notes before proceeding
      const taskCategory = location.pathname.split("/")[1];
      const customDocID = `${authCtx.user.uid}${taskCategory}`;
      const noteDocumentRef = doc(db, "notes", customDocID);

      const noteObject = {
        noteInHTML: taskCtx.note?.noteInHTML || "",
        serializedContent: taskCtx.note?.serializedContent || "",
        ts: Timestamp.now(),
        autoSavedOnSubmit: true,
      };

      try {
        await setDoc(
          noteDocumentRef,
          {
            taskCategory,
            userID: authCtx.user.uid,
            notesArray: arrayUnion(noteObject),
          },
          { merge: true },
        );
        console.log("Notes auto-saved on submit");
        taskCtx.setShowSaveButton(false);
        taskCtx.setShowEditNoteReminder(false);
      } catch (error) {
        console.error("Error auto-saving notes:", error);
        // Continue with submission even if note save fails
      }
    }

    setIsSubmitting(true);

    try {
      taskCtx.setShowEndTaskPopUp(false);
      const collectionRef = doc(db, props.collectionName, authCtx.user.uid);
      await setDoc(
        collectionRef,
        {
          endTime: Timestamp.now(),
          status: "completed",
        },
        { merge: true },
      );

      // Get the flow state from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const flowState = urlParams.get("flowState");
      flowCtx.updateFlowState(flowState);

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (error) {
      console.error("Error completing task:", error);
      setIsSubmitting(false);
      alert("There was an error submitting your task. Please try again.");
    }
  };

  const handleNoClicked = () => {
    taskCtx.setShowEndTaskPopUp(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center bg-[#e3e3e3] py-12 px-16 h-fit rounded-xl max-w-lg mx-auto shadow-xl">
        <p className="text-black mb-8 text-center">
          Are you sure that you are ready to submit the final answer? You will
          not be able to do any further edits after final submission.
        </p>

        {taskCtx.showEditNoteReminder && (
          <p className="text-amber-600 mb-4 text-sm text-center">
            Note: Your notes will be automatically saved when you submit.
          </p>
        )}

        <div className="flex space-x-4">
          <button
            className={`bg-[#FFFFFF] text-black px-6 py-2 rounded-lg transition-colors ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            onClick={handleYesClicked}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Yes, Submit"}
          </button>
          <button
            className="bg-white text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={handleNoClicked}
            disabled={isSubmitting}
          >
            No, Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndTaskPopUp;
