import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

let settingsCache = null;
let cacheTimestamp = null;
let cachedUserId = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getApiSettings = async (userId = null) => {
  // Return cached settings if still valid and for same user
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

    // If userId provided, try to get user-specific settings first
    if (userId) {
      const userSettingsDoc = doc(db, "admin", "settings", "users", userId);
      const userDocSnap = await getDoc(userSettingsDoc);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.openaiApiKey || data.bingApiKey || data.braveSearchApiKey) {
          settings = {
            openaiApiKey: data.openaiApiKey || "",
            bingApiKey: data.bingApiKey || "",
            braveSearchApiKey: data.braveSearchApiKey || "",
          };
        }
      }
    }

    // Fallback to global settings if no user-specific settings
    if (!settings) {
      const globalSettingsDoc = doc(db, "admin", "settings");
      const globalDocSnap = await getDoc(globalSettingsDoc);

      if (globalDocSnap.exists()) {
        const data = globalDocSnap.data();
        settings = {
          openaiApiKey:
            data.openaiApiKey || process.env.REACT_APP_OPENAI_API_KEY || "",
          bingApiKey:
            data.bingApiKey || process.env.REACT_APP_BING_API_KEY || "",
          braveSearchApiKey:
            data.braveSearchApiKey ||
            process.env.REACT_APP_BRAVE_SEARCH_API_KEY ||
            "",
        };
      }
    }

    // Final fallback to environment variables
    if (!settings) {
      settings = {
        openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
        bingApiKey: process.env.REACT_APP_BING_API_KEY || "",
        braveSearchApiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY || "",
      };
    }

    settingsCache = settings;
    cacheTimestamp = Date.now();
    cachedUserId = userId;
    return settingsCache;
  } catch (error) {
    console.error("Error fetching API settings:", error);
    // Fallback to environment variables on error
    return {
      openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
      bingApiKey: process.env.REACT_APP_BING_API_KEY || "",
      braveSearchApiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY || "",
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

export const clearSettingsCache = () => {
  settingsCache = null;
  cacheTimestamp = null;
  cachedUserId = null;
};
