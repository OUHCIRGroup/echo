// import React, { useState, createContext, useEffect, useContext } from "react";
// import { db } from "../firebase-config";
// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   getDoc,
//   Timestamp,
// } from "firebase/firestore";
// import AuthContext from "./auth-context";
// import tasksJSON from "../tasks.json";
// import { set } from "firebase/database";

// const TaskContext = createContext({
//   showEditNoteReminder: false, // Default value
//   showPopUp: null, // you need showEditNoteReminder and showPopUp because otherwise you won't be able to display the popup properly
//   showSaveButton: null, // if user clicks on Edit your draft
//   isRatingNeeded: null,
//   showRatingPopUp: null,
//   note: null,
//   showEndTaskPopUp: false,
//   tasks: {},
//   timeRemaining: 0,
//   queryCount: 0,
//   allResponsesRated: false,
//   questionnaireOrder: {},
//   promptIDForRating: null,
//   setShowEditNoteReminder: () => {}, // Function to update showEditNoteReminder
//   setShowPopUp: () => {},
//   setShowSaveButton: () => {},
//   setNote: () => {},
//   setShowEndTaskPopUp: () => {},
//   setIsRatingNeeded: () => {},
//   setShowRatingPopUp: () => {},
//   setTasks: () => {},
//   setTimeRemaining: () => {},
//   setQueryCount: () => {},
//   setAllResponsesRated: () => {},
//   setQuestionnaireOrder: () => {},
//   getQuestionnaireText: () => {},
//   setPromptIDForRating: () => {},
// });

// export const TaskContextProvider = (props) => {
//   const [SearchEngineTask, setSearchEngineTaskState] = useState(null);
//   const [showEditNoteReminder, setShowEditNoteReminderState] = useState(false);
//   const [showPopUp, setShowPopUpState] = useState(false);
//   const [showSaveButton, setShowSaveButtonState] = useState(false);
//   const [note, setNoteState] = useState("");
//   const [showEndTaskPopUp, setShowEndTaskPopUpState] = useState(false);
//   const [isRatingNeeded, setIsRatingNeededState] = useState(false);
//   const [showRatingPopUp, setShowRatingPopUpState] = useState(false);
//   const [timeRemaining, setTimeRemainingState] = useState(0);
//   const [queryCount, setQueryCountState] = useState(0);
//   const [promptIDForRating, setPromptIDForRatingState] = useState(null);
//   const [tasks, setTasksState] = useState({
//     firstTask: null,
//     firstTaskTopic: null,
//   });
//   const [allResponsesRated, setAllResponsesRatedState] = useState(false);
//   const authCtx = useContext(AuthContext);

//   useEffect(() => {
//     const fetchAssignedTask = async () => {
//       if (authCtx.user && authCtx.user.uid) {
//         const userDocRef = doc(db, "users", authCtx.user.uid);
//         try {
//           const docSnap = await getDoc(userDocRef);
//           if (docSnap.exists() && docSnap.data().tasks) {
//             setTasksState(docSnap.data().tasks);
//           } else {
//             console.log("No assigned tasks found or user does not exist.");
//           }
//         } catch (error) {
//           console.error("Error fetching user's assigned task:", error);
//         }
//       }
//     };

//     fetchAssignedTask();
//   }, [authCtx.user]);

//   const generateLatinSquare = (tasks) => {
//     let square = [];
//     for (let i = 0; i < tasks.length; i++) {
//       let row = [];
//       for (let j = 0; j < tasks.length; j++) {
//         let index = (i + j) % tasks.length;
//         row.push(tasks[index]);
//       }
//       square.push(row);
//     }
//     return square;
//   };

//   const selectRandomTask = (latinSquare) => {
//     console.log(latinSquare.length);
//     const row = Math.floor(Math.random() * latinSquare.length);
//     const column = Math.floor(Math.random() * latinSquare.length);
//     return latinSquare[row][column];
//   };

// const setTasks = (user) => {
//     // Generate Latin Square for task topics
//     const latinSquareTopics = generateLatinSquare(tasksJSON);
//     console.log(latinSquareTopics);
//     const firstTaskObj = selectRandomTask(latinSquareTopics);

//     // Randomly assign firstTask to be either "chat" or "search"
//     const taskTypes = ["chat", "search"];
//     const firstTaskIndex = Math.floor(Math.random() * taskTypes.length);
//     const firstTask = taskTypes[firstTaskIndex];

