// import React, { useState, useEffect, useContext } from "react";
// import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../../firebase-config";
// import AuthContext from "../../context/auth-context";
// import { useNavigate } from "react-router-dom";

// // Default study settings
// const DEFAULT_STUDY_SETTINGS = {
//   // Feature 1: Survey type assignment
//   surveyType: "random", // "chatOnly", "searchOnly", "random"

//   // Feature 2: Notes feature toggle
//   notesEnabled: true,

//   // Feature 3: Minimum interactions required
//   minimumInteractions: 4,
// };

// const ManageStudySettings = () => {
//   const [settings, setSettings] = useState(DEFAULT_STUDY_SETTINGS);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [saveMessage, setSaveMessage] = useState("");

//   const authCtx = useContext(AuthContext);
//   const navigate = useNavigate();

//   // Load settings from Firestore
//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         const docRef = doc(db, "admin", "studySettings");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setSettings({
//             surveyType: data.surveyType || DEFAULT_STUDY_SETTINGS.surveyType,
//             notesEnabled:
//               data.notesEnabled !== undefined
//                 ? data.notesEnabled
//                 : DEFAULT_STUDY_SETTINGS.notesEnabled,
//             minimumInteractions:
//               data.minimumInteractions ||
//               DEFAULT_STUDY_SETTINGS.minimumInteractions,
//           });
//         } else {
//           setSettings(DEFAULT_STUDY_SETTINGS);
//         }
//       } catch (error) {
//         console.error("Error loading study settings:", error);
//         setSettings(DEFAULT_STUDY_SETTINGS);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadSettings();
//   }, []);

//   // Save settings to Firestore
//   const saveSettings = async () => {
//     setIsSaving(true);
//     setSaveMessage("");

//     try {
//       const docRef = doc(db, "admin", "studySettings");
//       await setDoc(docRef, {
//         ...settings,
//         updatedAt: serverTimestamp(),
//         updatedBy: authCtx.user?.uid || null,
//       });

//       setHasChanges(false);
//       setSaveMessage("Settings saved successfully!");
//       setTimeout(() => setSaveMessage(""), 3000);
//     } catch (error) {
//       console.error("Error saving study settings:", error);
//       setSaveMessage("Error saving settings. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Reset to defaults
//   const resetToDefault = () => {
//     if (
//       window.confirm("Are you sure you want to reset all settings to default?")
//     ) {
//       setSettings(DEFAULT_STUDY_SETTINGS);
//       setHasChanges(true);
//     }
//   };

//   // Handle survey type change
//   const handleSurveyTypeChange = (value) => {
//     setSettings((prev) => ({ ...prev, surveyType: value }));
//     setHasChanges(true);
//   };

//   // Handle notes toggle
//   const handleNotesToggle = () => {
//     setSettings((prev) => ({ ...prev, notesEnabled: !prev.notesEnabled }));
//     setHasChanges(true);
//   };

//   // Handle minimum interactions change
//   const handleMinInteractionsChange = (value) => {
//     const numValue = parseInt(value, 10);
//     if (numValue >= 1 && numValue <= 20) {
//       setSettings((prev) => ({ ...prev, minimumInteractions: numValue }));
//       setHasChanges(true);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-lg text-gray-600">Loading study settings...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-3xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate("/admin/dashboard")}
//             className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-1"
//           >
//             Back to Dashboard
//           </button>
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                 Study Settings
//               </h1>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={resetToDefault}
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
//               >
//                 Reset to Default
//               </button>
//               <button
//                 onClick={saveSettings}
//                 disabled={!hasChanges || isSaving}
//                 className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                   hasChanges
//                     ? "bg-blue-500 hover:bg-blue-600 text-white"
//                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 }`}
//               >
//                 {isSaving ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Save Message */}
//         {saveMessage && (
//           <div
//             className={`mb-6 p-4 rounded-lg ${
//               saveMessage.includes("Error")
//                 ? "bg-red-100 text-red-800"
//                 : "bg-green-100 text-green-800"
//             }`}
//           >
//             {saveMessage}
//           </div>
//         )}

