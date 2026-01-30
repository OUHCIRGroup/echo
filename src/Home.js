// import React, { useEffect } from "react";
// import checkbox_icon from "./assets/common/checkbox.svg";
// import show_more_icon from "./assets/common/show_more.svg";
// import circle_icon from "./assets/common/circle_icon.svg";
// import { FlowContext } from "./context/flow-context";
// import { useNavigate } from "react-router-dom";
// import { useContext } from "react";
// import TaskContext from "./context/task-context";
// import AuthContext from "./context/auth-context";
// import { useStudyFlow } from "./context/study-flow-context";

// const Home = ({ onSelectItem }) => {
//   const flowCtx = useContext(FlowContext);
//   const taskCtx = useContext(TaskContext);
//   const authCtx = useContext(AuthContext);
//   const { enabledSteps, isLoading: isFlowLoading } = useStudyFlow();
//   const navigate = useNavigate();

//   const firstTaskShort = taskCtx.tasks.firstTask;

//   // Debug logging
//   useEffect(() => {
//     console.log("Home.js state:", {
//       isFlowLoading,
//       isTasksLoading: taskCtx.isTasksLoading,
//       firstTask: taskCtx.tasks.firstTask,
//       user: authCtx.user?.uid,
//       enabledStepsCount: enabledSteps.length,
//     });
//   }, [
//     isFlowLoading,
//     taskCtx.isTasksLoading,
//     taskCtx.tasks.firstTask,
//     authCtx.user,
//     enabledSteps,
//   ]);

//   // Map flow state keys to actual completion status
//   const getCompletionStatus = (flowStateKey) => {
//     const statusMap = {
//       demographyCompleted: flowCtx.demographyCompleted,
//       preTask1Completed: flowCtx.preTask1Completed,
//       task1Completed: flowCtx.task1Completed,
//       postTask1Completed: flowCtx.postTask1Completed,
//       sessionExperienceSurvey1Completed:
//         flowCtx.sessionExperienceSurvey1Completed,
//       isEndOfStudySurveyCompleted: flowCtx.isEndOfStudySurveyCompleted,
//     };
//     return statusMap[flowStateKey] || false;
//   };

//   // Get the actual path for a step (handle task type replacement)
//   const getStepPath = (step) => {
//     if (step.isTaskStep) {
//       return `/${firstTaskShort}?firstTask=true&flowState=setTask1Completed`;
//     }
//     if (step.requiresTask) {
//       const flowStateMap = {
//         preTask1Completed: "setPreTask1Completed",
//         postTask1Completed: "setPostTask1Completed",
//         sessionExperienceSurvey1Completed:
//           "setSessionExperienceSurvey1Completed",
//       };
//       const flowState = flowStateMap[step.flowStateKey] || "";
//       return `${step.path}?firstTask=true&currentTask=${firstTaskShort}&flowState=${flowState}`;
//     }
//     return step.path;
//   };

//   // Get display title for task steps
//   const getStepTitle = (step) => {
//     if (step.isTaskStep) {
//       const taskName = firstTaskShort === "chat" ? "ChatGPT" : "Search Engine";
//       return `Task: ${taskName} + Answer the Question`;
//     }
//     return step.title;
//   };

//   // Build tasks array from enabled steps
//   const buildTasksFromFlow = () => {
//     const tasks = [];
//     let previousCompleted = true;

//     const preTaskIndex = enabledSteps.findIndex((s) => s.id === "preTask");
//     const mainTaskIndex = enabledSteps.findIndex((s) => s.id === "mainTask");

//     enabledSteps.forEach((step, index) => {
//       if (
//         index === preTaskIndex ||
//         (preTaskIndex === -1 && index === mainTaskIndex)
//       ) {
//         const taskTypeName =
//           firstTaskShort === "chat" ? "ChatGPT Task" : "Search Engine Task";
//         tasks.push({
//           title: taskTypeName || "Task",
//           isText: true,
//         });
//       }

