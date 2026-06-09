import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";
import { clearSettingsCache } from "../../utils/apiSettings";

const ManageSettings = () => {
  const [settings, setSettings] = useState({
    openaiApiKey: "",
    bingApiKey: "",
    braveSearchApiKey: "",
  });
  const [llmProvider, setLlmProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [huggingFaceApiKey, setHuggingFaceApiKey] = useState("");
  const [huggingFaceModel, setHuggingFaceModel] = useState("");
  const [showKeys, setShowKeys] = useState({
    openaiApiKey: false,
    bingApiKey: false,
    braveSearchApiKey: false,
    geminiApiKey: false,
    claudeApiKey: false,
    huggingFaceApiKey: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      if (!authCtx?.user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
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
          console.log("[ManageSettings] Loaded selectedModel:", data.selectedModel);
          setSettings({
            openaiApiKey: data.openaiApiKey || "",
            bingApiKey: data.bingApiKey || "",
            braveSearchApiKey: data.braveSearchApiKey || "",
          });
          if (data.llmProvider) setLlmProvider(data.llmProvider);
          setSelectedModel(data.selectedModel || "");
          if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
          if (data.claudeApiKey) setClaudeApiKey(data.claudeApiKey);
          if (data.huggingFaceApiKey) setHuggingFaceApiKey(data.huggingFaceApiKey);
          if (data.huggingFaceModel) setHuggingFaceModel(data.huggingFaceModel);
        }
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
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleShowKey = (key) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const userSettingsDoc = doc(
        db,
        "admin",
        "settings",
        "users",
        authCtx.user.uid,
      );
      console.log("[ManageSettings] Saving selectedModel:", selectedModel);
      await setDoc(
        userSettingsDoc,
        {
          openaiApiKey: settings.openaiApiKey.trim(),
          bingApiKey: settings.bingApiKey.trim(),
          braveSearchApiKey: settings.braveSearchApiKey.trim(),
          llmProvider,
          selectedModel,
          geminiApiKey: geminiApiKey.trim(),
          claudeApiKey: claudeApiKey.trim(),
          huggingFaceApiKey: huggingFaceApiKey.trim(),
          huggingFaceModel: huggingFaceModel.trim(),
          updatedAt: serverTimestamp(),
          userEmail: authCtx?.user?.email || null,
        },
        { merge: true },
      );

      // Mirror braveSearchApiKey and llmProvider to global doc for Cloud Function access
      const globalUpdate = { llmProvider };
      if (settings.braveSearchApiKey.trim()) {
        globalUpdate.braveSearchApiKey = settings.braveSearchApiKey.trim();
      }
      const globalSettingsDoc = doc(db, "admin", "settings");
      await setDoc(globalSettingsDoc, globalUpdate, { merge: true });

      clearSettingsCache();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  const modelOptions = {
    openai: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini (default)" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    gemini: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (default)" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-2.0-pro", label: "Gemini 2.0 Pro" },
    ],
    claude: [
      { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5 (default)" },
      { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
      { value: "claude-opus-4-5", label: "Claude Opus 4.5" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    ],
  };

  const providers = [
    { value: "openai", label: "OpenAI", description: "GPT-4o-mini" },
    { value: "gemini", label: "Google Gemini", description: "Gemini 2.0 Flash" },
    { value: "claude", label: "Anthropic Claude", description: "Claude Sonnet 4.5" },
    { value: "huggingface", label: "Hugging Face", description: "Open-source inference" },
  ];

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
            Manage your personal API keys for LLM and Search services.
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

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* LLM Provider */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              LLM Provider
            </label>
            <p className="text-gray-500 text-sm mb-3">
              Choose which AI provider powers the chat interface and AI summary.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {providers.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    llmProvider === p.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="llmProvider"
                    value={p.value}
                    checked={llmProvider === p.value}
                    onChange={() => { setLlmProvider(p.value); setSelectedModel(""); }}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{p.label}</div>
                    <div className="text-gray-500 text-xs">{p.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Conditional key inputs */}
            {llmProvider === "openai" && (
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  OpenAI API Key
                </label>
                <p className="text-gray-400 text-xs mb-2">
                  Get your key from{" "}
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
                <div className="mt-3">
                  <label className="block text-gray-600 text-sm font-medium mb-1">Model</label>
                  <select
                    value={selectedModel || modelOptions.openai[0].value}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {modelOptions.openai.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {llmProvider === "gemini" && (
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  Gemini API Key
                </label>
                <p className="text-gray-400 text-xs mb-2">
                  Get your key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <div className="relative">
                  <input
                    type={showKeys.geminiApiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey("geminiApiKey")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKeys.geminiApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-3">
                  <label className="block text-gray-600 text-sm font-medium mb-1">Model</label>
                  <select
                    value={selectedModel || modelOptions.gemini[0].value}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {modelOptions.gemini.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {llmProvider === "claude" && (
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  Anthropic API Key
                </label>
                <p className="text-gray-400 text-xs mb-2">
                  Get your key from{" "}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Anthropic Console
                  </a>
                </p>
                <div className="relative">
                  <input
                    type={showKeys.claudeApiKey ? "text" : "password"}
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey("claudeApiKey")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKeys.claudeApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-3">
                  <label className="block text-gray-600 text-sm font-medium mb-1">Model</label>
                  <select
                    value={selectedModel || modelOptions.claude[0].value}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {modelOptions.claude.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {llmProvider === "huggingface" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Hugging Face API Key
                  </label>
                  <p className="text-gray-400 text-xs mb-2">
                    Get your key from{" "}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Hugging Face Settings
                    </a>
                  </p>
                  <div className="relative">
                    <input
                      type={showKeys.huggingFaceApiKey ? "text" : "password"}
                      value={huggingFaceApiKey}
                      onChange={(e) => setHuggingFaceApiKey(e.target.value)}
                      placeholder="hf_..."
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("huggingFaceApiKey")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys.huggingFaceApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={huggingFaceModel}
                    onChange={(e) => setHuggingFaceModel(e.target.value)}
                    placeholder="mistralai/Mistral-7B-Instruct-v0.2"
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

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
