// import { useContext, useState, useMemo, useEffect } from "react";
// import {
//   addDoc,
//   collection,
//   Timestamp,
//   getDocs,
//   query,
//   where,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";
// import Questions from "./PreTaskQuestions";
// import { FlowContext } from "../context/flow-context";
// import { useNavigate } from "react-router-dom";
// import InstructionsPopUp from "./InstructionsPopUp";
// import { useLocation } from "react-router-dom";

// const QuestionnnaireMain = () => {
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [ratings, setRatings] = useState({});
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [localTopology, setLocalTopology] = useState([]);
//   const [topologyLoading, setTopologyLoading] = useState(true);
//   const [startedTs] = useState(Timestamp.now());

//   const authCtx = useContext(AuthContext);
//   const flowCtx = useContext(FlowContext);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get current task and set instruction text
//   const currentTask = new URLSearchParams(location.search).get("currentTask");

//   let instructionText =
//     "Read each intention on the left, then answer the survey questions. Click on intentions to navigate between them. Complete all intentions to submit.";

//   if (currentTask === "search") {
//     instructionText =
//       "Please reflect on your personal experience using search engines (e.g. Google, Bing), and answer the following questions for each intention.";
//   } else if (currentTask === "virtual-assistant") {
//     instructionText =
//       "Please reflect on your personal experience using virtual assistants (e.g. Siri, Cortana, Google Assistant), and answer the following questions.";
//   } else if (currentTask === "chat") {
//     instructionText =
//       "Please reflect on your expectations of ChatGPT, and answer the following questions for each intention.";
//   }

//   // Load topology data from Firebase
//   useEffect(() => {
//     const fetchTopologyData = async () => {
//       try {
//         const docRef = doc(db, "admin", "topology");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const topology = data.topology || [];
//           setLocalTopology(topology);
//         }
//       } catch (error) {
//         console.error("Error fetching topology data:", error);
//         setLocalTopology([]);
//       } finally {
//         setTopologyLoading(false);
//       }
//     };

//     fetchTopologyData();
//   }, []);

//   // Get ratings from firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       const task = new URLSearchParams(location.search).get("currentTask");
//       try {
//         const collectionRef = collection(db, "questionnaireResponses");
//         const q = query(
//           collectionRef,
//           where("isPostTask", "==", false),
//           where("userID", "==", authCtx.user.uid),
//           where("currentTask", "==", task),
//         );
//         const querySnapshot = await getDocs(q);
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           setRatings(data.ratings);
//         });
//       } catch (e) {
//         console.error("Error fetching document: ", e);
//       }
//     };
//     if (authCtx.user) {
//       fetchData();
//     }
//   }, [authCtx, location.search]);

//   // Add attention check
//   useEffect(() => {
//     if (topologyLoading || localTopology.length === 0) {
//       return;
//     }

//     const topologyCopy = localTopology.map((section) => ({
//       ...section,
//       intention_list: [...section.intention_list],
//     }));

//     if (topologyCopy.length > 3) {
//       const randomSectionIndex = 3;
//       const randomPos = Math.floor(
//         Math.random() * topologyCopy[randomSectionIndex].intention_list.length,
//       );
//       const repeatedIntention = {
//         ...topologyCopy[randomSectionIndex].intention_list[randomPos],
//         short_text:
//           topologyCopy[randomSectionIndex].intention_list[randomPos]
//             .short_text + " 2",
//         attentionCheck: true,
//       };

//       topologyCopy[randomSectionIndex].intention_list.splice(
//         randomPos + 1,
//         0,
//         repeatedIntention,
//       );
//       setLocalTopology(topologyCopy);
//     }
//   }, [localTopology.length, topologyLoading]);

//   const handleSelectItem = (itemId) => {
//     setSelectedItem(itemId);
//   };

//   const handleRatingsChange = (
//     itemId,
//     expectationRating,
//     usageFrequencyRating,
//   ) => {
//     setRatings((prevRatings) => ({
//       ...prevRatings,
//       [itemId]: { expectationRating, usageFrequencyRating },
//     }));
//   };

//   const handleSubmit = async () => {
//     const searchParams = new URLSearchParams(location.search);
//     const isPostTask = location.pathname.includes("post-task");
//     const task = searchParams.get("currentTask");

