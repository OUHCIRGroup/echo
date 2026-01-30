// import React, { useState, useEffect, useContext } from "react";
// import {
//   addDoc,
//   serverTimestamp,
//   collection,
//   where,
//   getDocs,
//   query,
//   Timestamp,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { auth, db } from "../firebase-config";
// import { useNavigate } from "react-router-dom";
// import { FlowContext } from "../context/flow-context";

// const ExperienceSurveyMain = () => {
//   const [currentTask, setCurrentTask] = useState();
//   const [startedTs, setStartedTs] = useState(Timestamp.now());
//   const flowCtx = useContext(FlowContext);
//   const authCtx = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [isFormValid, setIsFormValid] = useState(false);
//   const [surveyQuestions, setSurveyQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // State to hold responses - will be dynamically populated based on questions
//   const [responses, setResponses] = useState({});

//   // Load survey questions from Firebase admin/experienceSurvey
//   useEffect(() => {
//     const fetchSurveyQuestions = async () => {
//       try {
//         const docRef = doc(db, "admin", "experienceSurvey");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const questions = data.questions || [];
//           setSurveyQuestions(questions);

//           // Initialize responses object based on questions
//           const initialResponses = {};
//           questions.forEach((question) => {
//             initialResponses[question.key] = question.responseType === "open-ended" ? "" : "";
//           });
//           setResponses(initialResponses);
//         }
//       } catch (error) {
//         console.error("Error fetching survey questions:", error);
//         // Fallback to empty state
//         setSurveyQuestions([]);
//         setResponses({});
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSurveyQuestions();
//   }, []);

//   useEffect(() => {
//     // Create a URLSearchParams object based on the current window location
//     const queryParams = new URLSearchParams(window.location.search);
//     // Extract the 'currentTask' query parameter
//     const task = queryParams.get("currentTask"); // 'search' or 'chat'

//     // Map 'search' or 'chat' to more descriptive task names, if necessary
//     let taskName = "";
//     if (task === "chat") {
//       taskName = "ChatGPT";
//     } else if (task === "search") {
//       taskName = "Search Engine";
//     }

//     // Update the currentTask state with the extracted and mapped task name
//     setCurrentTask(taskName);
//   }, []);

//   // get saved data from firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const task = new URLSearchParams(window.location.search).get(
//           "currentTask"
//         );
//         const q = query(
//           collection(db, "experienceSurvey"),
//           where("task", "==", task),
//           where("userId", "==", authCtx.user.uid)
//         );
//         const querySnapshot = await getDocs(q);
//         querySnapshot.forEach((doc) => {
//           // Each doc satisfies the query's conditions and can be processed
//           const result = doc.data();
//           // Update responses with saved data, preserving the dynamic structure
//           setResponses(prevResponses => ({
//             ...prevResponses,
//             ...result
//           }));
//         });
//       } catch (error) {
//         console.error("Error getting documents: ", error);
//       }
//     };
//     if (authCtx.user && surveyQuestions.length > 0) {
//       fetchData();
//     }
//   }, [authCtx, surveyQuestions]);

//   // Validate the form whenever responses change
//   useEffect(() => {
//     if (surveyQuestions.length === 0) {
//       setIsFormValid(false);
//       return;
//     }

//     // Check if all required questions have responses
//     const allResponsesFilled = surveyQuestions.every((question) => {
//       const response = responses[question.key];
//       return response && response.toString().trim() !== "";
//     });

//     setIsFormValid(allResponsesFilled);
//   }, [responses, surveyQuestions]);

//   // Handler for changes in radio button selections
//   const handleRadioChange = (key, option) => {
//     setResponses((prevResponses) => ({
//       ...prevResponses,
//       [key]: option,
//     }));
//   };

//   // Handler for the open-ended question
//   const handleOpenEndedChange = (e, key) => {
//     setResponses((prevResponses) => ({
//       ...prevResponses,
//       [key]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isFormValid) {
//       alert("Please answer all questions before submitting.");
//     } else {
//       console.log(responses);
//       try {
//         const queryParams = new URLSearchParams(window.location.search);
//         const isFirstTask = queryParams.get("firstTask");
//         const taskName = queryParams.get("currentTask");
//         await addDoc(collection(db, "experienceSurvey"), {
//           ...responses,
//           startedTs: startedTs,
//           completedTs: serverTimestamp(),
//           task: taskName,
//           userId: authCtx.user.uid,
//         });
//         const flowState = queryParams.get("flowState");
//         flowCtx.updateFlowState(flowState);
//         navigate("/");
//       } catch (error) {
//         console.error("Error adding document: ", error);
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg">Loading survey questions...</div>
//       </div>
//     );
//   }

//   if (surveyQuestions.length === 0) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg text-red-600">No survey questions found. Please contact the administrator.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex w-screen h-screen overflow-auto scrollbar justify-center scrollbar-thumb-[#ffffff] scrollbar-w-2">
//       <form
//         className="flex flex-col justify-center items-center h-fit w-[40%] bg-[#e3e3e3] text-black py-12
//          px-16 rounded-xl"
//         onSubmit={handleSubmit}
//       >
//         {surveyQuestions.map((question, index) => {
//           const questionText = question.question.replace(
//             "current task",
//             currentTask
//           );

