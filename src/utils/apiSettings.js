import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

let settingsCache = null;
let cacheTimestamp = null;
let cachedUserId = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getApiSettings = async (userId = null) => {
  if (
    settingsCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION &&
    cachedUserId === userId
  ) {
    return settingsCache;
  }

  try {
    let settings = null;

    if (userId) {
      const userSettingsDoc = doc(db, "admin", "settings", "users", userId);
      const userDocSnap = await getDoc(userSettingsDoc);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (
          data.openaiApiKey ||
          data.bingApiKey ||
          data.braveSearchApiKey ||
          data.llmProvider ||
          data.geminiApiKey ||
          data.claudeApiKey ||
          data.huggingFaceApiKey
        ) {
          settings = {
            openaiApiKey: data.openaiApiKey || "",
            bingApiKey: data.bingApiKey || "",
            braveSearchApiKey: data.braveSearchApiKey || "",
            llmProvider: data.llmProvider || "openai",
            geminiApiKey: data.geminiApiKey || "",
            claudeApiKey: data.claudeApiKey || "",
            huggingFaceApiKey: data.huggingFaceApiKey || "",
            huggingFaceModel: data.huggingFaceModel || "",
          };
        }
      }
    }

    if (!settings) {
      const globalSettingsDoc = doc(db, "admin", "settings");
      const globalDocSnap = await getDoc(globalSettingsDoc);

      if (globalDocSnap.exists()) {
        const data = globalDocSnap.data();
        settings = {
          openaiApiKey: data.openaiApiKey || process.env.REACT_APP_OPENAI_API_KEY || "",
          bingApiKey: data.bingApiKey || process.env.REACT_APP_BING_API_KEY || "",
          braveSearchApiKey:
            data.braveSearchApiKey || process.env.REACT_APP_BRAVE_SEARCH_API_KEY || "",
          llmProvider: data.llmProvider || "openai",
          geminiApiKey: data.geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY || "",
          claudeApiKey: data.claudeApiKey || process.env.REACT_APP_CLAUDE_API_KEY || "",
          huggingFaceApiKey:
            data.huggingFaceApiKey || process.env.REACT_APP_HUGGINGFACE_API_KEY || "",
          huggingFaceModel:
            data.huggingFaceModel || process.env.REACT_APP_HUGGINGFACE_MODEL || "",
        };
      }
    }

    if (!settings) {
      settings = {
        openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
        bingApiKey: process.env.REACT_APP_BING_API_KEY || "",
        braveSearchApiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY || "",
        llmProvider: "openai",
        geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || "",
        claudeApiKey: process.env.REACT_APP_CLAUDE_API_KEY || "",
        huggingFaceApiKey: process.env.REACT_APP_HUGGINGFACE_API_KEY || "",
        huggingFaceModel: process.env.REACT_APP_HUGGINGFACE_MODEL || "",
      };
    }

    settingsCache = settings;
    cacheTimestamp = Date.now();
    cachedUserId = userId;
    return settingsCache;
  } catch (error) {
    console.error("Error fetching API settings:", error);
    return {
      openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
      bingApiKey: process.env.REACT_APP_BING_API_KEY || "",
      braveSearchApiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY || "",
      llmProvider: "openai",
      geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || "",
      claudeApiKey: process.env.REACT_APP_CLAUDE_API_KEY || "",
      huggingFaceApiKey: process.env.REACT_APP_HUGGINGFACE_API_KEY || "",
      huggingFaceModel: process.env.REACT_APP_HUGGINGFACE_MODEL || "",
    };
  }
};

export const getOpenAIApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.openaiApiKey;
};

export const getBingApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.bingApiKey;
};

export const getBraveSearchApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.braveSearchApiKey;
};

export const getLlmProvider = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.llmProvider || "openai";
};

export const getGeminiApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.geminiApiKey;
};

export const getClaudeApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.claudeApiKey;
};

export const getHuggingFaceApiKey = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.huggingFaceApiKey;
};

export const getHuggingFaceModel = async (userId = null) => {
  const settings = await getApiSettings(userId);
  return settings.huggingFaceModel || "mistralai/Mistral-7B-Instruct-v0.2";
};

export const clearSettingsCache = () => {
  settingsCache = null;
  cacheTimestamp = null;
  cachedUserId = null;
};
