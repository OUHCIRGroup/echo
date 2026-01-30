// import React, { useState, useContext, useEffect } from "react";
// import AuthContext from "../context/auth-context";
// import { FlowContext } from "../context/flow-context";
// import { db } from "../firebase-config";
// import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";

// const DemographyQuestions = ({ onResponsesChange }) => {
//   const [responses, setResponses] = useState({});
//   const [demographyQuestions, setDemographyQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const authCtx = useContext(AuthContext);
//   const flowCtx = useContext(FlowContext);
//   const [demographyStartedTs, setDemographyStartedTs] = useState(
//     Timestamp.now()
//   );
//   const navigate = useNavigate();

//   // Load demography questions from Firebase admin/demographySurvey
//   useEffect(() => {
//     const fetchDemographyQuestions = async () => {
//       try {
//         const docRef = doc(db, "admin", "demographySurvey");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const questions = data.questions || [];
//           setDemographyQuestions(questions);
//         }
//       } catch (error) {
//         console.error("Error fetching demography questions:", error);
//         // Fallback to empty state
//         setDemographyQuestions([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDemographyQuestions();
//   }, []);

//   // get saved data from firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userDocRef = doc(db, "users", authCtx?.user?.uid);
//         const userDocSnap = await getDoc(userDocRef);
//         if (userDocSnap.exists()) {
//           const data = userDocSnap.data();
//           setResponses(data.backgroundResponses || {});
//         }
//       } catch (error) {
//         console.error("Error getting document:", error);
//       }
//     };

//     if (authCtx.user && demographyQuestions.length > 0) {
//       fetchData();
//     }
//   }, [authCtx, demographyQuestions]);

//   const handleInputChange = (
//     questionId,
//     optionValue,
//     isCheckbox = false,
//     selectUpto
//   ) => {
//     setResponses((prev) => {
//       let updatedResponse;
//       if (isCheckbox) {
//         // Check if the current selection is already in the array
//         const alreadySelected = prev[questionId]?.includes(optionValue);
//         const currentSelections = prev[questionId] ? [...prev[questionId]] : [];
//         if (alreadySelected) {
//           // If it's already selected, remove it from the array
//           updatedResponse = currentSelections.filter(
//             (item) => item !== optionValue
//           );
//         } else {
//           if (selectUpto === undefined) {
//             updatedResponse = [...currentSelections, optionValue];
//           } else {
//             // Check if we can add a new selection based on selectUpto limit
//             if (
//               selectUpto !== undefined &&
//               currentSelections.length < selectUpto
//             ) {
//               updatedResponse = [...currentSelections, optionValue];
//             } else {
//               // If we've reached the limit, return the current selections without adding a new one
//               alert(`You can select up to ${selectUpto} options.`);
//               return prev; // Early return to avoid updating the state
//             }
//           }
//         }
//       } else {
//         updatedResponse = optionValue;
//       }
//       return { ...prev, [questionId]: updatedResponse };
//     });
//   };

//   const validateForm = () => {
//     if (demographyQuestions.length === 0) return false;

//     return demographyQuestions.every((question) => {
//       const response = responses[question.category];
//       if (question.required) {
//         if (question.allowMultipleSelections) {
//           return response && response.length > 0;
//         }
//         return response !== undefined && response !== "";
//       }
//       return true;
//     });
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       alert("Please answer all required questions before submitting.");
//       return;
//     }
//     console.log(responses);
//     try {
//       const userDocRef = doc(db, "users", authCtx?.user?.uid);
//       await updateDoc(userDocRef, {
//         backgroundResponses: responses,
//         demographyStartedTs: demographyStartedTs,
//         demographyCompletedTs: Timestamp.now(),
//       });
//       console.log("Document successfully updated!");
//       flowCtx.setDemographyCompleted(true);
//       navigate("/");
//     } catch (error) {
//       console.error("Error updating document:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg">Loading demography questions...</div>
//       </div>
//     );
//   }

//   if (demographyQuestions.length === 0) {
//     return (
//       <div className="flex w-screen h-screen justify-center items-center">
//         <div className="text-lg text-red-600">No demography questions found. Please contact the administrator.</div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="max-h-screen overflow-y-auto text-black py-20 flex flex-col scrollbar
//     scrollbar-thumb-[#d58d8d] scrollbar-thumb-rounded-full scrollbar-w-2"
//     >
//       {demographyQuestions.map((question, qIndex) => (
//         <div key={qIndex} className="bg-[#e3e3e3] py-6 px-16 rounded-md mb-4">
//           <h1 className="text-[20px]">{question.category}</h1>
//           {question.selectUpto && (
//             <label className="text-[13px] mb-2 text-red-500 italic">
//               Select upto {question.selectUpto} options
//             </label>
//           )}
//           {question.options.map((option, oIndex) => {
//             const isChecked = question.allowMultipleSelections
//               ? responses[question.category]?.includes(option)
//               : responses[question.category] === option;
//             const formType = question.allowMultipleSelections
//               ? "checkbox"
//               : "radio";
//             return (
//               <div
//                 key={oIndex}
//                 className="flex flex-row space-x-4 items-center mt-5"
//               >
//                 <input
//                   type={formType}
//                   id={`${question.category}-${oIndex}`}
//                   name={question.category}
//                   value={option}
//                   checked={isChecked}
//                   onChange={(e) =>
//                     handleInputChange(
//                       question.category,
//                       e.target.value,
//                       question.allowMultipleSelections,
//                       question.selectUpto
//                     )
//                   }
//                   className={`w-4 h-4 form-${formType}`}
//                 />
//                 <label htmlFor={`${question.category}-${oIndex}`}>
//                   {option}
//                 </label>
//               </div>
//             );
//           })}
//         </div>
//       ))}
//       <div className="flex flex-row justify-around mt-8 text-black">
//         <button
//           className="bg-[#e3e3e3] px-6 py-2 rounded-2xl"
//           onClick={handleSubmit}
//         >
//           Submit
//         </button>
//       </div>{" "}
//     </div>
//   );
// };