//       if (step.id === "endOfStudy") {
//         tasks.push({
//           title: "End of Study",
//           isText: true,
//         });
//       }

//       const isCompleted = getCompletionStatus(step.flowStateKey);

//       tasks.push({
//         id: step.id,
//         title: getStepTitle(step),
//         completed: isCompleted,
//         path: getStepPath(step),
//         canNavigate: previousCompleted,
//         allowEntryUponCompletion: true,
//         estimatedTime: step.estimatedTime,
//       });

//       previousCompleted = isCompleted;
//     });

//     return tasks;
//   };

//   const tasks = buildTasksFromFlow();

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const refresh = urlParams.get("refresh");
//     if (refresh) {
//       navigate("/home", { replace: true });
//       window.location.reload();
//     }
//   }, [flowCtx.isLoading, navigate]);

//   const handleNavigation = (task) => () => {
//     if (!taskCtx.tasks.firstTask) {
//       alert("Please wait, tasks are being loaded...");
//       return;
//     }

//     if (task.canNavigate) {
//       if (task.completed && !task.allowEntryUponCompletion) {
//         alert("You have already completed this task");
//         return;
//       }
//       navigate(task.path);
//     } else {
//       alert("Please complete the previous item");
//     }
//   };

//   // Show loading while study flow config is loading
//   if (isFlowLoading) {
//     return (
//       <div className="flex flex-col justify-center w-screen h-screen items-center">
//         <div className="text-xl text-gray-600">Loading study...</div>
//         <div className="text-sm text-gray-400 mt-2">Loading configuration</div>
//       </div>
//     );
//   }

//   // Show loading while tasks are being fetched
//   if (taskCtx.isTasksLoading) {
//     return (
//       <div className="flex flex-col justify-center w-screen h-screen items-center">
//         <div className="text-xl text-gray-600">Loading study...</div>
//         <div className="text-sm text-gray-400 mt-2">Loading your tasks</div>
//       </div>
//     );
//   }

//   // If still no tasks after loading complete, show error with retry
//   if (!taskCtx.tasks.firstTask) {
//     return (
//       <div className="flex flex-col justify-center w-screen h-screen items-center">
//         <div className="text-xl text-red-600">Failed to load tasks</div>
//         <div className="text-sm text-gray-500 mt-2">
//           Please try refreshing the page
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
//         >
//           Refresh Page
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col justify-center w-screen h-screen items-center">
//       {/* Top-right button group */}
//       <div className="fixed top-4 right-4 z-50 flex gap-3">
//         {authCtx.isAdmin && (
//           <button
//             onClick={() => navigate("/admin")}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
//           >
//             Switch to Admin Panel
//           </button>
//         )}

//         <button
//           onClick={() => {
//             authCtx.logout();
//             navigate("/");
//           }}
//           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
//         >
//           Logout
//         </button>
//       </div>

//       <div className="task-list w-[40%] overflow-y-auto mt-10">
//         {tasks.map((task, index) => {
//           if (task.isText) {
//             return (
//               <div
//                 key={`text-${index}`}
//                 className="text-black text-[16px] text-center my-2 mr-20"
//               >
//                 {task.title}
//               </div>
//             );
//           } else {
//             return (
//               <div
//                 key={task.id || index}
//                 className="flex items-center justify-stretch bg-[#e3e3e3] p-4 text-black w-full
//                         border-b-[1px] border-[#f9f9f9] text-[14px] hover:cursor-pointer"
//                 onClick={handleNavigation(task)}
//               >
//                 <span className="text-green-600">
//                   {task.completed ? (
//                     <img
//                       src={checkbox_icon}
//                       alt="Completed"
//                       className="h-5 w-5 text-green-600"
//                     />
//                   ) : (
//                     <img
//                       src={circle_icon}
//                       alt="Not Completed"
//                       className="h-5 w-5 text-green-600"
//                     />
//                   )}
//                 </span>
//                 <div className="w-full flex flex-col">
//                   <span
//                     className={`${task.completed ? "" : "ml-4"} w-full px-4`}
//                   >
//                     {task.title}
//                   </span>
//                   <span className="text-[12px] ml-8">
//                     Estimated duration:
//                     <span className="text-red-600 ml-2">
//                       {task.estimatedTime}
//                     </span>
//                   </span>
//                 </div>
//                 <span>
//                   <button>
//                     <img
//                       src={show_more_icon}
//                       alt="Show More"
//                       className="h-5 w-5 text-green-600"
//                     />
//                   </button>
//                 </span>
//               </div>
//             );
//           }
//         })}
//       </div>
//       <div className="text-black text-[20px]md:text-[14px] mt-20 md:mt-6 w-[30%] text-center">
//         <p className="text-red-600 italic">Scroll to see all tasks</p>
//         <p>
//           Please, complete each item in the study in the order they are listed.
//           You can only move to the next item when the current item is completed.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect } from "react";
import { FlowContext } from "./context/flow-context";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import TaskContext from "./context/task-context";
import AuthContext from "./context/auth-context";
import { useStudyFlow } from "./context/study-flow-context";

