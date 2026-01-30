// import { useState, useEffect, useContext } from "react";
// import TaskContext from "../context/task-context";
// import { useLocation } from "react-router-dom";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";

// const Questions = ({ itemId, ratings, onRatingsChange }) => {
//   // Initialize states with the passed ratings if available
//   const [expectationRating, setExpectationRating] = useState(
//     ratings?.expectationRating || ""
//   );
//   const [usageFrequencyRating, setUsageFrequencyRating] = useState(
//     ratings?.usageFrequencyRating || ""
//   );
//   const taskCtx = useContext(TaskContext);
//   const location = useLocation();
//   const authCtx = useContext(AuthContext);
//   const isPostTask = location.pathname.includes("post-task"); // Check if the current path includes 'post-task'
//   let service = "";
//   const urlParams = new URLSearchParams(window.location.search);
//   const currentTask = urlParams.get("currentTask");

//   if (currentTask === "chat") {
//     service = "ChatGPT";
//   } else if (currentTask === "virtual-assistant") {
//     service = "Virtual Assistant";
//   } else {
//     service = "Search Engine";
//   }

//   useEffect(() => {
//     const checkAttention = async () => {
//       if (itemId.includes("2")) {
//         const expectedRating = `${service}  may be able to partially fulfill the intention if/once an effective query/prompt is successfully formulated.`;
//         const expectedUsageFrequency = usageFrequency[4];
//         const currentTask = urlParams.get("currentTask");
//         if (expectationRating !== expectedRating && expectationRating !== "") {
//           alert(
//             "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy."
//           );
//           // add to firebase that this user selected the incorrect option
//           await addDoc(collection(db, "attentionFails"), {
//             task: currentTask,
//             survey: "pre-task",
//             question: instructionString,
//             intention: itemId,
//             expectedRating: expectedRating,
//             selectedRating: expectationRating,
//             userID: authCtx.user.uid,
//             ts: serverTimestamp(),
//           });
//         }
//         if (
//           usageFrequencyRating !== expectedUsageFrequency &&
//           usageFrequencyRating !== ""
//         ) {
//           alert(
//             "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy."
//           );
//           // add to firebase that this user selected the incorrect option
//           await addDoc(collection(db, "attentionFails"), {
//             task: currentTask,
//             survey: "pre-task",
//             question: instructionString,
//             intention: itemId,
//             expectedRating: expectedUsageFrequency,
//             selectedRating: usageFrequencyRating,
//             userID: authCtx.user.uid,
//             ts: serverTimestamp(),
//           });
//         }
//       }
//     };
//     checkAttention();
//   }, [expectationRating, usageFrequencyRating]);

//   var instructionString = isPostTask
//     ? "Based on your experience in the session you just completed, please classify the intention described above into one of the following categories."
//     : "Based on your Expectation, please classify the intention described above into one of the following categories.";
//   var instructionString2 = undefined;
//   if (itemId.includes("2")) {
//     instructionString =
//       "If you are reading this message, for this specific question, please carefully select the third option from the list below to verify your attention to detail.";
//     instructionString2 =
//       "If you are reading this message, for this specific question, please select the last option from the list below";
//     // remove the text attention check from the itemId
//   }

//   const expectationList = [
//     `${service} can always fully fulfill the intention`,
//     `${service}  may be able to fully fulfill the intention if/once an effective query/prompt is successfully formulated (e.g. after several rounds of query/prompt modifications).`,
//     `${service}  may be able to partially fulfill the intention if/once an effective query/prompt is successfully formulated.`,
//     `${service}  is unlikely to fulfill the intention described above at all.`,
//   ];

//   const usageFrequency = [
//     "Never or Rarely Used: less than once a month",
//     "Infrequently Used: about once a month",
//     "Moderately Used: engage with the system on a weekly basis",
//     "Frequently Used: use the system several times a week",
//     "Heavily Used: use the system daily or almost daily",
//   ];

//   // Update local state when the passed ratings change
//   useEffect(() => {
//     // Update local state based on the presence of ratings or reset to initial state if ratings are undefined
//     setExpectationRating(ratings?.expectationRating ?? "");
//     setUsageFrequencyRating(ratings?.usageFrequencyRating ?? "");
//   }, [ratings]);

