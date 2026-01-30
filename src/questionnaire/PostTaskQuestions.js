// import { useState, useEffect, useContext } from "react";
// import TaskContext from "../context/task-context";
// import { useLocation } from "react-router-dom";
// import { addDoc } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";
// import { collection, serverTimestamp } from "firebase/firestore";

// const PostTaskQuestions = ({ itemId, ratings, onRatingsChange }) => {
//   const taskCtx = useContext(TaskContext);
//   const authCtx = useContext(AuthContext);
//   const location = useLocation();
//   // Initialize states with the passed ratings if available
//   const [expectationRating, setExpectationRating] = useState(
//     ratings?.expectationRating || ""
//   );

//   useEffect(() => {
//     const checkAttention = async () => {
//       if (itemId.includes("2")) {
//         const service = location.search.includes("chat")
//           ? "ChatGPT"
//           : "Search Engine";
//         const expectedRating = `${service} can always fully fulfill the intention`;
//         const currentTask = urlParams.get("currentTask");
//         if (expectationRating !== expectedRating && expectationRating !== "") {
//           alert(
//             "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy."
//           );
//           // add to firebase that this user selected the incorrect option
//           await addDoc(collection(db, "attentionFails"), {
//             task: currentTask,
//             survey: "post-task",
//             question: instructionString,
//             intention: itemId,
//             expectedRating: expectedRating,
//             selectedRating: expectationRating,
//             userID: authCtx.user.uid,
//             ts: serverTimestamp(),
//           });
//         }
//       }
//     };
//     checkAttention();
//   }, [expectationRating]);

//   const isPostTask = location.pathname.includes("post-task"); // Check if the current path includes 'post-task'

//   var instructionString = isPostTask ? (
//     <span>
//       <strong>
//         Based on your experience in the session you just completed
//       </strong>
//       , please classify the intention described above into one of the following
//       categories.
//     </span>
//   ) : (
//     "Based on your Expectation, please classify the intention described above into one of the following categories."
//   );

//   if (itemId.includes("2")) {
//     instructionString =
//       "If you are reading this message, for this specific question, please carefully select the first option from the list below to verify your attention to detail.";
//     // remove the text attention check from the itemId
//   }

//   let service = "";
//   const urlParams = new URLSearchParams(window.location.search);
//   const currentTask = urlParams.get("currentTask");
//   if (currentTask === "chat") {
//     service = "ChatGPT";
//   } else {
//     service = "Search Engine";
//   }

//   const expectationList = [
//     `${service} can always fully fulfill the intention`,
//     `${service}  may be able to fully fulfill the intention if/once an effective query/prompt is successfully formulated (e.g. after several rounds of query/prompt modifications).`,
//     `${service}  may be able to partially fulfill the intention if/once an effective query/prompt is successfully formulated.`,
//     `${service}  is unlikely to fulfill the intention described above at all.`,
//   ];

//   // Update local state when the passed ratings change
//   useEffect(() => {
//     // Update local state based on the presence of ratings or reset to initial state if ratings are undefined
//     setExpectationRating(ratings?.expectationRating ?? "");
//   }, [ratings]);

//   // Update parent state when either rating changes
//   const handleRatingChange = () => {
//     if (expectationRating !== "") {
//       onRatingsChange(itemId, expectationRating);
//     }
//   };

//   // Call handleRatingChange whenever the ratings change
//   useEffect(() => {
//     handleRatingChange();
//   }, [expectationRating]);
//   //   console.log(`Expectation rating: ${expectationRating}`);

//   return (
//     <div
//       className="flex flex-col py-6 px-16 h-fit rounded-xl max-w-[50rem]
//         max-h-[85%] overflow-auto space-y-4 text-[18px] lg:text-[16px] text-black"
//     >
//       <div className="p-4 text-start flex flex-row space-x-2">
//         <span className="font-bold">Intention: </span>
//         <span className="">{itemId}</span>
//       </div>
//       <div className="bg-[#e3e3e3] py-6 px-16">
//         <h1 className="text-[20px] lg:text-[16px] mb-5">{instructionString}</h1>
//         {expectationList.map((item, index) => (
//           <div key={index} className="flex flex-row space-x-4 items-start">
//             <input
//               type="radio"
//               id={`expectation-${index}`}
//               name="expectationRating"
//               value={item}
//               checked={expectationRating === item}
//               onChange={(e) => setExpectationRating(e.target.value)}
//               className="w-4 h-4 form-radio bg-white mt-[6px]"
//             />
//             <label htmlFor={`expectation-${index}`}>{item}</label>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PostTaskQuestions;