//         {/* Settings Sections */}
//         <div className="space-y-6">
//           {/* Feature 1: Survey Type Selection */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Survey Type Assignment
//             </h2>
//             <p className="text-gray-600 text-sm mb-4">
//               Choose how participants are assigned to survey types. This affects
//               which interface (Chat/Search) participants will use.
//             </p>

//             <div className="space-y-3">
//               <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
//                 <input
//                   type="radio"
//                   name="surveyType"
//                   value="chatOnly"
//                   checked={settings.surveyType === "chatOnly"}
//                   onChange={(e) => handleSurveyTypeChange(e.target.value)}
//                   className="mt-1"
//                 />
//                 <div>
//                   <div className="font-medium text-gray-800">Chat Only</div>
//                   <div className="text-sm text-gray-600">
//                     All participants will use the ChatGPT interface only
//                   </div>
//                 </div>
//               </label>

//               <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
//                 <input
//                   type="radio"
//                   name="surveyType"
//                   value="searchOnly"
//                   checked={settings.surveyType === "searchOnly"}
//                   onChange={(e) => handleSurveyTypeChange(e.target.value)}
//                   className="mt-1"
//                 />
//                 <div>
//                   <div className="font-medium text-gray-800">Search Only</div>
//                   <div className="text-sm text-gray-600">
//                     All participants will use the Search Engine interface only
//                   </div>
//                 </div>
//               </label>

//               <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
//                 <input
//                   type="radio"
//                   name="surveyType"
//                   value="random"
//                   checked={settings.surveyType === "random"}
//                   onChange={(e) => handleSurveyTypeChange(e.target.value)}
//                   className="mt-1"
//                 />
//                 <div>
//                   <div className="font-medium text-gray-800">
//                     Random (Both Chat & Search)
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Participants are randomly assigned to either Chat or Search
//                     (50/50 split)
//                   </div>
//                 </div>
//               </label>
//             </div>

//             {/* Current Selection Display */}
//             <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//               <span className="text-sm text-blue-800">
//                 <strong>Current Setting:</strong>{" "}
//                 {settings.surveyType === "chatOnly" &&
//                   "All participants use Chat"}
//                 {settings.surveyType === "searchOnly" &&
//                   "All participants use Search"}
//                 {settings.surveyType === "random" &&
//                   "Random assignment (Chat or Search)"}
//               </span>
//             </div>
//           </div>

//           {/* Feature 2: Notes Feature Toggle */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Notes Feature
//             </h2>
//             <p className="text-gray-600 text-sm mb-4">
//               Enable or disable the notes panel that appears during tasks. When
//               disabled, participants will not see the notes section.
//             </p>

//             <div className="flex items-center justify-between p-4 border rounded-lg">
//               <div>
//                 <div className="font-medium text-gray-800">
//                   Enable Notes Panel
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Show the notes taking area on the right side during tasks
//                 </div>
//               </div>
//               <button
//                 onClick={handleNotesToggle}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                   settings.notesEnabled ? "bg-blue-500" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                     settings.notesEnabled ? "translate-x-6" : "translate-x-1"
//                   }`}
//                 />
//               </button>
//             </div>

//             {/* Status Display */}
//             <div
//               className={`mt-4 p-3 rounded-lg ${settings.notesEnabled ? "bg-green-50" : "bg-yellow-50"}`}
//             >
//               <span
//                 className={`text-sm ${settings.notesEnabled ? "text-green-800" : "text-yellow-800"}`}
//               >
//                 <strong>Status:</strong>{" "}
//                 {settings.notesEnabled
//                   ? "Notes panel is ENABLED. Participants can take notes during tasks."
//                   : "Notes panel is DISABLED. Participants will not see the notes section."}
//               </span>
//             </div>
//           </div>

//           {/* Feature 3: Minimum Interactions */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Minimum Interactions Required
//             </h2>
//             <p className="text-gray-600 text-sm mb-4">
//               Set the minimum number of interactions (queries/prompts)
//               participants must complete before they can submit their task.
//             </p>