//     const obj = {
//       firstTask,
//       firstTaskTopic: firstTaskObj.title,
//       firstTaskDescription: firstTaskObj.description
//     };

//     console.log(obj);
//     try {
//       if (user && user.uid) {
//         const userDocRef = doc(db, "users", user.uid);
//         updateDoc(userDocRef, {
//           tasks: obj,
//         });
//         console.log("User was assigned tasks successfully");
//       }
//     } catch (error) {
//       console.error("Error assigning tasks to user:", error);
//     }
//     setTasksState(obj);
//   };

//   // Function to update showEditNoteReminder state
//   const setShowEditNoteReminder = (value) => {
//     setShowEditNoteReminderState(value);
//   };

//   const setShowPopUp = (value) => {
//     setShowPopUpState(value);
//   };

//   const setShowSaveButton = (value) => {
//     setShowSaveButtonState(value);
//   };

//   const setNote = (text) => {
//     setNoteState(text);
//   };

//   const setShowEndTaskPopUp = (text) => {
//     setShowEndTaskPopUpState(text);
//   };

//   const setIsRatingNeeded = (text) => {
//     setIsRatingNeededState(text);
//   };

//   const setShowRatingPopUp = (text) => {
//     setShowRatingPopUpState(text);
//   };

//   // Function to set SearchEngineTask and save to localStorage
//   const setSearchEngineTask = (task) => {
//     setSearchEngineTaskState(task);
//   };

//   const setTimeRemaining = (time) => {
//     setTimeRemainingState(time);
//   };

//   const setQueryCount = () => {
//     console.log(queryCount);
//     setQueryCountState(queryCount + 1);
//   };

//   const setAllResponsesRated = (value) => {
//     setAllResponsesRatedState(value);
//   };

//   const setPromptIDForRating = (value) => {
//     setPromptIDForRatingState(value);
//   };

//   const getQuestionnaireText = (questionnaire) => {
//     if (questionnaire === "search") {
//       return "Search Engine ";
//     } else {
//       return "Virtual Assistant";
//     }
//   };

//   const contextValue = {
//     SearchEngineTask,
//     showEditNoteReminder,
//     showPopUp,
//     showSaveButton,
//     note,
//     showEndTaskPopUp,
//     isRatingNeeded,
//     showRatingPopUp,
//     tasks,
//     timeRemaining,
//     queryCount,
//     allResponsesRated,
//     promptIDForRating,
//     setSearchEngineTask,
//     setShowEditNoteReminder,
//     setShowPopUp,
//     setShowSaveButton,
//     setNote,
//     setShowEndTaskPopUp,
//     setIsRatingNeeded,
//     setShowRatingPopUp,
//     setTasks,
//     setTimeRemaining,
//     setQueryCount,
//     setAllResponsesRated,
//     getQuestionnaireText,
//     setPromptIDForRating,
//   };

//   return (
//     <TaskContext.Provider value={contextValue}>
//       {props.children}
//     </TaskContext.Provider>
//   );
// };

// export default TaskContext;

// import React, {
//   useState,
//   createContext,
//   useEffect,
//   useContext,
//   useCallback,
// } from "react";
// import { db } from "../firebase-config";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import AuthContext from "./auth-context";
// import tasksJSON from "../tasks.json";

// const TaskContext = createContext({
//   showEditNoteReminder: false,
//   showPopUp: null,
//   showSaveButton: null,
//   isRatingNeeded: null,
//   showRatingPopUp: null,
//   note: null,
//   showEndTaskPopUp: false,
//   tasks: {},
//   timeRemaining: 0,
//   queryCount: 0,
//   allResponsesRated: false,
//   questionnaireOrder: {},
//   promptIDForRating: null,
//   triggerAfterResponse: null,
//   isTasksLoading: true,
//   setShowEditNoteReminder: () => {},
//   setShowPopUp: () => {},
//   setShowSaveButton: () => {},
//   setNote: () => {},
//   setShowEndTaskPopUp: () => {},
//   setIsRatingNeeded: () => {},
//   setShowRatingPopUp: () => {},
//   setTasks: () => {},
//   setTimeRemaining: () => {},
//   setQueryCount: () => {},
//   setAllResponsesRated: () => {},
//   setQuestionnaireOrder: () => {},
//   getQuestionnaireText: () => {},
//   setPromptIDForRating: () => {},
//   setTriggerAfterResponse: () => {},
//   assignTasksIfNeeded: () => {},
// });

