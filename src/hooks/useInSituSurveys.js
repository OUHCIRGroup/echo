// import { useState, useEffect, useCallback, useRef, useContext } from "react";
// import {
//   doc,
//   getDoc,
//   addDoc,
//   collection,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "../firebase-config";
// import AuthContext from "../context/auth-context";

// /**
//  * Custom hook to manage in-situ survey popups based on admin configuration
//  *
//  * Usage:
//  * const {
//  *   currentSurvey,
//  *   submitSurveyResponse,
//  *   dismissSurvey,
//  *   triggerAfterPromptSubmit,
//  *   triggerAfterResponseReceive,
//  *   triggerAfterSearchQuery,
//  *   triggerBeforeSubmit,
//  *   isLoading,
//  * } = useInSituSurveys();
//  */
// export const useInSituSurveys = (options = {}) => {
//   const { taskType = "chat" } = options; // "chat" or "search"

//   const authCtx = useContext(AuthContext);
//   const [surveys, setSurveys] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentSurvey, setCurrentSurvey] = useState(null);
//   const [surveyQueue, setSurveyQueue] = useState([]);

//   // Counters for trigger conditions
//   const [promptCount, setPromptCount] = useState(0);
//   const [responseCount, setResponseCount] = useState(0);
//   const [searchQueryCount, setSearchQueryCount] = useState(0);

//   // Refs to track shown surveys and timers
//   const periodicTimerRef = useRef(null);
//   const beforeSubmitShownRef = useRef(false);
//   const sessionSurveyCountsRef = useRef({});

//   // Load surveys from Firestore
//   useEffect(() => {
//     const loadSurveys = async () => {
//       try {
//         const docRef = doc(db, "admin", "inSituSurveys");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setSurveys(data.surveys || {});
//         }
//       } catch (error) {
//         console.error("Error loading in-situ surveys:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadSurveys();
//   }, []);

//   // Setup periodic surveys
//   useEffect(() => {
//     if (isLoading) return;

//     // Find enabled periodic surveys
//     const periodicSurveys = Object.values(surveys).filter(
//       (s) => s.enabled && s.trigger === "periodic",
//     );

//     if (periodicSurveys.length === 0) return;

//     // Set up timers for each periodic survey
//     periodicSurveys.forEach((survey) => {
//       const intervalMs = (survey.intervalSeconds || 300) * 1000;

//       const timer = setInterval(() => {
//         if (!currentSurvey) {
//           queueSurvey(survey);
//         }
//       }, intervalMs);

//       // Store timer reference for cleanup
//       periodicTimerRef.current = {
//         ...periodicTimerRef.current,
//         [survey.id]: timer,
//       };
//     });

//     // Cleanup
//     return () => {
//       if (periodicTimerRef.current) {
//         Object.values(periodicTimerRef.current).forEach((timer) => {
//           clearInterval(timer);
//         });
//       }
//     };
//   }, [surveys, isLoading, currentSurvey]);

//   // Show a survey
//   const showSurvey = useCallback((survey) => {
//     if (!survey || !survey.enabled) return;

//     setCurrentSurvey(survey);
//   }, []);

//   // Add survey to queue
//   const queueSurvey = useCallback((survey) => {
//     if (!survey || !survey.enabled) return;

//     setSurveyQueue((prev) => {
//       // Prevent duplicate queuing
//       if (prev.some((s) => s.id === survey.id)) return prev;
//       return [...prev, survey];
//     });
//   }, []);

//   // Process queue when no current survey
//   useEffect(() => {
//     if (!currentSurvey && surveyQueue.length > 0) {
//       const [next, ...rest] = surveyQueue;
//       showSurvey(next);
//       setSurveyQueue(rest);
//     }
//   }, [currentSurvey, surveyQueue, showSurvey]);

//   // Save survey response to Firestore
//   const saveSurveyResponse = async (responseData) => {
//     try {
//       const collectionRef = collection(db, "inSituSurveyResponses");
//       await addDoc(collectionRef, {
//         ...responseData,
//         userId: authCtx.user?.uid || "anonymous",
//         taskType,
//         promptCount,
//         responseCount,
//         searchQueryCount,
//         createdAt: serverTimestamp(),
//       });
//       console.log("In-situ survey response saved");
//     } catch (error) {
//       console.error("Error saving in-situ survey response:", error);
//     }
//   };

//   // Submit survey response
//   const submitSurveyResponse = useCallback(
//     async (responseData) => {
//       await saveSurveyResponse(responseData);

//       // Track that this survey was shown in this session
//       sessionSurveyCountsRef.current[responseData.surveyId] =
//         (sessionSurveyCountsRef.current[responseData.surveyId] || 0) + 1;