//   // Update parent state when either rating changes
//   const handleRatingChange = () => {
//     if (expectationRating !== "" && usageFrequencyRating !== "") {
//       onRatingsChange(itemId, expectationRating, usageFrequencyRating);
//     }
//   };

//   // Call handleRatingChange whenever the ratings change
//   useEffect(() => {
//     handleRatingChange();
//   }, [expectationRating, usageFrequencyRating]);
//   //   console.log(`Expectation rating: ${expectationRating}`);

//   return (
//     <div
//       className="flex flex-col py-12 px-16 h-fit rounded-xl max-w-[50rem]
//         max-h-[85%] overflow-auto space-y-4 lg:text-[16px] text-[18px] text-black"
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
//       {!isPostTask && (
//         <div className="bg-[#e3e3e3] py-6 px-16">
//           {instructionString2 === undefined && (
//             <h1 className="text-[20px] lg:text-[16px] mb-5">
//               In your prior interaction experiences, how often did you try to
//               use {service} to fulfill the intention described above?
//             </h1>
//           )}
//           {instructionString2 !== undefined && (
//             <h1 className="text-[20px] lg:text-[16px] mb-5">
//               {instructionString2}
//             </h1>
//           )}
//           {usageFrequency.map((item, index) => (
//             <div key={index} className="flex flex-row space-x-4 items-center">
//               <input
//                 type="radio"
//                 id={`usage-${index}`}
//                 name="usageFrequencyRating"
//                 value={item}
//                 checked={usageFrequencyRating === item}
//                 onChange={(e) => setUsageFrequencyRating(e.target.value)}
//                 className="w-4 h-4 form-radio bg-white"
//               />
//               <label htmlFor={`usage-${index}`}>{item}</label>
//             </div>
//           ))}
//         </div>
//       )}
//       {/* TODO: Implement these if you get time*/}
//       {/* <div className="flex flex-row justify-around mt-16">
//         <button
//           className="bg-[#e3e3e3] px-6 py-2 rounded-2xl"
//           //   onClick={handleSubmit}
//         >
//           {"< Previous"}
//         </button>
//         <button
//           className="bg-[#e3e3e3] px-6 py-2 rounded-2xl"
//           //   onClick={handleSubmit}
//         >
//           {"Next >"}
//         </button>
//       </div> */}
//     </div>
//   );
// };

// export default Questions;

import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";