// export const TaskContextProvider = (props) => {
//   const [SearchEngineTask, setSearchEngineTaskState] = useState(null);
//   const [showEditNoteReminder, setShowEditNoteReminderState] = useState(false);
//   const [showPopUp, setShowPopUpState] = useState(false);
//   const [showSaveButton, setShowSaveButtonState] = useState(false);
//   const [note, setNoteState] = useState("");
//   const [showEndTaskPopUp, setShowEndTaskPopUpState] = useState(false);
//   const [isRatingNeeded, setIsRatingNeededState] = useState(false);
//   const [showRatingPopUp, setShowRatingPopUpState] = useState(false);
//   const [timeRemaining, setTimeRemainingState] = useState(0);
//   const [queryCount, setQueryCountState] = useState(0);
//   const [promptIDForRating, setPromptIDForRatingState] = useState(null);
//   const [tasks, setTasksState] = useState({
//     firstTask: null,
//     firstTaskTopic: null,
//     firstTaskDescription: null,
//   });
//   const [allResponsesRated, setAllResponsesRatedState] = useState(false);
//   const [triggerAfterResponse, setTriggerAfterResponseState] = useState(null);
//   const [isTasksLoading, setIsTasksLoading] = useState(true);
//   const authCtx = useContext(AuthContext);

//   // Helper function to generate a Latin Square
//   const generateLatinSquare = (tasks) => {
//     const n = tasks.length;
//     if (n === 0) return [];
//     let latinSquare = [];
//     for (let i = 0; i < n; i++) {
//       let row = [];
//       for (let j = 0; j < n; j++) {
//         row.push(tasks[(i + j) % n]);
//       }
//       latinSquare.push(row);
//     }
//     return latinSquare;
//   };

//   // Helper function to randomly select a task from the Latin Square
//   const selectRandomTask = (latinSquare) => {
//     if (latinSquare.length === 0) return null;
//     const randomRowIndex = Math.floor(Math.random() * latinSquare.length);
//     const randomRow = latinSquare[randomRowIndex];
//     return randomRow[0];
//   };

//   // Generate new tasks - assigns task type (chat/search) and a random task from tasks.json
//   const generateNewTasks = () => {
//     // Randomly decide if first task is chat or search
//     const isFirstTaskChat = Math.random() < 0.5;
//     const firstTask = isFirstTaskChat ? "chat" : "search";

//     // Get a random task from tasks.json using Latin Square
//     const latinSquare = generateLatinSquare(tasksJSON);
//     const selectedTask = selectRandomTask(latinSquare);

//     // Extract task details
//     const firstTaskTopic = selectedTask?.title || "Complete the assigned task";
//     const firstTaskDescription =
//       selectedTask?.description || "Please complete the task as instructed.";

//     return {
//       firstTask, // "chat" or "search"
//       firstTaskTopic, // Task title (shown in navbar)
//       firstTaskDescription, // Task full description (shown in navbar)
//     };
//   };

//   // Fetch or assign tasks - this is the main function
//   const fetchOrAssignTasks = useCallback(async (userId) => {
//     if (!userId) {
//       console.log("No userId provided to fetchOrAssignTasks");
//       setIsTasksLoading(false);
//       return;
//     }

//     console.log("fetchOrAssignTasks called for userId:", userId);
//     setIsTasksLoading(true);

//     try {
//       const userDocRef = doc(db, "users", userId);
//       const docSnap = await getDoc(userDocRef);

//       if (docSnap.exists()) {
//         const userData = docSnap.data();
//         console.log("User document exists:", userData);

//         // Check if tasks exist and have all required fields
//         if (
//           userData.tasks &&
//           userData.tasks.firstTask &&
//           userData.tasks.firstTaskTopic &&
//           userData.tasks.firstTaskDescription
//         ) {
//           console.log("Found existing complete tasks:", userData.tasks);
//           setTasksState(userData.tasks);
//           setIsTasksLoading(false);
//           return userData.tasks;
//         }
//       }

//       // No complete tasks found, generate and save new ones
//       console.log("No complete tasks found, generating new tasks...");
//       const newTasks = generateNewTasks();
//       console.log("Generated tasks:", newTasks);