//           if (question.responseType === "open-ended") {
//             return (
//               <div key={index} className="w-full p-4">
//                 <label>{questionText}</label>
//                 <textarea
//                   className="w-full p-2 text-black form-textarea outline-none rounded-md mt-2"
//                   value={responses[question.key] || ""}
//                   onChange={(e) => handleOpenEndedChange(e, question.key)}
//                   placeholder="Enter your response..."
//                   rows={question.key === "threeExamples" ? 6 : 4}
//                 />
//               </div>
//             );
//           } else {
//             return (
//               <div key={index} className="w-full p-4 space-y-2">
//                 <p>{questionText}</p>
//                 {question.options.map((option, oIndex) => (
//                   <div
//                     key={oIndex}
//                     className="flex flex-row space-x-4 items-center"
//                   >
//                     <input
//                       type="radio"
//                       id={`${question.key}-${option}`}
//                       name={question.key}
//                       value={option}
//                       className="form-radio"
//                       checked={responses[question.key] === option}
//                       onChange={() => handleRadioChange(question.key, option)}
//                     />
//                     <label htmlFor={`${question.key}-${option}`}>
//                       {option}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             );
//           }
//         })}
//         <button
//           type="submit"
//           className="mt-4 px-4 py-2 bg-white text-black rounded-lg"
//           disabled={!isFormValid}
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ExperienceSurveyMain;

import React, { useState, useEffect, useContext } from "react";
import {
  addDoc,
  serverTimestamp,
  collection,
  where,
  getDocs,
  query,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { FlowContext } from "../context/flow-context";

const ExperienceSurveyMain = () => {
  const [currentTask, setCurrentTask] = useState("");
  const [startedTs, setStartedTs] = useState(Timestamp.now());
  const flowCtx = useContext(FlowContext);
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load survey questions from Firebase
  useEffect(() => {
    const fetchSurveyQuestions = async () => {
      try {
        const docRef = doc(db, "admin", "experienceSurvey");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const questions = data.questions || [];
          setSurveyQuestions(questions);

          const initialResponses = {};
          questions.forEach((question) => {
            initialResponses[question.key] =
              question.responseType === "open-ended" ? "" : "";
          });
          setResponses(initialResponses);
        }
      } catch (error) {
        console.error("Error fetching survey questions:", error);
        setSurveyQuestions([]);
        setResponses({});
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyQuestions();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const task = queryParams.get("currentTask");

    let taskName = "";
    if (task === "chat") {
      taskName = "ChatGPT";
    } else if (task === "search") {
      taskName = "Search Engine";
    }

    setCurrentTask(taskName);
  }, []);

  // Get saved data from firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const task = new URLSearchParams(window.location.search).get(
          "currentTask",
        );
        const q = query(
          collection(db, "experienceSurvey"),
          where("task", "==", task),
          where("userId", "==", authCtx.user.uid),
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const result = doc.data();
          setResponses((prevResponses) => ({
            ...prevResponses,
            ...result,
          }));
        });
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    };
    if (authCtx.user && surveyQuestions.length > 0) {
      fetchData();
    }
  }, [authCtx, surveyQuestions]);

  // Validate form
  useEffect(() => {
    if (surveyQuestions.length === 0) {
      setIsFormValid(false);
      return;
    }

    const allResponsesFilled = surveyQuestions.every((question) => {
      const response = responses[question.key];
      return response && response.toString().trim() !== "";
    });

    setIsFormValid(allResponsesFilled);
  }, [responses, surveyQuestions]);

  const handleRadioChange = (key, option) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [key]: option,
    }));
  };

  const handleOpenEndedChange = (e, key) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const queryParams = new URLSearchParams(window.location.search);
      const taskName = queryParams.get("currentTask");
      await addDoc(collection(db, "experienceSurvey"), {
        ...responses,
        startedTs: startedTs,
        completedTs: serverTimestamp(),
        task: taskName,
        userId: authCtx.user.uid,
      });
      const flowState = queryParams.get("flowState");
      flowCtx.updateFlowState(flowState);
      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting survey. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const answeredCount = surveyQuestions.filter((q) => {
    const response = responses[q.key];
    return response && response.toString().trim() !== "";
  }).length;
  const progressPercentage =
    surveyQuestions.length > 0
      ? (answeredCount / surveyQuestions.length) * 100
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading survey...</div>
        </div>
      </div>
    );
  }

  if (surveyQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-lg text-red-600">No survey questions found.</div>
          <p className="text-gray-500 mt-2">
            Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Session Experience Survey
          </h1>
          {currentTask && (
            <p className="text-center text-gray-600">
              Please share your experience using{" "}
              <span className="font-semibold text-blue-600">{currentTask}</span>
            </p>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {answeredCount} of {surveyQuestions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {surveyQuestions.map((question, index) => {
            const questionText = question.question.replace(
              "current task",
              currentTask,
            );

            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 font-medium pt-0.5">
                    {questionText}
                  </p>
                </div>

                {question.responseType === "open-ended" ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    value={responses[question.key] || ""}
                    onChange={(e) => handleOpenEndedChange(e, question.key)}
                    placeholder="Enter your response..."
                    rows={question.key === "threeExamples" ? 6 : 4}
                  />
                ) : (
                  <div className="space-y-2 ml-10">
                    {question.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          responses[question.key] === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.key}
                          value={option}
                          className="w-4 h-4 text-blue-600"
                          checked={responses[question.key] === option}
                          onChange={() =>
                            handleRadioChange(question.key, option)
                          }
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                !isFormValid || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </button>
            {!isFormValid && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Please answer all questions to submit
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceSurveyMain;