// export default DemographyQuestions;

import React, { useState, useEffect, useContext } from "react";
import { db } from "../firebase-config";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/auth-context";
import { FlowContext } from "../context/flow-context";

const DemographyQuestions = ({ onResponsesChange }) => {
  const [responses, setResponses] = useState({});
  const [demographyQuestions, setDemographyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const flowCtx = useContext(FlowContext);
  const [startedTs] = useState(Timestamp.now());

  // Fetch demography questions from Firebase
  useEffect(() => {
    const fetchDemographyQuestions = async () => {
      try {
        const docRef = doc(db, "admin", "demographySurvey");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const questions = data.questions || [];
          setDemographyQuestions(questions);

          const initialResponses = {};
          questions.forEach((q) => {
            initialResponses[q.category] = q.allowMultipleSelections ? [] : "";
          });
          setResponses(initialResponses);
        }
      } catch (error) {
        console.error("Error fetching demography questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographyQuestions();
  }, []);

  const handleInputChange = (category, value, allowMultiple, selectUpto) => {
    setResponses((prevResponses) => {
      if (allowMultiple) {
        const currentSelections = prevResponses[category] || [];
        let newSelections;

        if (currentSelections.includes(value)) {
          newSelections = currentSelections.filter((item) => item !== value);
        } else {
          if (selectUpto && currentSelections.length >= selectUpto) {
            alert(`You can only select up to ${selectUpto} options.`);
            return prevResponses;
          }
          newSelections = [...currentSelections, value];
        }

        return { ...prevResponses, [category]: newSelections };
      } else {
        return { ...prevResponses, [category]: value };
      }
    });
  };

  const isQuestionAnswered = (question) => {
    const response = responses[question.category];
    if (question.allowMultipleSelections) {
      return response && response.length > 0;
    }
    return response && response !== "";
  };

  const isFormValid = () => {
    return demographyQuestions.every((question) =>
      isQuestionAnswered(question),
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const usersRef = doc(db, "users", authCtx.user.uid);
      await setDoc(
        usersRef,
        {
          backgroundResponses: responses,
          backgroundStartedTs: startedTs,
          backgroundCompletedTs: Timestamp.now(),
          demographyCompleted: true,
        },
        { merge: true },
      );
      flowCtx.setDemographyCompleted(true);
      navigate("/");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const answeredCount = demographyQuestions.filter((q) =>
    isQuestionAnswered(q),
  ).length;
  const totalCount = demographyQuestions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (demographyQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-lg text-red-600">No questions found.</div>
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
            Background Information
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Please tell us a bit about yourself
          </p>

          {/* Visual Step Progress */}
          <div className="flex items-center justify-center gap-1">
            {demographyQuestions.map((question, index) => (
              <div
                key={index}
                className={`h-2 flex-1 max-w-8 rounded-full transition-all duration-300 ${
                  isQuestionAnswered(question) ? "bg-blue-500" : "bg-gray-200"
                }`}
                title={`Question ${index + 1}`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            {answeredCount} of {totalCount} questions answered
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {demographyQuestions.map((question, qIndex) => {
            const isAnswered = isQuestionAnswered(question);

            return (
              <div
                key={qIndex}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 transition-colors ${
                  isAnswered ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isAnswered
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isAnswered ? (
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
                      qIndex + 1
                    )}
                  </span>
                  <div>
                    <p className="text-gray-800 font-medium">
                      {question.category}
                    </p>
                    {question.selectUpto && (
                      <p className="text-sm text-orange-600 mt-1">
                        Select up to {question.selectUpto} options
                      </p>
                    )}
                    {question.allowMultipleSelections &&
                      !question.selectUpto && (
                        <p className="text-sm text-gray-500 mt-1">
                          Select all that apply
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2 ml-10">
                  {question.options.map((option, oIndex) => {
                    const isChecked = question.allowMultipleSelections
                      ? responses[question.category]?.includes(option)
                      : responses[question.category] === option;
                    const inputType = question.allowMultipleSelections
                      ? "checkbox"
                      : "radio";

                    return (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type={inputType}
                          name={question.category}
                          value={option}
                          checked={isChecked}
                          onChange={(e) =>
                            handleInputChange(
                              question.category,
                              e.target.value,
                              question.allowMultipleSelections,
                              question.selectUpto,
                            )
                          }
                          className={`w-4 h-4 text-blue-600 ${inputType === "checkbox" ? "rounded" : ""}`}
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              !isFormValid() || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {!isFormValid() && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Please answer all questions to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemographyQuestions;