//       // Save to Firestore
//       const userDocRef2 = doc(db, "users", userId);
//       await setDoc(userDocRef2, { tasks: newTasks }, { merge: true });
//       console.log("Tasks saved to Firestore");

//       // Update state
//       setTasksState(newTasks);
//       setIsTasksLoading(false);
//       return newTasks;
//     } catch (error) {
//       console.error("Error in fetchOrAssignTasks:", error);
//       // Even on error, generate tasks locally so UI can show something
//       const newTasks = generateNewTasks();
//       setTasksState(newTasks);
//       setIsTasksLoading(false);
//       return newTasks;
//     }
//   }, []);

//   // Auto-fetch tasks when user changes
//   useEffect(() => {
//     if (authCtx.user && authCtx.user.uid) {
//       console.log("User detected, fetching tasks for:", authCtx.user.uid);
//       fetchOrAssignTasks(authCtx.user.uid);
//     } else {
//       console.log("No user, setting isTasksLoading to false");
//       setIsTasksLoading(false);
//     }
//   }, [authCtx.user, fetchOrAssignTasks]);

//   // Legacy setTasks function (for backward compatibility with SignUp.js)
//   const setTasks = async (user) => {
//     if (!user || !user.uid) {
//       console.error("No user provided to setTasks");
//       return null;
//     }
//     return fetchOrAssignTasks(user.uid);
//   };

//   // Manual trigger for assigning tasks
//   const assignTasksIfNeeded = async () => {
//     if (authCtx.user && authCtx.user.uid && !tasks.firstTask) {
//       return fetchOrAssignTasks(authCtx.user.uid);
//     }
//     return tasks;
//   };

//   const setSearchEngineTask = (task) => setSearchEngineTaskState(task);
//   const setShowEditNoteReminder = (value) =>
//     setShowEditNoteReminderState(value);
//   const setShowPopUp = (value) => setShowPopUpState(value);
//   const setShowSaveButton = (value) => setShowSaveButtonState(value);
//   const setNote = (note) => setNoteState(note);
//   const setShowEndTaskPopUp = (value) => setShowEndTaskPopUpState(value);
//   const setIsRatingNeeded = (value) => setIsRatingNeededState(value);
//   const setShowRatingPopUp = (value) => setShowRatingPopUpState(value);
//   const setTimeRemaining = (time) => setTimeRemainingState(time);
//   const setQueryCount = () => setQueryCountState((prev) => prev + 1);
//   const setAllResponsesRated = (value) => setAllResponsesRatedState(value);
//   const setPromptIDForRating = (value) => setPromptIDForRatingState(value);
//   const setTriggerAfterResponse = (callback) =>
//     setTriggerAfterResponseState(() => callback);

//   const getQuestionnaireText = (questionnaire) => {
//     if (questionnaire === "search") {
//       return "Search Engine ";
//     } else {
//       return "Virtual Assistant";
//     }
//   };

//   const contextValue = {
//     SearchEngineTask,
//     showEditNoteReminder,
//     showPopUp,
//     showSaveButton,
//     note,
//     showEndTaskPopUp,
//     isRatingNeeded,
//     showRatingPopUp,
//     tasks,
//     timeRemaining,
//     queryCount,
//     allResponsesRated,
//     promptIDForRating,
//     triggerAfterResponse,
//     isTasksLoading,
//     setSearchEngineTask,
//     setShowEditNoteReminder,
//     setShowPopUp,
//     setShowSaveButton,
//     setNote,
//     setShowEndTaskPopUp,
//     setIsRatingNeeded,
//     setShowRatingPopUp,
//     setTasks,
//     setTimeRemaining,
//     setQueryCount,
//     setAllResponsesRated,
//     getQuestionnaireText,
//     setPromptIDForRating,
//     setTriggerAfterResponse,
//     assignTasksIfNeeded,
//   };

//   return (
//     <TaskContext.Provider value={contextValue}>
//       {props.children}
//     </TaskContext.Provider>
//   );
// };

// export default TaskContext;

import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { db } from "../firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AuthContext from "./auth-context";
import tasksJSON from "../tasks.json";