//             <div className="flex items-center gap-4">
//               <label className="font-medium text-gray-700">
//                 Required Interactions:
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="20"
//                 value={settings.minimumInteractions}
//                 onChange={(e) => handleMinInteractionsChange(e.target.value)}
//                 className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <span className="text-gray-500 text-sm">(1 to 20)</span>
//             </div>

//             {/* Info Display */}
//             <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//               <span className="text-sm text-gray-700">
//                 <strong>Current Setting:</strong> Participants must complete at
//                 least{" "}
//                 <span className="font-bold text-blue-600">
//                   {settings.minimumInteractions}
//                 </span>{" "}
//                 interaction{settings.minimumInteractions !== 1 ? "s" : ""}{" "}
//                 before submitting.
//               </span>
//             </div>

//             {/* Explanation */}
//             <div className="mt-3 text-sm text-gray-600">
//               <p>
//                 For <strong>Chat tasks</strong>: Number of prompts sent to
//                 ChatGPT
//               </p>
//               <p>
//                 For <strong>Search tasks</strong>: Number of search queries
//                 performed
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageStudySettings;

import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

// Default study settings
const DEFAULT_STUDY_SETTINGS = {
  // Feature 1: Survey type assignment
  surveyType: "random", // "chatOnly", "searchOnly", "random"

  // Feature 2: Notes feature toggle
  notesEnabled: true,

  // Feature 3: Minimum interactions required
  minimumInteractions: 4,

  // Feature 4: Consent form toggle
  consentFormEnabled: true,
};

