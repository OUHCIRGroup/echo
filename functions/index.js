const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.braveSearch = onCall({ cors: true }, async (request) => {
  const query = request.data.query;
  if (!query) {
    throw new HttpsError("invalid-argument", "Query is required");
  }

  const db = getFirestore();
  const settingsSnap = await db.doc("admin/settings").get();
  const apiKey = (settingsSnap.exists && settingsSnap.data().braveSearchApiKey)
    ? settingsSnap.data().braveSearchApiKey
    : process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Brave Search API key not configured");
  }

  const params = new URLSearchParams({
    q: query,
    count: "20",
    country: "US",
    search_lang: "en",
    ui_lang: "en-US",
    safesearch: "moderate",
  });

  const endpoint = "https://api.search.brave.com/res/v1/web/search";

  try {
    const response = await fetch(`${endpoint}?${params}`, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!response.ok) {
      throw new HttpsError("internal", `Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new HttpsError("internal", "Search request failed: " + error.message);
  }
});

exports.fetchAndStoreWebPage = onCall({ cors: true }, async (request) => {
  const { url, customID } = request.data;
  if (!url || !customID) {
    throw new HttpsError("invalid-argument", "URL and customID are required");
  }

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    const { getStorage } = require("firebase-admin/storage");
    const bucket = getStorage().bucket();
    const file = bucket.file(`${userId}/${customID}.html`);
    await file.save(html, { contentType: "text/html" });

    return { success: true };
  } catch (error) {
    throw new HttpsError("internal", "Failed to fetch and store page: " + error.message);
  }
});