const Questions = ({ itemId, ratings, onRatingsChange }) => {
  const [expectationRating, setExpectationRating] = useState(
    ratings?.expectationRating || "",
  );
  const [usageFrequencyRating, setUsageFrequencyRating] = useState(
    ratings?.usageFrequencyRating || "",
  );

  const location = useLocation();
  const authCtx = useContext(AuthContext);
  const isPostTask = location.pathname.includes("post-task");

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

  let instructionString = isPostTask
    ? "Based on your experience in the session you just completed, please classify the intention described above into one of the following categories."
    : "Based on your Expectation, please classify the intention described above into one of the following categories.";

  let instructionString2 = undefined;

  if (isAttentionCheck) {
    instructionString =
      "If you are reading this message, for this specific question, please carefully select the third option from the list below to verify your attention to detail.";
    instructionString2 =
      "If you are reading this message, for this specific question, please select the last option from the list below";
  }

  const expectationList = [
    `${service} can always fully fulfill the intention`,
    `${service} may be able to fully fulfill the intention if/once an effective query/prompt is successfully formulated (e.g. after several rounds of query/prompt modifications).`,
    `${service} may be able to partially fulfill the intention if/once an effective query/prompt is successfully formulated.`,
    `${service} is unlikely to fulfill the intention described above at all.`,
  ];

  const usageFrequency = [
    "Never or Rarely Used: less than once a month",
    "Infrequently Used: about once a month",
    "Moderately Used: engage with the system on a weekly basis",
    "Frequently Used: use the system several times a week",
    "Heavily Used: use the system daily or almost daily",
  ];

  // Update local state when ratings prop changes or itemId changes
  useEffect(() => {
    setExpectationRating(ratings?.expectationRating ?? "");
    setUsageFrequencyRating(ratings?.usageFrequencyRating ?? "");
  }, [ratings, itemId]);

  // Handle expectation rating change
  const handleExpectationChange = (value) => {
    setExpectationRating(value);
    // Update parent immediately with new expectation and current usage
    if (value !== "" && (usageFrequencyRating !== "" || isPostTask)) {
      onRatingsChange(itemId, value, usageFrequencyRating);
    }
  };

  // Handle usage frequency rating change
  const handleUsageFrequencyChange = (value) => {
    setUsageFrequencyRating(value);
    // Update parent immediately with current expectation and new usage
    if (expectationRating !== "" && value !== "") {
      onRatingsChange(itemId, expectationRating, value);
    }
  };

  // Attention check validation
  useEffect(() => {
    const checkAttention = async () => {
      if (isAttentionCheck) {
        const expectedRating = expectationList[2]; // Third option
        const expectedUsageFrequency = usageFrequency[4]; // Last option

        if (expectationRating !== expectedRating && expectationRating !== "") {
          alert(
            "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy.",
          );
          await addDoc(collection(db, "attentionFails"), {
            task: currentTask,
            survey: "pre-task",
            question: instructionString,
            intention: itemId,
            expectedRating: expectedRating,
            selectedRating: expectationRating,
            userID: authCtx.user.uid,
            ts: serverTimestamp(),
          });
        }

        if (
          usageFrequencyRating !== expectedUsageFrequency &&
          usageFrequencyRating !== ""
        ) {
          alert(
            "Uh-oh, wrong pick! Please pay closer attention to maintain data accuracy.",
          );
          await addDoc(collection(db, "attentionFails"), {
            task: currentTask,
            survey: "pre-task",
            question: instructionString2,
            intention: itemId,
            expectedRating: expectedUsageFrequency,
            selectedRating: usageFrequencyRating,
            userID: authCtx.user.uid,
            ts: serverTimestamp(),
          });
        }
      }
    };
    checkAttention();
  }, [expectationRating, usageFrequencyRating]);

  // Extract intention text for display
  const intentionParts = itemId.split(" - ");
  const shortText = intentionParts[0] || itemId;
  const longText = intentionParts[1] || "";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Intention Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Current Intention
            </h2>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">{shortText}</span>
              {longText && <span className="text-gray-500"> — {longText}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Question 1: Expectation Rating */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </span>
          <p className="text-gray-800 font-medium">{instructionString}</p>
        </div>

        <div className="space-y-2 ml-10">
          {expectationList.map((item, index) => {
            const radioId = `expectation-${itemId}-${index}`;
            return (
              <label
                key={index}
                htmlFor={radioId}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  expectationRating === item
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  id={radioId}
                  name={`expectationRating-${itemId}`}
                  value={item}
                  checked={expectationRating === item}
                  onChange={(e) => handleExpectationChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 mt-0.5"
                />
                <span className="text-gray-700 text-sm">{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Question 2: Usage Frequency (only for pre-task) */}
      {!isPostTask && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </span>
            <p className="text-gray-800 font-medium">
              {instructionString2 ||
                `In your prior interaction experiences, how often did you try to use ${service} to fulfill the intention described above?`}
            </p>
          </div>

          <div className="space-y-2 ml-10">
            {usageFrequency.map((item, index) => {
              const radioId = `usage-${itemId}-${index}`;
              return (
                <label
                  key={index}
                  htmlFor={radioId}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    usageFrequencyRating === item
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    id={radioId}
                    name={`usageFrequencyRating-${itemId}`}
                    value={item}
                    checked={usageFrequencyRating === item}
                    onChange={(e) => handleUsageFrequencyChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 text-sm">{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {expectationRating && usageFrequencyRating && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg
            className="w-5 h-5 text-green-600"
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
          <span className="text-green-700 font-medium">
            Questions completed! Select another intention from the sidebar.
          </span>
        </div>
      )}
    </div>
  );
};

export default Questions;