//       setCurrentSurvey(null);
//     },
//     [authCtx.user, taskType, promptCount, responseCount, searchQueryCount],
//   );

//   // Dismiss survey without submitting
//   const dismissSurvey = useCallback(() => {
//     if (currentSurvey) {
//       // Track dismissal
//       saveSurveyResponse({
//         surveyId: currentSurvey.id,
//         responses: {},
//         dismissed: true,
//         submittedAt: new Date().toISOString(),
//       });
//     }
//     setCurrentSurvey(null);
//   }, [currentSurvey]);

//   // Check if survey should be triggered based on count
//   const shouldTriggerSurvey = (survey, currentCount) => {
//     if (!survey || !survey.enabled) return false;

//     const triggerCount = survey.triggerCount || 1;
//     return currentCount > 0 && currentCount % triggerCount === 0;
//   };

//   // Trigger: After participant submits a prompt
//   const triggerAfterPromptSubmit = useCallback(() => {
//     if (isLoading) return;

//     const newCount = promptCount + 1;
//     setPromptCount(newCount);

//     // Find matching surveys
//     Object.values(surveys).forEach((survey) => {
//       if (
//         survey.enabled &&
//         survey.trigger === "afterPromptSubmit" &&
//         shouldTriggerSurvey(survey, newCount)
//       ) {
//         queueSurvey(survey);
//       }
//     });
//   }, [surveys, isLoading, promptCount, queueSurvey]);

//   // Trigger: After AI/Search returns a response
//   const triggerAfterResponseReceive = useCallback(() => {
//     if (isLoading) return;

//     const newCount = responseCount + 1;
//     setResponseCount(newCount);

//     // Find matching surveys
//     Object.values(surveys).forEach((survey) => {
//       if (
//         survey.enabled &&
//         survey.trigger === "afterResponseReceive" &&
//         shouldTriggerSurvey(survey, newCount)
//       ) {
//         queueSurvey(survey);
//       }
//     });
//   }, [surveys, isLoading, responseCount, queueSurvey]);

//   // Trigger: After participant runs a search query
//   const triggerAfterSearchQuery = useCallback(() => {
//     if (isLoading) return;

//     const newCount = searchQueryCount + 1;
//     setSearchQueryCount(newCount);

//     // Find matching surveys
//     Object.values(surveys).forEach((survey) => {
//       if (
//         survey.enabled &&
//         survey.trigger === "afterSearchQuery" &&
//         shouldTriggerSurvey(survey, newCount)
//       ) {
//         queueSurvey(survey);
//       }
//     });
//   }, [surveys, isLoading, searchQueryCount, queueSurvey]);

//   // Trigger: Before task submission
//   const triggerBeforeSubmit = useCallback(() => {
//     if (isLoading || beforeSubmitShownRef.current) return null;

//     // Find beforeSubmit survey
//     const beforeSubmitSurvey = Object.values(surveys).find(
//       (s) => s.enabled && s.trigger === "beforeSubmit",
//     );

//     if (beforeSubmitSurvey) {
//       beforeSubmitShownRef.current = true;
//       showSurvey(beforeSubmitSurvey);
//       return beforeSubmitSurvey;
//     }

//     return null;
//   }, [surveys, isLoading, showSurvey]);

//   // Check if there's a pending beforeSubmit survey
//   const hasPendingBeforeSubmitSurvey = useCallback(() => {
//     return Object.values(surveys).some(
//       (s) =>
//         s.enabled &&
//         s.trigger === "beforeSubmit" &&
//         !beforeSubmitShownRef.current,
//     );
//   }, [surveys]);

//   return {
//     currentSurvey,
//     submitSurveyResponse,
//     dismissSurvey,
//     triggerAfterPromptSubmit,
//     triggerAfterResponseReceive,
//     triggerAfterSearchQuery,
//     triggerBeforeSubmit,
//     hasPendingBeforeSubmitSurvey,
//     isLoading,
//     promptCount,
//     responseCount,
//     searchQueryCount,
//     surveys, // Expose surveys for debugging/preview
//   };
// };

// export default useInSituSurveys;

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import AuthContext from "../context/auth-context";

/**
 * Custom hook to manage in-situ survey popups based on admin configuration
 */
