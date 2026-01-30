// import { useContext, useState, useMemo, useEffect } from "react";
// import {
//   addDoc,
//   collection,
//   Timestamp,
//   getDocs,
//   where,
//   query,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";
// import IntentionBox from "./IntentionBox";
// import IntentionTypeItem from "./IntentionTypeItem";
// import ProgressBar from "@ramonak/react-progress-bar";
// import PostTaskQuestions from "./PostTaskQuestions";
// import { FlowContext } from "../context/flow-context";
// import { useNavigate } from "react-router-dom";
// import InstructionsPopUp from "./InstructionsPopUp";
// import { useLocation } from "react-router-dom";

// const instructionText =
//   "Read the intention on the left, then answer the two survey questions below it. Click the next intention in the sidebar for new questions. Complete all intentions listed.";
// const PostTaskQuestionnaireMain = () => {
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [ratings, setRatings] = useState({});
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [localTopology, setLocalTopology] = useState([]);
//   const [topologyLoading, setTopologyLoading] = useState(true);
//   const [startedTs, setStartedTs] = useState(Timestamp.now());
//   const authCtx = useContext(AuthContext);
//   const flowCtx = useContext(FlowContext);
//   const navigate = useNavigate();
//   const location = useLocation(); // Hook to get location object

//   // Load topology data from Firebase admin/topology
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
//         // Fallback to empty state
//         setLocalTopology([]);
//       } finally {
//         setTopologyLoading(false);
//       }
//     };

//     fetchTopologyData();
//   }, []);

//   // get ratings from firebase`
//   useEffect(() => {
//     const fetchData = async () => {
//       const task = new URLSearchParams(location.search).get("currentTask");
//       try {
//         const collectionRef = collection(db, "questionnaireResponses");
//         const q = query(
//           collectionRef,
//           where("isPostTask", "==", true),
//           where("userID", "==", authCtx.user.uid),
//           where("currentTask", "==", task)
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
//   }, [authCtx]);

//   useEffect(() => {
//     // Only run this effect when topology has loaded and is not empty
//     if (topologyLoading || localTopology.length === 0) {
//       return;
//     }

//     const searchParams = new URLSearchParams(location.search);
//     const isFirstTask = searchParams.get("firstTask") === "true";
//     if (isFirstTask) {
//       // return if postTask1 is completed
//       if (flowCtx.postTask1Completed) {
//         return;
//       }
//     } else {
//       // return if postTask2 is completed
//       if (flowCtx.postTask2Completed) {
//         return;
//       }
//     }

//     const topologyCopy = localTopology.map((section) => ({
//       ...section,
//       intention_list: [...section.intention_list],
//     }));

//     // Make sure we have enough sections for the attention check
//     if (topologyCopy.length > 3) {
//       const randomSectionIndex = 3; // Attention check needs to be in section index 3
//       const randomPos = Math.floor(
//         Math.random() * topologyCopy[randomSectionIndex].intention_list.length
//       );
//       const repeatedIntention = {
//         ...topologyCopy[randomSectionIndex].intention_list[randomPos],
//         short_text:
//           topologyCopy[randomSectionIndex].intention_list[randomPos].short_text +
//           " 2",
//         attentionCheck: true,
//       };

//       topologyCopy[randomSectionIndex].intention_list.splice(
//         randomPos + 1,
//         0,
//         repeatedIntention
//       );
//       setLocalTopology(topologyCopy);
//     }
//   }, [localTopology, topologyLoading, flowCtx.postTask1Completed, flowCtx.postTask2Completed]);

//   const handleSelectItem = (itemId) => {
//     setSelectedItem(itemId);
//   };

//   const handleRatingsChange = (itemId, expectationRating) => {
//     setRatings((prevRatings) => ({
//       ...prevRatings,
//       [itemId]: { expectationRating },
//     }));
//   };

//   const handleSubmit = async () => {
//     const searchParams = new URLSearchParams(location.search);
//     const isFirstTask = searchParams.get("firstTask") === "true"; // Check if firstTask query parameter is 'true'
//     const isPostTask = location.pathname.includes("post-task"); // Check if the current path includes 'post-task'
//     const currentTask = searchParams.get("currentTask");
//     const dataToSave = {
//       userID: authCtx.user.uid,
//       ratings,
//       isPostTask,
//       currentTask,
//       startedTs: startedTs,
//       completedTs: Timestamp.now(),
//     };
//     try {
//       // Reference to your Firestore collection
//       const docRef = await addDoc(
//         collection(db, "questionnaireResponses"),
//         dataToSave
//       );
//       console.log("Document written with ID: ", docRef.id);
//       // Conditionally updating based on firstTask query parameter
//       const flowState = searchParams.get("flowState");
//       flowCtx.updateFlowState(flowState);
//       navigate("/");
//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
//   };

//   // Calculate the progress percentage
//   const progressPercentage = useMemo(() => {
//     if (topologyLoading || localTopology.length === 0) {
//       return 0;
//     }