//     const dataToSave = {
//       userID: authCtx.user.uid,
//       ratings,
//       isPostTask,
//       currentTask: task,
//       startedTs: startedTs,
//       completedTs: Timestamp.now(),
//     };

//     try {
//       await addDoc(collection(db, "questionnaireResponses"), dataToSave);
//       const flowState = searchParams.get("flowState");
//       flowCtx.updateFlowState(flowState);
//       navigate("/");
//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
//   };

//   // Build flat list of all intentions for progress tracking
//   const allIntentions = useMemo(() => {
//     return localTopology.flatMap((section) =>
//       section.intention_list.map((intention) => ({
//         ...intention,
//         category: section.intention_type,
//         itemId: `${intention.short_text} - ${intention.long_text.toLowerCase()}`,
//       })),
//     );
//   }, [localTopology]);

//   // Calculate progress
//   const progressPercentage = useMemo(() => {
//     if (topologyLoading || allIntentions.length === 0) return 0;

//     const completedItems = Object.values(ratings).filter(
//       (rating) =>
//         rating.expectationRating !== undefined &&
//         rating.usageFrequencyRating !== undefined,
//     ).length;

//     return (completedItems / allIntentions.length) * 100;
//   }, [ratings, allIntentions, topologyLoading]);

//   const completedCount = Object.values(ratings).filter(
//     (rating) =>
//       rating.expectationRating !== undefined &&
//       rating.usageFrequencyRating !== undefined,
//   ).length;

//   const allQuestionsAnswered = progressPercentage === 100;

//   // Check if an intention is completed
//   const isIntentionCompleted = (itemId) => {
//     const rating = ratings[itemId];
//     return (
//       rating?.expectationRating !== undefined &&
//       rating?.usageFrequencyRating !== undefined
//     );
//   };

//   if (topologyLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <div className="text-lg text-gray-600">Loading questionnaire...</div>
//         </div>
//       </div>
//     );
//   }

//   if (localTopology.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//           <div className="text-red-500 text-5xl mb-4">⚠️</div>
//           <div className="text-lg text-red-600">No topology data found.</div>
//           <p className="text-gray-500 mt-2">
//             Please contact the administrator.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
//         {/* Sidebar Header */}
//         <div className="p-4 border-b border-gray-200 bg-gray-50">
//           <h2 className="font-semibold text-gray-800">Intentions</h2>
//           <p className="text-sm text-gray-500 mt-1">
//             Select an intention to answer questions
//           </p>
//         </div>

//         {/* Intentions List */}
//         <div className="flex-1 overflow-y-auto">
//           {localTopology.map((section, sectionIndex) => (
//             <div key={sectionIndex} className="border-b border-gray-100">
//               {/* Category Header */}
//               <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
//                 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
//                   {section.intention_type}
//                 </h3>
//               </div>

//               {/* Intentions in Category */}
//               <div className="py-1">
//                 {section.intention_list.map((intention, index) => {
//                   const itemId = `${intention.short_text} - ${intention.long_text.toLowerCase()}`;
//                   const isSelected = selectedItem === itemId;
//                   const isCompleted = isIntentionCompleted(itemId);

//                   return (
//                     <button
//                       key={index}
//                       onClick={() => handleSelectItem(itemId)}
//                       className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
//                         isSelected
//                           ? "bg-blue-50 border-r-2 border-blue-500"
//                           : "hover:bg-gray-50"
//                       }`}
//                     >
//                       {/* Status Icon */}
//                       <span
//                         className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
//                           isCompleted
//                             ? "bg-green-500 text-white"
//                             : isSelected
//                               ? "bg-blue-500 text-white"
//                               : "bg-gray-200 text-gray-500"
//                         }`}
//                       >
//                         {isCompleted ? (
//                           <svg
//                             className="w-4 h-4"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M5 13l4 4L19 7"
//                             />
//                           </svg>
//                         ) : (
//                           sectionIndex * 10 + index + 1
//                         )}
//                       </span>