import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";

const PostTaskQuestions = ({ itemId, ratings, onRatingsChange }) => {
  const [expectationRating, setExpectationRating] = useState(
    ratings?.expectationRating || "",
  );

  const location = useLocation();
  const authCtx = useContext(AuthContext);

  const urlParams = new URLSearchParams(window.location.search);
  const currentTask = urlParams.get("currentTask");

  let service = "Search Engine";
  if (currentTask === "chat") {
    service = "ChatGPT";
  } else if (currentTask === "virtual-assistant") {
    service = "Virtual Assistant";
  }

  // Check for attention check questions
  const isAttentionCheck = itemId.includes("2");

  // Attention check validation
  useEffect(() => {
    const checkAttention = async () => {
      if (isAttentionCheck) {
        const expectedRating = `${service} can always fully fulfill the intention`;
        if (expectationRating !== expectedRating && expectationRating !== "") {
          alert(
            "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy.",
          );
          await addDoc(collection(db, "attentionFails"), {
            task: currentTask,
            survey: "post-task",
            question: instructionString,
            intention: itemId,
            expectedRating: expectedRating,
            selectedRating: expectationRating,
            userID: authCtx.user.uid,
            ts: serverTimestamp(),
          });
        }
      }
    };
    checkAttention();
  }, [expectationRating]);

  let instructionString = (
    <span>
      <strong>
        Based on your experience in the session you just completed
      </strong>
      , please classify the intention described above into one of the following
      categories.
    </span>
  );

  if (isAttentionCheck) {
    instructionString =
      "If you are reading this message, for this specific question, please carefully select the first option from the list below to verify your attention to detail.";
  }

  const expectationList = [
    `${service} can always fully fulfill the intention`,
    `${service} may be able to fully fulfill the intention if/once an effective query/prompt is successfully formulated (e.g. after several rounds of query/prompt modifications).`,
    `${service} may be able to partially fulfill the intention if/once an effective query/prompt is successfully formulated.`,
    `${service} is unlikely to fulfill the intention described above at all.`,
  ];

  // Update local state when the passed ratings change
  useEffect(() => {
    setExpectationRating(ratings?.expectationRating ?? "");
  }, [ratings]);

  // Handle expectation rating change
  const handleExpectationChange = (value) => {
    setExpectationRating(value);
    onRatingsChange(itemId, value);
  };

  // Clean display of intention text
  const displayIntention = itemId.replace(" 2", "").split(" - ");
  const shortText = displayIntention[0];
  const longText = displayIntention[1] || "";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Intention Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Current Intention
            </h3>
            <p className="text-lg font-semibold text-gray-800">{shortText}</p>
            {longText && (
              <p className="text-gray-600 mt-1 capitalize">{longText}</p>
            )}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </span>
          <div>
            <p className="text-gray-800 font-medium leading-relaxed">
              {instructionString}
            </p>
          </div>
        </div>

        <div className="space-y-3 ml-11">
          {expectationList.map((item, index) => {
            const radioId = `expectation-${itemId}-${index}`;
            const isSelected = expectationRating === item;
            return (
              <label
                key={index}
                htmlFor={radioId}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  id={radioId}
                  name={`expectationRating-${itemId}`}
                  value={item}
                  checked={isSelected}
                  onChange={(e) => handleExpectationChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 mt-0.5"
                />
                <span
                  className={`text-sm leading-relaxed ${
                    isSelected ? "text-blue-800" : "text-gray-700"
                  }`}
                >
                  {item}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Completion Status */}
      {expectationRating && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          <span className="text-green-700 font-medium">
            Question completed! Select another intention from the sidebar.
          </span>
        </div>
      )}
    </div>
  );
};

export default PostTaskQuestions;
