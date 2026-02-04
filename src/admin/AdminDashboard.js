// import React, { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthContext from "../context/auth-context";
// import show_more_icon from "../assets/common/show_more.svg";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const authCtx = useContext(AuthContext);

//   const adminTasks = [
//     {
//       title: "Study Settings",
//       description:
//         "Configure survey type (Chat/Search/Random), notes feature, and minimum interactions",
//       path: "/admin/study-settings",
//     },
//     {
//       title: "Manage Study Flow",
//       description:
//         "Customize study steps order, enable/disable steps, and configure reminders",
//       path: "/admin/study-flow",
//     },
//     {
//       title: "In-Situ Surveys",
//       description:
//         "Configure pop-up questionnaires triggered by participant actions (prompts, responses, searches)",
//       path: "/admin/insitu-surveys",
//       isNew: true,
//     },
//     {
//       title: "Insert/View Tasks",
//       description: "Insert new tasks and view existing ones for participants",
//       path: "/admin/insert-tasks",
//     },
//     {
//       title: "Manage Experience Survey",
//       description: "Create and manage session experience survey questions",
//       path: "/admin/experience-survey",
//     },
//     {
//       title: "Manage Demography Survey",
//       description: "Create and manage demographic survey questions",
//       path: "/admin/demography-survey",
//     },
//     {
//       title: "Manage Topology",
//       description: "Configure intention types and their hierarchical structure",
//       path: "/admin/topology",
//     },
//     {
//       title: "API Settings",
//       description: "Configure your API keys for OpenAI, Bing, and Brave Search",
//       path: "/admin/settings",
//     },
//     {
//       title: "View Participant Responses",
//       description:
//         "View and export survey responses from your participants as CSV",
//       path: "/admin/view-responses",
//     },
//   ];

//   const handleNavigation = (task) => () => {
//     navigate(task.path);
//   };

//   const handleSwitchToParticipant = () => {
//     navigate("/home");
//   };

//   const handleLogout = () => {
//     authCtx.logout();
//     navigate("/admin/login");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               Admin Dashboard
//             </h1>
//             <p className="text-sm text-gray-500">
//               Welcome, {authCtx.user?.email || "Admin"}
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSwitchToParticipant}
//               className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//             >
//               Switch to Participant View
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Quick Stats */}
//         <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
//           <h3 className="text-sm font-medium text-gray-500 mb-3">
//             Quick Actions
//           </h3>
//           <div className="flex gap-3">
//             <button
//               onClick={() => navigate("/admin/settings")}
//               className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
//             >
//               API Settings
//             </button>
//             <button
//               onClick={() => navigate("/admin/study-settings")}
//               className="flex-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
//             >
//               Study Settings
//             </button>
//             <button
//               onClick={() => navigate("/admin/view-responses")}
//               className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
//             >
//               View Responses
//             </button>
//           </div>
//         </div>
//         <div className="grid gap-4">
//           {adminTasks.map((task, index) => (
//             <div
//               key={index}
//               onClick={handleNavigation(task)}
//               className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-all hover:border-blue-300 ${
//                 task.isNew ? "" : ""
//               }`}
//             >
//               <div className="flex justify-between items-center">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-lg font-semibold text-gray-800">
//                       {task.title}
//                     </h2>
//                   </div>
//                   <p className="text-gray-600 text-sm mt-1">
//                     {task.description}
//                   </p>
//                 </div>
//                 <img
//                   src={show_more_icon}
//                   alt="Navigate"
//                   className="w-6 h-6 opacity-50"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/auth-context";
import show_more_icon from "../assets/common/show_more.svg";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const groupedTasks = [
    {
      groupTitle: "Study Configuration",
      description: "Core configuration for how studies and participants behave",
      items: [
        {
          title: "Study Settings",
          description: "Configure survey type, notes, and minimum interactions",
          path: "/admin/study-settings",
        },
        {
          title: "Manage Study Flow",
          description: "Customize step order, enable/disable steps, reminders",
          path: "/admin/study-flow",
        },
        {
          title: "Manage Consent Form",
          description:
            "Customize the consent form content, questions, and text shown to participants",
          path: "/admin/consent-form",
        },
        {
          title: "Manage Typology",
          description: "Configure intention types and hierarchy",
          path: "/admin/topology",
        },
      ],
    },
    {
      groupTitle: "Surveys & Questionnaires",
      description: "All participant surveys and feedback systems",
      items: [
        {
          title: "In-Situ Surveys",
          description: "Pop-up surveys triggered by actions",
          path: "/admin/insitu-surveys",
          isNew: true,
        },
        {
          title: "Experience Survey",
          description: "Session experience questions",
          path: "/admin/experience-survey",
        },
        {
          title: "Demography Survey",
          description: "Participant demographic questions",
          path: "/admin/demography-survey",
        },
      ],
    },
    {
      groupTitle: "Tasks & Content",
      description: "Manage participant tasks and activities",
      items: [
        {
          title: "Insert / View Tasks",
          description: "Create and manage participant tasks",
          path: "/admin/insert-tasks",
        },
      ],
    },
    {
      groupTitle: "Data & System",
      description: "System configuration and data management",
      items: [
        {
          title: "API Settings",
          description: "Manage API keys",
          path: "/admin/settings",
        },
        {
          title: "Participant Responses",
          description: "View and export survey data",
          path: "/admin/view-responses",
        },
      ],
    },
  ];

  const handleSwitchToParticipant = () => navigate("/home");
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
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Welcome, {authCtx.user?.email || "Admin"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSwitchToParticipant}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Switch to Participant View
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Actions */}
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

        {/* Grouped Sections */}
        <div className="space-y-8">
          {groupedTasks.map((group, gIndex) => (
            <div key={gIndex}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {group.groupTitle}
                </h2>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>

              <div className="grid gap-4">
                {group.items.map((task, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(task.path)}
                    className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-semibold text-gray-800">
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {task.description}
                        </p>
                      </div>
                      <img
                        src={show_more_icon}
                        alt="Navigate"
                        className="w-6 h-6 opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