//     const totalItems = localTopology.reduce(
//       (acc, curr) => acc + curr.intention_list.length,
//       0
//     );

//     if (totalItems === 0) {
//       return 0;
//     }

//     const completedItems = Object.values(ratings).filter(
//       (rating) => rating.expectationRating !== undefined
//     ).length;

//     return (completedItems / totalItems) * 100;
//   }, [ratings, localTopology, topologyLoading]);

//   // Check if all questions have been answered
//   const allQuestionsAnswered = useMemo(() => {
//     return progressPercentage === 100;
//   }, [progressPercentage]);

//   if (topologyLoading) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg">Loading topology data...</div>
//       </div>
//     );
//   }

//   if (localTopology.length === 0) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg text-red-600">No topology data found. Please contact the administrator.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-row bg-[#FFFFFF] items-center">
//       <div className="flex flex-col w-[30%] h-screen pt-4">
//         <div
//           className="bg-[#e3e3e3] max-h-screen overflow-y-auto scrollbar
//                 scrollbar-thumb-[#d58d8d] scrollbar-thumb-rounded-full text-[14px]
//                 sticky top-0 scrollbar-w-2 scrollbar-h-4"
//         >
//           {localTopology.map((item, index) => (
//             <IntentionBox
//               selectedItem={selectedItem}
//               key={index}
//               index={index}
//               title={item.intention_type}
//               intentionList={item.intention_list}
//               onSelectItem={handleSelectItem}
//               ratings={ratings}
//             />
//           ))}
//         </div>
//         <div className="text-black p-4 bg-[#white] flex flex-col space-y-2 pt-2 border-r-8 border-[#e3e3e3]">
//           <label>Progress</label>
//           <ProgressBar completed={Number(progressPercentage.toFixed(0))} />
//         </div>
//       </div>
//       <div className="w-full flex justify-center mr-16">
//         {selectedItem && (
//           <PostTaskQuestions
//             itemId={selectedItem}
//             ratings={ratings[selectedItem]}
//             onRatingsChange={handleRatingsChange}
//           />
//         )}
//       </div>
//       {allQuestionsAnswered && (
//         <div className="flex flex-row justify-around mt-16 border-2">
//           <button
//             className="bg-[#e3e3e3] px-6 py-2 rounded-2xl fixed bottom-4 right-4"
//             onClick={handleSubmit}
//           >
//             Submit
//           </button>
//         </div>
//       )}
//       {showInstructions && (
//         <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
//           <InstructionsPopUp
//             instructionText={instructionText}
//             setShowInstructions={setShowInstructions}
//           />
//         </div>
//       )}
//       ;
//     </div>
//   );
// };

// export default PostTaskQuestionnaireMain;

import { useContext, useState, useMemo, useEffect } from "react";
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  where,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import PostTaskQuestions from "./PostTaskQuestions";
import { FlowContext } from "../context/flow-context";
import { useNavigate, useLocation } from "react-router-dom";
import InstructionsPopUp from "./InstructionsPopUp";

const instructionText =
  "Read the intention on the left, then answer the survey question. Click the next intention in the sidebar for new questions. Complete all intentions listed.";

const PostTaskQuestionnaireMain = () => {
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
          where("isPostTask", "==", true),
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
    if (
      localTopology.length === 0 ||
      topologyLoading ||
      flowCtx.postTask1Completed ||
      flowCtx.postTask2Completed
    )
      return;

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
  }, [
    localTopology.length,
    topologyLoading,
    flowCtx.postTask1Completed,
    flowCtx.postTask2Completed,
  ]);

  const handleSelectItem = (itemId) => {
    setSelectedItem(itemId);
  };

  const handleRatingsChange = (itemId, expectationRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [itemId]: { expectationRating },
    }));
  };

  const handleSubmit = async () => {
    const searchParams = new URLSearchParams(location.search);
    const isPostTask = location.pathname.includes("post-task");
    const currentTask = searchParams.get("currentTask");
    const dataToSave = {
      userID: authCtx.user.uid,
      ratings,
      isPostTask,
      currentTask,
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
      (rating) => rating.expectationRating !== undefined,
    ).length;

    return (completedItems / allIntentions.length) * 100;
  }, [ratings, allIntentions, topologyLoading]);

  const completedCount = Object.values(ratings).filter(
    (rating) => rating.expectationRating !== undefined,
  ).length;

  const allQuestionsAnswered = progressPercentage === 100;

  // Check if an intention is completed
  const isIntentionCompleted = (itemId) => {
    const rating = ratings[itemId];
    return rating?.expectationRating !== undefined;
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
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="font-semibold text-gray-800">Post-Task Survey</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reflect on your experience with each intention
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
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50 border-r-2 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Status Icon */}
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
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
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Submit Button */}
          {allQuestionsAnswered && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Select an Intention
              </h2>
              <p className="text-gray-500">
                Click on any intention from the sidebar to begin reflecting on
                your experience.
              </p>
            </div>
          </div>
        ) : (
          <PostTaskQuestions
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

export default PostTaskQuestionnaireMain;
