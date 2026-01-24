import React, { useEffect } from "react";
import checkbox_icon from "./assets/common/checkbox.svg";
import show_more_icon from "./assets/common/show_more.svg";
import circle_icon from "./assets/common/circle_icon.svg";
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

  // Build tasks array from enabled steps
  const buildTasksFromFlow = () => {
    const tasks = [];
    let previousCompleted = true;

    const preTaskIndex = enabledSteps.findIndex((s) => s.id === "preTask");
    const mainTaskIndex = enabledSteps.findIndex((s) => s.id === "mainTask");

    enabledSteps.forEach((step, index) => {
      if (
        index === preTaskIndex ||
        (preTaskIndex === -1 && index === mainTaskIndex)
      ) {
        const taskTypeName =
          firstTaskShort === "chat" ? "ChatGPT Task" : "Search Engine Task";
        tasks.push({
          title: taskTypeName || "Task",
          isText: true,
        });
      }

      if (step.id === "endOfStudy") {
        tasks.push({
          title: "End of Study",
          isText: true,
        });
      }

      const isCompleted = getCompletionStatus(step.flowStateKey);

      tasks.push({
        id: step.id,
        title: getStepTitle(step),
        completed: isCompleted,
        path: getStepPath(step),
        canNavigate: previousCompleted,
        allowEntryUponCompletion: true,
        estimatedTime: step.estimatedTime,
      });

      previousCompleted = isCompleted;
    });

    return tasks;
  };

  const tasks = buildTasksFromFlow();

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
      alert("Please complete the previous item");
    }
  };

  // Show loading while study flow config is loading
  if (isFlowLoading) {
    return (
      <div className="flex flex-col justify-center w-screen h-screen items-center">
        <div className="text-xl text-gray-600">Loading study...</div>
        <div className="text-sm text-gray-400 mt-2">Loading configuration</div>
      </div>
    );
  }

  // Show loading while tasks are being fetched
  if (taskCtx.isTasksLoading) {
    return (
      <div className="flex flex-col justify-center w-screen h-screen items-center">
        <div className="text-xl text-gray-600">Loading study...</div>
        <div className="text-sm text-gray-400 mt-2">Loading your tasks</div>
      </div>
    );
  }

  // If still no tasks after loading complete, show error with retry
  if (!taskCtx.tasks.firstTask) {
    return (
      <div className="flex flex-col justify-center w-screen h-screen items-center">
        <div className="text-xl text-red-600">Failed to load tasks</div>
        <div className="text-sm text-gray-500 mt-2">
          Please try refreshing the page
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center w-screen h-screen items-center">
      {/* Top-right button group */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        {authCtx.isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Switch to Admin Panel
          </button>
        )}

        <button
          onClick={() => {
            authCtx.logout();
            navigate("/");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="task-list w-[40%] overflow-y-auto mt-10">
        {tasks.map((task, index) => {
          if (task.isText) {
            return (
              <div
                key={`text-${index}`}
                className="text-black text-[16px] text-center my-2 mr-20"
              >
                {task.title}
              </div>
            );
          } else {
            return (
              <div
                key={task.id || index}
                className="flex items-center justify-stretch bg-[#e3e3e3] p-4 text-black w-full 
                        border-b-[1px] border-[#f9f9f9] text-[14px] hover:cursor-pointer"
                onClick={handleNavigation(task)}
              >
                <span className="text-green-600">
                  {task.completed ? (
                    <img
                      src={checkbox_icon}
                      alt="Completed"
                      className="h-5 w-5 text-green-600"
                    />
                  ) : (
                    <img
                      src={circle_icon}
                      alt="Not Completed"
                      className="h-5 w-5 text-green-600"
                    />
                  )}
                </span>
                <div className="w-full flex flex-col">
                  <span
                    className={`${task.completed ? "" : "ml-4"} w-full px-4`}
                  >
                    {task.title}
                  </span>
                  <span className="text-[12px] ml-8">
                    Estimated duration:
                    <span className="text-red-600 ml-2">
                      {task.estimatedTime}
                    </span>
                  </span>
                </div>
                <span>
                  <button>
                    <img
                      src={show_more_icon}
                      alt="Show More"
                      className="h-5 w-5 text-green-600"
                    />
                  </button>
                </span>
              </div>
            );
          }
        })}
      </div>
      <div className="text-black text-[20px]md:text-[14px] mt-20 md:mt-6 w-[30%] text-center">
        <p className="text-red-600 italic">Scroll to see all tasks</p>
        <p>
          Please, complete each item in the study in the order they are listed.
          You can only move to the next item when the current item is completed.
        </p>
      </div>
    </div>
  );
};

export default Home;