export const useInSituSurveys = (options = {}) => {
  const { taskType = "chat" } = options;

  const authCtx = useContext(AuthContext);
  const [surveys, setSurveys] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [surveyQueue, setSurveyQueue] = useState([]);

  // Counters for trigger conditions - use refs to avoid closure issues
  const promptCountRef = useRef(0);
  const responseCountRef = useRef(0);
  const searchQueryCountRef = useRef(0);

  // Track pending "afterResponseReceive" survey
  const pendingResponseSurveyRef = useRef(null);

  // Other refs
  const periodicTimerRef = useRef(null);
  const beforeSubmitShownRef = useRef(false);
  const sessionSurveyCountsRef = useRef({});
  const surveysRef = useRef({});

  // Keep surveysRef in sync with surveys state
  useEffect(() => {
    surveysRef.current = surveys;
    console.log(
      "[useInSituSurveys] Surveys loaded:",
      Object.keys(surveys).length,
      surveys,
    );
  }, [surveys]);

  // Load surveys from Firestore
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        console.log("[useInSituSurveys] Loading surveys from Firestore...");
        const docRef = doc(db, "admin", "inSituSurveys");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("[useInSituSurveys] Loaded surveys data:", data);
          setSurveys(data.surveys || {});
        } else {
          console.log("[useInSituSurveys] No surveys document found");
        }
      } catch (error) {
        console.error("[useInSituSurveys] Error loading surveys:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
  }, []);

  // Setup periodic surveys
  useEffect(() => {
    if (isLoading) return;

    const periodicSurveys = Object.values(surveys).filter(
      (s) => s.enabled && s.trigger === "periodic",
    );

    if (periodicSurveys.length === 0) return;

    periodicSurveys.forEach((survey) => {
      const intervalMs = (survey.intervalSeconds || 300) * 1000;

      const timer = setInterval(() => {
        if (!currentSurvey) {
          queueSurvey(survey);
        }
      }, intervalMs);

      periodicTimerRef.current = {
        ...periodicTimerRef.current,
        [survey.id]: timer,
      };
    });

    return () => {
      if (periodicTimerRef.current) {
        Object.values(periodicTimerRef.current).forEach((timer) => {
          clearInterval(timer);
        });
      }
    };
  }, [surveys, isLoading, currentSurvey]);

  // Show a survey
  const showSurvey = useCallback((survey) => {
    if (!survey || !survey.enabled) {
      console.log(
        "[useInSituSurveys] showSurvey: survey invalid or not enabled",
        survey,
      );
      return;
    }
    console.log("[useInSituSurveys] Showing survey:", survey.id, survey.title);
    setCurrentSurvey(survey);
  }, []);

  // Add survey to queue
  const queueSurvey = useCallback((survey) => {
    if (!survey || !survey.enabled) return;

    setSurveyQueue((prev) => {
      if (prev.some((s) => s.id === survey.id)) return prev;
      console.log("[useInSituSurveys] Queuing survey:", survey.id);
      return [...prev, survey];
    });
  }, []);

  // Process queue when no current survey
  useEffect(() => {
    if (!currentSurvey && surveyQueue.length > 0) {
      const [next, ...rest] = surveyQueue;
      showSurvey(next);
      setSurveyQueue(rest);
    }
  }, [currentSurvey, surveyQueue, showSurvey]);

  // Save survey response to Firestore
  const saveSurveyResponse = async (responseData) => {
    try {
      const collectionRef = collection(db, "inSituSurveyResponses");
      await addDoc(collectionRef, {
        ...responseData,
        userId: authCtx.user?.uid || "anonymous",
        taskType,
        promptCount: promptCountRef.current,
        responseCount: responseCountRef.current,
        searchQueryCount: searchQueryCountRef.current,
        createdAt: serverTimestamp(),
      });
      console.log("[useInSituSurveys] Survey response saved");
    } catch (error) {
      console.error("[useInSituSurveys] Error saving response:", error);
    }
  };

  // Submit survey response
  const submitSurveyResponse = useCallback(
    async (responseData) => {
      await saveSurveyResponse(responseData);
      sessionSurveyCountsRef.current[responseData.surveyId] =
        (sessionSurveyCountsRef.current[responseData.surveyId] || 0) + 1;
      setCurrentSurvey(null);
    },
    [authCtx.user, taskType],
  );

  // Dismiss survey without submitting
  const dismissSurvey = useCallback(() => {
    if (currentSurvey) {
      saveSurveyResponse({
        surveyId: currentSurvey.id,
        responses: {},
        dismissed: true,
        submittedAt: new Date().toISOString(),
      });
    }
    setCurrentSurvey(null);
  }, [currentSurvey]);

  // Check if survey should be triggered based on count
  const shouldTriggerSurvey = (survey, currentCount) => {
    if (!survey || !survey.enabled) return false;
    const triggerCount = survey.triggerCount || 1;
    const shouldTrigger = currentCount > 0 && currentCount % triggerCount === 0;
    console.log(
      `[useInSituSurveys] shouldTriggerSurvey: count=${currentCount}, triggerCount=${triggerCount}, result=${shouldTrigger}`,
    );
    return shouldTrigger;
  };

  // Trigger: After participant submits a prompt
  const triggerAfterPromptSubmit = useCallback(() => {
    if (isLoading) {
      console.log("[useInSituSurveys] triggerAfterPromptSubmit: still loading");
      return;
    }

    promptCountRef.current += 1;
    const newCount = promptCountRef.current;
    console.log(
      "[useInSituSurveys] triggerAfterPromptSubmit: count =",
      newCount,
    );

    Object.values(surveysRef.current).forEach((survey) => {
      if (
        survey.enabled &&
        survey.trigger === "afterPromptSubmit" &&
        shouldTriggerSurvey(survey, newCount)
      ) {
        console.log(
          "[useInSituSurveys] Triggering afterPromptSubmit survey:",
          survey.id,
        );
        queueSurvey(survey);
      }
    });
  }, [isLoading, queueSurvey]);

  // Mark that a response was received - survey will show before next prompt or submit
  const markResponseReceived = useCallback(() => {
    if (isLoading) {
      console.log("[useInSituSurveys] markResponseReceived: still loading");
      return;
    }

    responseCountRef.current += 1;
    const newCount = responseCountRef.current;
    console.log("[useInSituSurveys] markResponseReceived: count =", newCount);

    Object.values(surveysRef.current).forEach((survey) => {
      if (
        survey.enabled &&
        survey.trigger === "afterResponseReceive" &&
        shouldTriggerSurvey(survey, newCount)
      ) {
        console.log(
          "[useInSituSurveys] Marking pending afterResponseReceive survey:",
          survey.id,
        );
        pendingResponseSurveyRef.current = survey;
      }
    });
  }, [isLoading]);

  // Check and show pending response survey
  const checkPendingResponseSurvey = useCallback(() => {
    console.log(
      "[useInSituSurveys] checkPendingResponseSurvey: pending =",
      pendingResponseSurveyRef.current?.id,
    );
    if (pendingResponseSurveyRef.current) {
      const survey = pendingResponseSurveyRef.current;
      pendingResponseSurveyRef.current = null;
      showSurvey(survey);
      return true;
    }
    return false;
  }, [showSurvey]);

  // Check if there's any pending survey
  const hasPendingSurvey = useCallback(() => {
    return pendingResponseSurveyRef.current !== null || currentSurvey !== null;
  }, [currentSurvey]);

  // Trigger: After participant runs a search query
  const triggerAfterSearchQuery = useCallback(() => {
    if (isLoading) return;

    searchQueryCountRef.current += 1;
    const newCount = searchQueryCountRef.current;
    console.log(
      "[useInSituSurveys] triggerAfterSearchQuery: count =",
      newCount,
    );

    Object.values(surveysRef.current).forEach((survey) => {
      if (
        survey.enabled &&
        survey.trigger === "afterSearchQuery" &&
        shouldTriggerSurvey(survey, newCount)
      ) {
        queueSurvey(survey);
      }
    });
  }, [isLoading, queueSurvey]);

  // Trigger: Before task submission
  const triggerBeforeSubmit = useCallback(() => {
    if (isLoading || beforeSubmitShownRef.current) return null;

    const beforeSubmitSurvey = Object.values(surveysRef.current).find(
      (s) => s.enabled && s.trigger === "beforeSubmit",
    );

    if (beforeSubmitSurvey) {
      beforeSubmitShownRef.current = true;
      showSurvey(beforeSubmitSurvey);
      return beforeSubmitSurvey;
    }

    return null;
  }, [isLoading, showSurvey]);

  // Check if there's a pending beforeSubmit survey
  const hasPendingBeforeSubmitSurvey = useCallback(() => {
    return Object.values(surveysRef.current).some(
      (s) =>
        s.enabled &&
        s.trigger === "beforeSubmit" &&
        !beforeSubmitShownRef.current,
    );
  }, []);

  return {
    currentSurvey,
    submitSurveyResponse,
    dismissSurvey,
    triggerAfterPromptSubmit,
    markResponseReceived,
    checkPendingResponseSurvey,
    hasPendingSurvey,
    triggerAfterSearchQuery,
    triggerBeforeSubmit,
    hasPendingBeforeSubmitSurvey,
    isLoading,
    promptCount: promptCountRef.current,
    responseCount: responseCountRef.current,
    searchQueryCount: searchQueryCountRef.current,
    surveys,
  };
};

export default useInSituSurveys;