const ManageStudySettings = () => {
  const [settings, setSettings] = useState(DEFAULT_STUDY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "admin", "studySettings");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            surveyType: data.surveyType || DEFAULT_STUDY_SETTINGS.surveyType,
            notesEnabled:
              data.notesEnabled !== undefined
                ? data.notesEnabled
                : DEFAULT_STUDY_SETTINGS.notesEnabled,
            minimumInteractions:
              data.minimumInteractions ||
              DEFAULT_STUDY_SETTINGS.minimumInteractions,
            consentFormEnabled:
              data.consentFormEnabled !== undefined
                ? data.consentFormEnabled
                : DEFAULT_STUDY_SETTINGS.consentFormEnabled,
          });
        } else {
          setSettings(DEFAULT_STUDY_SETTINGS);
        }
      } catch (error) {
        console.error("Error loading study settings:", error);
        setSettings(DEFAULT_STUDY_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to Firestore
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const docRef = doc(db, "admin", "studySettings");
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: authCtx.user?.uid || null,
      });

      setHasChanges(false);
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving study settings:", error);
      setSaveMessage("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefault = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      setSettings(DEFAULT_STUDY_SETTINGS);
      setHasChanges(true);
    }
  };

  // Handle survey type change
  const handleSurveyTypeChange = (value) => {
    setSettings((prev) => ({ ...prev, surveyType: value }));
    setHasChanges(true);
  };

  // Handle notes toggle
  const handleNotesToggle = () => {
    setSettings((prev) => ({ ...prev, notesEnabled: !prev.notesEnabled }));
    setHasChanges(true);
  };

  // Handle consent form toggle
  const handleConsentFormToggle = () => {
    setSettings((prev) => ({
      ...prev,
      consentFormEnabled: !prev.consentFormEnabled,
    }));
    setHasChanges(true);
  };

  // Handle minimum interactions change
  const handleMinInteractionsChange = (value) => {
    const numValue = parseInt(value, 10);
    if (numValue >= 1 && numValue <= 20) {
      setSettings((prev) => ({ ...prev, minimumInteractions: numValue }));
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading study settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Study Settings
              </h1>
              <p className="text-gray-600">
                Configure core study parameters and features
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveMessage.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {saveMessage}
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Feature 1: Survey Type Assignment */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Task Type Assignment
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Choose how participants are assigned to Chat or Search tasks.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="surveyType"
                  value="chatOnly"
                  checked={settings.surveyType === "chatOnly"}
                  onChange={(e) => handleSurveyTypeChange(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Chat Only</div>
                  <div className="text-sm text-gray-600">
                    All participants will use the ChatGPT interface only
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="surveyType"
                  value="searchOnly"
                  checked={settings.surveyType === "searchOnly"}
                  onChange={(e) => handleSurveyTypeChange(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Search Only</div>
                  <div className="text-sm text-gray-600">
                    All participants will use the Search Engine interface only
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="surveyType"
                  value="random"
                  checked={settings.surveyType === "random"}
                  onChange={(e) => handleSurveyTypeChange(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">
                    Random (Both Chat & Search)
                  </div>
                  <div className="text-sm text-gray-600">
                    Participants are randomly assigned to either Chat or Search
                    (50/50 split)
                  </div>
                </div>
              </label>
            </div>

            {/* Current Selection Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-800">
                <strong>Current Setting:</strong>{" "}
                {settings.surveyType === "chatOnly" &&
                  "All participants use Chat"}
                {settings.surveyType === "searchOnly" &&
                  "All participants use Search"}
                {settings.surveyType === "random" &&
                  "Random assignment (Chat or Search)"}
              </span>
            </div>
          </div>

          {/* Feature 2: Consent Form Toggle */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Consent Form
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Enable or disable the consent form that participants must complete
              before starting the study. When disabled, participants will skip
              the consent form and go directly to the study.
            </p>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-800">
                  Enable Consent Form
                </div>
                <div className="text-sm text-gray-600">
                  Show the consent form to participants after login/signup
                </div>
              </div>
              <button
                onClick={handleConsentFormToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.consentFormEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.consentFormEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Status Display */}
            <div
              className={`mt-4 p-3 rounded-lg ${settings.consentFormEnabled ? "bg-green-50" : "bg-yellow-50"}`}
            >
              <span
                className={`text-sm ${settings.consentFormEnabled ? "text-green-800" : "text-yellow-800"}`}
              >
                <strong>Status:</strong>{" "}
                {settings.consentFormEnabled
                  ? "Consent form is ENABLED. Participants must complete consent before proceeding."
                  : "Consent form is DISABLED. Participants will skip consent and go directly to the study."}
              </span>
            </div>
          </div>

          {/* Feature 3: Notes Feature Toggle */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Notes Feature
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Enable or disable the notes panel that appears during tasks. When
              disabled, participants will not see the notes section.
            </p>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-800">
                  Enable Notes Panel
                </div>
                <div className="text-sm text-gray-600">
                  Show the notes taking area on the right side during tasks
                </div>
              </div>
              <button
                onClick={handleNotesToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notesEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notesEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Status Display */}
            <div
              className={`mt-4 p-3 rounded-lg ${settings.notesEnabled ? "bg-green-50" : "bg-yellow-50"}`}
            >
              <span
                className={`text-sm ${settings.notesEnabled ? "text-green-800" : "text-yellow-800"}`}
              >
                <strong>Status:</strong>{" "}
                {settings.notesEnabled
                  ? "Notes panel is ENABLED. Participants can take notes during tasks."
                  : "Notes panel is DISABLED. Participants will not see the notes section."}
              </span>
            </div>
          </div>

          {/* Feature 4: Minimum Interactions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Minimum Interactions Required
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Set the minimum number of interactions (queries/prompts)
              participants must complete before they can submit their task.
            </p>

            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">
                Required Interactions:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.minimumInteractions}
                onChange={(e) => handleMinInteractionsChange(e.target.value)}
                className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500 text-sm">(1 to 20)</span>
            </div>

            {/* Info Display */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                <strong>Current Setting:</strong> Participants must complete at
                least{" "}
                <span className="font-bold text-blue-600">
                  {settings.minimumInteractions}
                </span>{" "}
                interaction{settings.minimumInteractions !== 1 ? "s" : ""}{" "}
                before submitting.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              hasChanges
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageStudySettings;