const Home = ({ onSelectItem }) => {
  const flowCtx = useContext(FlowContext);
  const taskCtx = useContext(TaskContext);
  const authCtx = useContext(AuthContext);
  const { enabledSteps, isLoading: isFlowLoading } = useStudyFlow();
  const navigate = useNavigate();

  const firstTaskShort = taskCtx.tasks.firstTask;

  // Debug logging
  useEffect(() => {
    console.log("Home.js state:", {
      isFlowLoading,
      isTasksLoading: taskCtx.isTasksLoading,
      firstTask: taskCtx.tasks.firstTask,
      user: authCtx.user?.uid,
      enabledStepsCount: enabledSteps.length,
    });
  }, [
    isFlowLoading,
    taskCtx.isTasksLoading,
    taskCtx.tasks.firstTask,
    authCtx.user,
    enabledSteps,
  ]);

  // Map flow state keys to actual completion status
  const getCompletionStatus = (flowStateKey) => {
    const statusMap = {
      demographyCompleted: flowCtx.demographyCompleted,
      preTask1Completed: flowCtx.preTask1Completed,
      task1Completed: flowCtx.task1Completed,
      postTask1Completed: flowCtx.postTask1Completed,
      sessionExperienceSurvey1Completed:
        flowCtx.sessionExperienceSurvey1Completed,
      isEndOfStudySurveyCompleted: flowCtx.isEndOfStudySurveyCompleted,
    };
    return statusMap[flowStateKey] || false;
  };

  // Get the actual path for a step (handle task type replacement)
  const getStepPath = (step) => {
    if (step.isTaskStep) {
      return `/${firstTaskShort}?firstTask=true&flowState=setTask1Completed`;
    }
    if (step.requiresTask) {
      const flowStateMap = {
        preTask1Completed: "setPreTask1Completed",
        postTask1Completed: "setPostTask1Completed",
        sessionExperienceSurvey1Completed:
          "setSessionExperienceSurvey1Completed",
      };
      const flowState = flowStateMap[step.flowStateKey] || "";
      return `${step.path}?firstTask=true&currentTask=${firstTaskShort}&flowState=${flowState}`;
    }
    return step.path;
  };

  // Get display title for task steps
  const getStepTitle = (step) => {
    if (step.isTaskStep) {
      const taskName = firstTaskShort === "chat" ? "ChatGPT" : "Search Engine";
      return `Task: ${taskName} + Answer the Question`;
    }
    return step.title;
  };

  // Get step icon based on type
  const getStepIcon = (step) => {
    const iconMap = {
      demography: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      preTask: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      mainTask: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      postTask: (
        <svg
          className="w-5 h-5"
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
      ),
      experienceSurvey: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      endOfStudy: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    };
    return (
      iconMap[step.id] || (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    );
  };

  // Build tasks array from enabled steps
  const buildTasksFromFlow = () => {
    const tasks = [];
    let previousCompleted = true;

    enabledSteps.forEach((step, index) => {
      const isCompleted = getCompletionStatus(step.flowStateKey);

      tasks.push({
        id: step.id,
        title: getStepTitle(step),
        completed: isCompleted,
        path: getStepPath(step),
        canNavigate: previousCompleted,
        allowEntryUponCompletion: true,
        estimatedTime: step.estimatedTime,
        icon: getStepIcon(step),
        stepNumber: index + 1,
      });

      previousCompleted = isCompleted;
    });

    return tasks;
  };

  const tasks = buildTasksFromFlow();
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get("refresh");
    if (refresh) {
      navigate("/home", { replace: true });
      window.location.reload();
    }
  }, [flowCtx.isLoading, navigate]);

  const handleNavigation = (task) => () => {
    if (!taskCtx.tasks.firstTask) {
      alert("Please wait, tasks are being loaded...");
      return;
    }

    if (task.canNavigate) {
      if (task.completed && !task.allowEntryUponCompletion) {
        alert("You have already completed this task");
        return;
      }
      navigate(task.path);
    } else {
      alert("Please complete the previous item first");
    }
  };

  // Show loading while study flow config is loading
  if (isFlowLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">
            Loading study...
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Loading configuration
          </div>
        </div>
      </div>
    );
  }

  // Show loading while tasks are being fetched
  if (taskCtx.isTasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">
            Loading study...
          </div>
          <div className="text-sm text-gray-400 mt-2">Loading your tasks</div>
        </div>
      </div>
    );
  }

  // If still no tasks after loading complete, show error with retry
  if (!taskCtx.tasks.firstTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-xl font-medium text-gray-800 mb-2">
            Failed to load tasks
          </div>
          <div className="text-gray-500 mb-6">
            Please try refreshing the page
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        {authCtx.isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
          >
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Admin Panel
          </button>
        )}
        <button
          onClick={() => {
            authCtx.logout();
            navigate("/");
          }}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-colors border border-gray-200 flex items-center gap-2"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>

      <div className="max-w-2xl mx-auto pt-16">
        {/* <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Research Study
            </h1>
            <p className="text-gray-500">
              Complete the following steps to finish the study
            </p>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {completedCount} of {tasks.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div> */}

        {/* Task Type Badge */}
        <div className="flex justify-center mb-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              firstTaskShort === "chat"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {firstTaskShort === "chat" ? (
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            ) : (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
            Your Task:{" "}
            {firstTaskShort === "chat" ? "ChatGPT Interface" : "Search Engine"}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const isActive = task.canNavigate && !task.completed;
            const isLocked = !task.canNavigate;

            return (
              <div
                key={task.id || index}
                onClick={handleNavigation(task)}
                className={`bg-white rounded-xl shadow-sm border-2 p-5 transition-all duration-200 ${
                  task.completed
                    ? "border-green-200 bg-green-50"
                    : isActive
                      ? "border-blue-300 hover:border-blue-400 hover:shadow-md cursor-pointer"
                      : isLocked
                        ? "border-gray-200 opacity-60 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Step Number / Status Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      task.completed
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {task.completed ? (
                      <svg
                        className="w-6 h-6"
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
                    ) : isLocked ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    ) : (
                      <span className="font-bold">{task.stepNumber}</span>
                    )}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-lg ${
                        task.completed
                          ? "text-green-700"
                          : isLocked
                            ? "text-gray-400"
                            : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.estimatedTime && (
                      <p
                        className={`text-sm mt-1 ${
                          task.completed ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {task.completed
                          ? "Completed"
                          : `Estimated: ${task.estimatedTime}`}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div
                    className={`flex-shrink-0 ${
                      task.completed
                        ? "text-green-500"
                        : isActive
                          ? "text-blue-500"
                          : "text-gray-300"
                    }`}
                  >
                    {!isLocked && (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
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
            <h2 className="text-2xl font-bold mb-2">🎉 Study Completed!</h2>
            <p className="opacity-90">
              Thank you for participating in our research study.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
