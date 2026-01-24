import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

const ManageSettings = () => {
  const [settings, setSettings] = useState({
    openaiApiKey: "",
    bingApiKey: "",
    braveSearchApiKey: "",
  });
  const [showKeys, setShowKeys] = useState({
    openaiApiKey: false,
    bingApiKey: false,
    braveSearchApiKey: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  // Load existing settings for current user on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!authCtx?.user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        // Load user-specific settings from admin/settings/users/{uid}
        const userSettingsDoc = doc(
          db,
          "admin",
          "settings",
          "users",
          authCtx.user.uid,
        );
        const docSnap = await getDoc(userSettingsDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            openaiApiKey: data.openaiApiKey || "",
            bingApiKey: data.bingApiKey || "",
            braveSearchApiKey: data.braveSearchApiKey || "",
          });
        }
        // If no user-specific settings, fields remain empty for user to fill in
      } catch (error) {
        console.error("Error loading settings:", error);
        setStatus({ type: "error", message: "Failed to load settings" });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [authCtx?.user?.uid]);

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShowKey = (key) => {
    setShowKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!authCtx?.user?.uid) {
      setStatus({
        type: "error",
        message: "You must be logged in to save settings",
      });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      // Save to user-specific location: admin/settings/users/{uid}
      const userSettingsDoc = doc(
        db,
        "admin",
        "settings",
        "users",
        authCtx.user.uid,
      );
      await setDoc(
        userSettingsDoc,
        {
          openaiApiKey: settings.openaiApiKey.trim(),
          bingApiKey: settings.bingApiKey.trim(),
          braveSearchApiKey: settings.braveSearchApiKey.trim(),
          updatedAt: serverTimestamp(),
          userEmail: authCtx?.user?.email || null,
        },
        { merge: true },
      );

      setStatus({ type: "success", message: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setStatus({
        type: "error",
        message: "Failed to save settings: " + error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestOpenAI = async () => {
    if (!settings.openaiApiKey) {
      setStatus({
        type: "error",
        message: "Please enter an OpenAI API key first",
      });
      return;
    }

    setStatus({ type: "info", message: "Testing OpenAI API key..." });

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${settings.openaiApiKey}`,
        },
      });

      if (response.ok) {
        setStatus({ type: "success", message: "OpenAI API key is valid!" });
      } else {
        const error = await response.json();
        setStatus({
          type: "error",
          message: `OpenAI API error: ${error.error?.message || "Invalid key"}`,
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to test OpenAI API: " + error.message,
      });
    }
  };

  // const handleTestBrave = async () => {
  //   if (!settings.braveSearchApiKey) {
  //     setStatus({
  //       type: "error",
  //       message: "Please enter a Brave Search API key first",
  //     });
  //     return;
  //   }

  //   setStatus({ type: "info", message: "Testing Brave Search API key..." });

  //   try {
  //     const response = await fetch(
  //       `https://api.search.brave.com/res/v1/web/search?q=test&count=1`,
  //       {
  //         headers: {
  //           Accept: "application/json",
  //           "X-Subscription-Token": settings.braveSearchApiKey,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       setStatus({
  //         type: "success",
  //         message: "Brave Search API key is valid!",
  //       });
  //     } else {
  //       setStatus({
  //         type: "error",
  //         message: "Brave Search API key is invalid",
  //       });
  //     }
  //   } catch (error) {
  //     setStatus({
  //       type: "error",
  //       message: "Failed to test Brave API: " + error.message,
  //     });
  //   }
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading settings...</div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            API Settings
          </h1>
          <p className="text-gray-600">
            Manage your personal API keys for OpenAI and Brave Search services.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-800">
                Security Notice: API keys are sensitive credentials.
              </h3>
              <p className="text-yellow-700 text-sm mt-1">
                They are stored securely in Firebase but will be accessible to
                client code.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* OpenAI API Key */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              OpenAI API Key
            </label>
            <p className="text-gray-500 text-sm mb-2">
              Used for ChatGPT task. Get your key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys.openaiApiKey ? "text" : "password"}
                  value={settings.openaiApiKey}
                  onChange={(e) =>
                    handleInputChange("openaiApiKey", e.target.value)
                  }
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("openaiApiKey")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.openaiApiKey ? "Hide" : "Show"}
                </button>
              </div>
              <button
                onClick={handleTestOpenAI}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Test
              </button>
            </div>
          </div>

          {/* Bing API Key */}
          {/* <div>
            <label className="block text-gray-700 font-medium mb-2">
              Bing Search API Key
            </label>
            <p className="text-gray-500 text-sm mb-2">
              Used for Bing search task. Get your key from{" "}
              <a
                href="https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Microsoft Azure
              </a>
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys.bingApiKey ? "text" : "password"}
                  value={settings.bingApiKey}
                  onChange={(e) =>
                    handleInputChange("bingApiKey", e.target.value)
                  }
                  placeholder="Enter Bing API key..."
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("bingApiKey")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.bingApiKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div> */}

          {/* Brave Search API Key */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Brave Search API Key
            </label>
            <p className="text-gray-500 text-sm mb-2">
              Used for Brave search task. Get your key from{" "}
              <a
                href="https://brave.com/search/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Brave Search API
              </a>
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys.braveSearchApiKey ? "text" : "password"}
                  value={settings.braveSearchApiKey}
                  onChange={(e) =>
                    handleInputChange("braveSearchApiKey", e.target.value)
                  }
                  placeholder="BSA..."
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("braveSearchApiKey")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.braveSearchApiKey ? "Hide" : "Show"}
                </button>
              </div>
              {/* <button
                onClick={handleTestBrave}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Test
              </button> */}
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`p-4 rounded-lg ${
                status.type === "success"
                  ? "bg-green-100 text-green-800"
                  : status.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSettings;