//                       {/* Intention Text */}
//                       <span
//                         className={`text-sm ${
//                           isSelected
//                             ? "text-blue-700 font-medium"
//                             : "text-gray-700"
//                         }`}
//                       >
//                         {intention.short_text}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Progress Footer */}
//         <div className="p-4 border-t border-gray-200 bg-white">
//           <div className="flex justify-between text-sm text-gray-600 mb-2">
//             <span>Progress</span>
//             <span>
//               {completedCount} / {allIntentions.length}
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${progressPercentage}%` }}
//             ></div>
//           </div>

//           {/* Submit Button */}
//           {allQuestionsAnswered && (
//             <button
//               onClick={handleSubmit}
//               className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
//             >
//               Submit Questionnaire
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         {!selectedItem ? (
//           <div className="h-full flex items-center justify-center">
//             <div className="text-center max-w-md">
//               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <svg
//                   className="w-10 h-10 text-blue-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M8 9l4-4 4 4m0 6l-4 4-4-4"
//                   />
//                 </svg>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">
//                 Select an Intention
//               </h2>
//               <p className="text-gray-500">
//                 Click on any intention from the sidebar to begin answering
//                 questions.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <Questions
//             itemId={selectedItem}
//             ratings={ratings[selectedItem]}
//             onRatingsChange={handleRatingsChange}
//           />
//         )}
//       </div>

//       {/* Instructions Popup */}
//       {showInstructions && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <InstructionsPopUp
//             instructionText={instructionText}
//             setShowInstructions={setShowInstructions}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionnnaireMain;

import { useContext, useState, useMemo, useEffect } from "react";
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import Questions from "./PreTaskQuestions";
import { FlowContext } from "../context/flow-context";
import { useNavigate, useLocation } from "react-router-dom";
import InstructionsPopUp from "./InstructionsPopUp";

let instructionText =
  "Read the intention on the left, answer the two survey questions below it, then click the next intention for more questions. Complete all listed intentions.";

const QuestionnnaireMain = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [ratings, setRatings] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [localTopology, setLocalTopology] = useState([]);
  const [topologyLoading, setTopologyLoading] = useState(true);
  const [startedTs, setStartedTs] = useState(Timestamp.now());

  const authCtx = useContext(AuthContext);
  const flowCtx = useContext(FlowContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current task is search, if it is, change the instruction text
  const currentTask = new URLSearchParams(location.search).get("currentTask");
  if (currentTask === "search") {
    instructionText =
      "Please reflect on your personal experience of using search engines (e.g. Google, Bing), and answer the following questions (see left sidebar).";
  } else if (currentTask === "virtual-assistant") {
    instructionText =
      "Please reflect on your personal experience of using virtual assistants (e.g. Siri, Cortana, Google Assistant, Amazon Alexa), and answer the following questions (see left sidebar).";
  }

  // Load topology data from Firebase admin/topology
  useEffect(() => {
    const fetchTopologyData = async () => {
      try {
        const docRef = doc(db, "admin", "topology");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const topology = data.topology || [];
          setLocalTopology(topology);
        }
      } catch (error) {
        console.error("Error fetching topology data:", error);
        setLocalTopology([]);
      } finally {
        setTopologyLoading(false);
      }
    };

    fetchTopologyData();
  }, []);

  // Get ratings from firebase
  useEffect(() => {
    const fetchData = async () => {
      const task = new URLSearchParams(location.search).get("currentTask");
      try {
        const collectionRef = collection(db, "questionnaireResponses");
        const q = query(
          collectionRef,
          where("userID", "==", authCtx.user.uid),
          where("isPostTask", "==", false),
          where("currentTask", "==", task),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setRatings(data.ratings);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };
    if (authCtx.user?.uid) {
      fetchData();
    }
  }, [authCtx.user?.uid, location.search]);

  // Add attention check to topology
  useEffect(() => {
    if (localTopology.length === 0 || topologyLoading) return;

    const topologyCopy = localTopology.map((section) => ({
      ...section,
      intention_list: [...section.intention_list],
    }));

    if (topologyCopy.length > 3) {
      const randomSectionIndex = 3;
      const randomPos = Math.floor(
        Math.random() * topologyCopy[randomSectionIndex].intention_list.length,
      );
      const repeatedIntention = {
        ...topologyCopy[randomSectionIndex].intention_list[randomPos],
        short_text:
          topologyCopy[randomSectionIndex].intention_list[randomPos]
            .short_text + " 2",
        attentionCheck: true,
      };

      topologyCopy[randomSectionIndex].intention_list.splice(
        randomPos + 1,
        0,
        repeatedIntention,
      );
      setLocalTopology(topologyCopy);
    }
  }, [localTopology.length, topologyLoading]);

  const handleSelectItem = (itemId) => {
    setSelectedItem(itemId);
  };

  const handleRatingsChange = (
    itemId,
    expectationRating,
    usageFrequencyRating,
  ) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [itemId]: { expectationRating, usageFrequencyRating },
    }));
  };

  const handleSubmit = async () => {
    const searchParams = new URLSearchParams(location.search);
    const isPostTask = location.pathname.includes("post-task");
    const task = searchParams.get("currentTask");

    const dataToSave = {
      userID: authCtx.user.uid,
      ratings,
      isPostTask,
      currentTask: task,
      startedTs: startedTs,
      completedTs: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "questionnaireResponses"), dataToSave);
      const flowState = searchParams.get("flowState");
      flowCtx.updateFlowState(flowState);
      navigate("/");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Build flat list of all intentions for progress tracking
  const allIntentions = useMemo(() => {
    return localTopology.flatMap((section) =>
      section.intention_list.map((intention) => ({
        ...intention,
        category: section.intention_type,
        itemId: `${intention.short_text} - ${intention.long_text.toLowerCase()}`,
      })),
    );
  }, [localTopology]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    if (topologyLoading || allIntentions.length === 0) return 0;

    const completedItems = Object.values(ratings).filter(
      (rating) =>
        rating.expectationRating !== undefined &&
        rating.usageFrequencyRating !== undefined,
    ).length;

    return (completedItems / allIntentions.length) * 100;
  }, [ratings, allIntentions, topologyLoading]);

  const completedCount = Object.values(ratings).filter(
    (rating) =>
      rating.expectationRating !== undefined &&
      rating.usageFrequencyRating !== undefined,
  ).length;

  const allQuestionsAnswered = progressPercentage === 100;

  // Check if an intention is completed
  const isIntentionCompleted = (itemId) => {
    const rating = ratings[itemId];
    return (
      rating?.expectationRating !== undefined &&
      rating?.usageFrequencyRating !== undefined
    );
  };

  if (topologyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading questionnaire...</div>
        </div>
      </div>
    );
  }

  if (localTopology.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-lg text-red-600">No topology data found.</div>
          <p className="text-gray-500 mt-2">
            Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Intentions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select an intention to answer questions
          </p>
        </div>

        {/* Intentions List */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            let globalIndex = 0;
            return localTopology.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-b border-gray-100">
                {/* Category Header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {section.intention_type}
                  </h3>
                </div>

                {/* Intentions in Category */}
                <div className="py-1">
                  {section.intention_list.map((intention, index) => {
                    globalIndex++;
                    const currentNumber = globalIndex;
                    const itemId = `${intention.short_text} - ${intention.long_text.toLowerCase()}`;
                    const isSelected = selectedItem === itemId;
                    const isCompleted = isIntentionCompleted(itemId);

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectItem(itemId)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-r-2 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Status Icon */}
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
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
                          ) : (
                            currentNumber
                          )}
                        </span>

                        {/* Intention Text */}
                        <span
                          className={`text-sm ${
                            isSelected
                              ? "text-blue-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {intention.short_text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Progress Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {completedCount} / {allIntentions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Submit Button */}
          {allQuestionsAnswered && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Submit Questionnaire
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {!selectedItem ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Select an Intention
              </h2>
              <p className="text-gray-500">
                Click on any intention from the sidebar to begin answering
                questions.
              </p>
            </div>
          </div>
        ) : (
          <Questions
            itemId={selectedItem}
            ratings={ratings[selectedItem]}
            onRatingsChange={handleRatingsChange}
          />
        )}
      </div>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <InstructionsPopUp
            instructionText={instructionText}
            setShowInstructions={setShowInstructions}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionnnaireMain;
