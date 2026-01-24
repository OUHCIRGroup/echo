import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/auth-context";
import show_more_icon from "../assets/common/show_more.svg";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const adminTasks = [
    {
      title: "Study Settings",
      description:
        "Configure survey type (Chat/Search/Random), notes feature, and minimum interactions",
      path: "/admin/study-settings",
    },
    {
      title: "Manage Study Flow",
      description:
        "Customize study steps order, enable/disable steps, and configure instructions",
      path: "/admin/study-flow",
    },
    {
      title: "Insert/View Tasks",
      description: "Insert new tasks and view existing ones for participants",
      path: "/admin/insert-tasks",
    },
    {
      title: "Manage Experience Survey",
      description: "Create and manage session experience survey questions",
      path: "/admin/experience-survey",
    },
    {
      title: "Manage Demography Survey",
      description: "Create and manage demographic survey questions",
      path: "/admin/demography-survey",
    },
    {
      title: "Manage Topology",
      description: "Configure intention types and their hierarchical structure",
      path: "/admin/topology",
    },
    {
      title: "API Settings",
      description: "Configure your API keys for OpenAI, Bing, and Brave Search",
      path: "/admin/settings",
    },
    {
      title: "View Participant Responses",
      description:
        "View and export survey responses from your participants as CSV",
      path: "/admin/view-responses",
    },
  ];

  const handleNavigation = (task) => () => {
    navigate(task.path);
  };

  const handleSwitchToParticipant = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    authCtx.logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">{authCtx?.user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSwitchToParticipant}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Switch to Participant View
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl">
          <h2 className="text-gray-800 text-2xl font-semibold text-center mb-4">
            Admin Dashboard
          </h2>

          <p className="mb-4 text-gray-600 text-center">
            Welcome to the Research Study Admin Panel. Use the options below to
            manage study tasks, view participant data, and configure system
            settings.
          </p>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Actions
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/settings")}
                className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                API Settings
              </button>
              <button
                onClick={() => navigate("/admin/study-settings")}
                className="flex-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Study Settings
              </button>
              <button
                onClick={() => navigate("/admin/view-responses")}
                className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                View Responses
              </button>
            </div>
          </div>

          {/* Admin Tasks List */}
          {adminTasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-stretch bg-white p-5 text-gray-800 w-full 
                      border border-gray-200 rounded-lg mb-3 shadow-sm transition-all
                      hover:cursor-pointer hover:shadow-md hover:border-blue-300"
              onClick={handleNavigation(task)}
            >
              <span className="text-2xl mr-4">{task.icon}</span>
              <div className="w-full flex flex-col">
                <span className="text-base font-medium mb-1">{task.title}</span>
                <span className="text-sm text-gray-600">
                  {task.description}
                </span>
              </div>
              <span className="ml-4">
                <img
                  src={show_more_icon}
                  alt="Access"
                  className="h-5 w-5 text-blue-600"
                />
              </span>
            </div>
          ))}
        </div>

        {/* Footer Instructions */}
        <div className="text-gray-600 text-sm mt-8 max-w-2xl text-center"></div>
      </div>
    </div>
  );
};

export default AdminDashboard;