const TaskContext = createContext({
  showEditNoteReminder: false,
  showPopUp: null,
  showSaveButton: null,
  isRatingNeeded: null,
  showRatingPopUp: null,
  note: null,
  showEndTaskPopUp: false,
  tasks: {},
  timeRemaining: 0,
  queryCount: 0,
  allResponsesRated: false,
  questionnaireOrder: {},
  promptIDForRating: null,
  triggerAfterResponse: null,
  isTasksLoading: true,
  setShowEditNoteReminder: () => {},
  setShowPopUp: () => {},
  setShowSaveButton: () => {},
  setNote: () => {},
  setShowEndTaskPopUp: () => {},
  setIsRatingNeeded: () => {},
  setShowRatingPopUp: () => {},
  setTasks: () => {},
  setTimeRemaining: () => {},
  setQueryCount: () => {},
  setAllResponsesRated: () => {},
  setQuestionnaireOrder: () => {},
  getQuestionnaireText: () => {},
  setPromptIDForRating: () => {},
  setTriggerAfterResponse: () => {},
  assignTasksIfNeeded: () => {},
});

export const TaskContextProvider = (props) => {
  const [SearchEngineTask, setSearchEngineTaskState] = useState(null);
  const [showEditNoteReminder, setShowEditNoteReminderState] = useState(false);
  const [showPopUp, setShowPopUpState] = useState(false);
  const [showSaveButton, setShowSaveButtonState] = useState(false);
  const [note, setNoteState] = useState("");
  const [showEndTaskPopUp, setShowEndTaskPopUpState] = useState(false);
  const [isRatingNeeded, setIsRatingNeededState] = useState(false);
  const [showRatingPopUp, setShowRatingPopUpState] = useState(false);
  const [timeRemaining, setTimeRemainingState] = useState(0);
  const [queryCount, setQueryCountState] = useState(0);
  const [promptIDForRating, setPromptIDForRatingState] = useState(null);
  const [tasks, setTasksState] = useState({
    firstTask: null,
    firstTaskTopic: null,
    firstTaskDescription: null,
  });
  const [allResponsesRated, setAllResponsesRatedState] = useState(false);
  const [triggerAfterResponse, setTriggerAfterResponseState] = useState(null);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const authCtx = useContext(AuthContext);

  // Helper function to generate a Latin Square
  const generateLatinSquare = (tasks) => {
    const n = tasks.length;
    if (n === 0) return [];
    let latinSquare = [];
    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < n; j++) {
        row.push(tasks[(i + j) % n]);
      }
      latinSquare.push(row);
    }
    return latinSquare;
  };

  // Helper function to randomly select a task from the Latin Square
  const selectRandomTask = (latinSquare) => {
    if (latinSquare.length === 0) return null;
    const randomRowIndex = Math.floor(Math.random() * latinSquare.length);
    const randomRow = latinSquare[randomRowIndex];
    return randomRow[0];
  };

  // Fetch study settings from Firestore
  const fetchStudySettings = async () => {
    try {
      const docRef = doc(db, "admin", "studySettings");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      // Return default settings if none exist
      return {
        surveyType: "random",
        notesEnabled: true,
        minimumInteractions: 4,
      };
    } catch (error) {
      console.error("Error fetching study settings:", error);
      return {
        surveyType: "random",
        notesEnabled: true,
        minimumInteractions: 4,
      };
    }
  };

  // Determine task type based on admin settings
  const determineTaskType = (surveyType) => {
    switch (surveyType) {
      case "chatOnly":
        return "chat";
      case "searchOnly":
        return "search";
      case "random":
      default:
        // Random 50/50 assignment
        return Math.random() < 0.5 ? "chat" : "search";
    }
  };

  // Generate new tasks - assigns task type (chat/search) based on admin settings
  const generateNewTasks = async () => {
    // Fetch admin settings to determine survey type
    const studySettings = await fetchStudySettings();
    const surveyType = studySettings.surveyType || "random";

    // Determine task type based on admin setting
    const firstTask = determineTaskType(surveyType);

    console.log(
      `Survey type setting: ${surveyType}, Assigned task: ${firstTask}`,
    );

    // Get a random task from tasks.json using Latin Square
    const latinSquare = generateLatinSquare(tasksJSON);
    const selectedTask = selectRandomTask(latinSquare);

    // Extract task details
    const firstTaskTopic = selectedTask?.title || "Complete the assigned task";
    const firstTaskDescription =
      selectedTask?.description || "Please complete the task as instructed.";

    return {
      firstTask, // "chat" or "search"
      firstTaskTopic, // Task title (shown in navbar)
      firstTaskDescription, // Task full description (shown in navbar)
      surveyTypeAssigned: surveyType, // Store which setting was used for reference
    };
  };

  // Assign tasks if needed - called when user logs in or component mounts
  const assignTasksIfNeeded = useCallback(async (userId) => {
    if (!userId) {
      console.log("No userId provided to assignTasksIfNeeded");
      setIsTasksLoading(false);
      return;
    }

    console.log("assignTasksIfNeeded called for userId:", userId);
    setIsTasksLoading(true);

    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User document exists:", userData);

        // Check if tasks exist and have all required fields
        if (
          userData.tasks &&
          userData.tasks.firstTask &&
          userData.tasks.firstTaskTopic &&
          userData.tasks.firstTaskDescription
        ) {
          console.log("Found existing complete tasks:", userData.tasks);
          setTasksState(userData.tasks);
          setIsTasksLoading(false);
          return userData.tasks;
        }
      }

      // No complete tasks found, generate and save new ones
      console.log("No complete tasks found, generating new tasks...");
      const newTasks = await generateNewTasks();
      console.log("Generated tasks:", newTasks);

      // Save to Firestore
      await setDoc(userDocRef, { tasks: newTasks }, { merge: true });
      console.log("Tasks saved to Firestore");

      setTasksState(newTasks);
      setIsTasksLoading(false);
      return newTasks;
    } catch (error) {
      console.error("Error in assignTasksIfNeeded:", error);
      setIsTasksLoading(false);
      return null;
    }
  }, []);

  // Fetch assigned task when user changes
  useEffect(() => {
    const fetchAssignedTask = async () => {
      if (authCtx.user && authCtx.user.uid) {
        await assignTasksIfNeeded(authCtx.user.uid);
      } else {
        setIsTasksLoading(false);
      }
    };

    fetchAssignedTask();
  }, [authCtx.user, assignTasksIfNeeded]);

  // Context setters
  const setSearchEngineTask = (value) => setSearchEngineTaskState(value);
  const setShowEditNoteReminder = (value) =>
    setShowEditNoteReminderState(value);
  const setShowPopUp = (value) => setShowPopUpState(value);
  const setShowSaveButton = (value) => setShowSaveButtonState(value);
  const setNote = (value) => setNoteState(value);
  const setShowEndTaskPopUp = (value) => setShowEndTaskPopUpState(value);
  const setIsRatingNeeded = (value) => setIsRatingNeededState(value);
  const setShowRatingPopUp = (value) => setShowRatingPopUpState(value);
  const setTimeRemaining = (time) => setTimeRemainingState(time);
  const setQueryCount = () => setQueryCountState((prev) => prev + 1);
  const setAllResponsesRated = (value) => setAllResponsesRatedState(value);
  const setPromptIDForRating = (value) => setPromptIDForRatingState(value);
  const setTriggerAfterResponse = (callback) =>
    setTriggerAfterResponseState(() => callback);

  const setTasks = (tasksObj) => {
    setTasksState(tasksObj);
  };

  const getQuestionnaireText = (questionnaire) => {
    if (questionnaire === "search") {
      return "Search Engine ";
    } else {
      return "Virtual Assistant";
    }
  };

  const contextValue = {
    SearchEngineTask,
    showEditNoteReminder,
    showPopUp,
    showSaveButton,
    note,
    showEndTaskPopUp,
    isRatingNeeded,
    showRatingPopUp,
    tasks,
    // Also expose individual task properties for convenience
    firstTask: tasks.firstTask,
    firstTaskTopic: tasks.firstTaskTopic,
    firstTaskDescription: tasks.firstTaskDescription,
    timeRemaining,
    queryCount,
    allResponsesRated,
    promptIDForRating,
    triggerAfterResponse,
    isTasksLoading,
    setSearchEngineTask,
    setShowEditNoteReminder,
    setShowPopUp,
    setShowSaveButton,
    setNote,
    setShowEndTaskPopUp,
    setIsRatingNeeded,
    setShowRatingPopUp,
    setTasks,
    setTimeRemaining,
    setQueryCount,
    setAllResponsesRated,
    getQuestionnaireText,
    setPromptIDForRating,
    setTriggerAfterResponse,
    assignTasksIfNeeded,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {props.children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
