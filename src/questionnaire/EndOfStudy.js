// import React, { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";
// import { doc, updateDoc, Timestamp } from "firebase/firestore";
// import { FlowContext } from "../context/flow-context";

// const EndOfStudy = () => {
//   const [mturkId, setMturkId] = useState("");
//   const authCtx = useContext(AuthContext);
//   const flowCtx = useContext(FlowContext);
//   const [endOfStudyStartedTs, setEndOfStudyStartedTs] = useState(
//     Timestamp.now()
//   );
//   const [showInput, setShowInput] = useState(true);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Assuming you might want to do something with the mturkId, like storing it
//     console.log("MTurk ID:", mturkId);
//     try {
//       const useDocRef = doc(db, "users", authCtx.user.uid);
//       // Update the user document with the MTurk ID
//       await updateDoc(useDocRef, {
//         mturkId: mturkId,
//         endOfStudyStartedTs: endOfStudyStartedTs,
//         endOfStudyCompleted: Timestamp.now(),
//       });
//       flowCtx.setIsEndOfStudySurveyCompleted(true);
//       setShowInput(false);
//     } catch (error) {
//       alert("There was an error submitting your MTurk ID. Please try again.");
//       console.error("Error submitting MTurk ID:", error);
//     }
//   };

//   return (
//     <div className="flex w-screen h-screen justify-center items-center">
//       <div className="flex flex-col items-center bg-[#f0f0f0] p-8 rounded-lg w-fit">
//         <h1 className="text-xl mb-4">
//           Thank you for participating in our study!
//         </h1>
//         {showInput && (
//           <div className="flex flex-col w-full items-center">
//             <p>Please enter your Amazon MTurk ID below.</p>
//             <form
//               onSubmit={handleSubmit}
//               className="mt-4 flex flex-col space-y-4 w-[70%] items-center"
//             >
//               <input
//                 type="text"
//                 value={mturkId}
//                 onChange={(e) => setMturkId(e.target.value)}
//                 placeholder="MTurk ID"
//                 className="text-center p-2 rounded-md border-2 border-gray-300 w-full "
//               />
//               <button
//                 type="submit"
//                 className="ml-4 bg-white text-black py-2 px-4 rounded-md w-fit"
//               >
//                 Click to End the Study
//               </button>
//             </form>
//           </div>
//         )}
//         {!showInput && (
//           <p className="text-xl mb-4"> You may now close this page</p>
//         )}
//         {!showInput && (
//           <div>
//             <p className="text-xl mb-4 font-bold underline">
//               Email to submit for MTurk
//             </p>
//             <p className="text-xl mb-4">{authCtx.user.email}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EndOfStudy;

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { FlowContext } from "../context/flow-context";

const EndOfStudy = () => {
  const [mturkId, setMturkId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const authCtx = useContext(AuthContext);
  const flowCtx = useContext(FlowContext);
  const [endOfStudyStartedTs] = useState(Timestamp.now());
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mturkId.trim()) {
      alert("Please enter your MTurk ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const useDocRef = doc(db, "users", authCtx.user.uid);
      await updateDoc(useDocRef, {
        mturkId: mturkId,
        endOfStudyStartedTs: endOfStudyStartedTs,
        endOfStudyCompleted: Timestamp.now(),
      });
      flowCtx.setIsEndOfStudySurveyCompleted(true);
      setIsCompleted(true);
    } catch (error) {
      alert("There was an error submitting your MTurk ID. Please try again.");
      console.error("Error submitting MTurk ID:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isCompleted ? (
          /* Pre-completion view */
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Thank You!
              </h1>
              <p className="text-gray-600">
                You have completed all the tasks in our study.
              </p>
            </div>

            {/* MTurk ID Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please enter your Amazon MTurk ID
                </label>
                <input
                  type="text"
                  value={mturkId}
                  onChange={(e) => setMturkId(e.target.value)}
                  placeholder="Enter your MTurk Worker ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !mturkId.trim()}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isSubmitting || !mturkId.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Complete Study"}
              </button>
            </form>
          </div>
        ) : (
          /* Post-completion view */
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Study Completed!
              </h1>
              <p className="text-gray-600">
                Thank you for participating in our research.
              </p>
            </div>

            {/* Completion Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">
                Email to Submit for MTurk
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-lg font-mono text-blue-600 break-all">
                  {authCtx.user?.email}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Please copy and submit this email address to complete your MTurk
                HIT.
              </p>
            </div>

            {/* Close Notice */}
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  ✓ You may now close this page
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndOfStudy;
