import React, { useEffect, useState, useRef, useContext } from "react";
import AuthContext from "../context/auth-context";
import TaskContext from "../context/task-context";
import search_icon from "../assets/common/search_icon.svg";
import { db } from "../firebase-config";
import { uid } from "uid";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { callLLM } from "../utils/llmClient";
import SingleResultContainer from "./SingleResultContainer";
import EditNoteReminder from "../chat/EditNoteReminder";

const AI_SYSTEM_PROMPT =
  "You are a research assistant. Given the user query, provide a concise 3 to 5 sentence summary of what is known about this topic. Be factual and neutral.";

const SearchWithAISummary = ({
  triggerAfterSearchQuery,
  markResponseReceived,
  checkPendingResponseSurvey,
  onSurveyCompleteRef,
}) => {
  const [query, setQuery] = useState("");
  const [queryID, setQueryID] = useState("");
  const [typingStartTime, setTypingStartTime] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [pendingQuery, setPendingQuery] = useState(null);

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);
  const user = authCtx.user;
  const functions = getFunctions();

  const textRef = useRef();

  useEffect(() => {
    const resolveAdminId = async () => {
      if (!authCtx.user?.uid) return;
      try {
        const id = authCtx.isAdmin
          ? authCtx.user.uid
          : await authCtx.getParticipantAdminId(authCtx.user.uid);
        setAdminId(id);
      } catch (error) {
        console.error("Error resolving admin ID:", error);
      }
    };
    resolveAdminId();
  }, [authCtx.user, authCtx.isAdmin, authCtx.getParticipantAdminId]);

  const handleSurveyComplete = () => {
    if (pendingQuery) {
      const queryToExecute = pendingQuery;
      setPendingQuery(null);
      executeSearch(queryToExecute);
    }
  };

  if (onSurveyCompleteRef) {
    onSurveyCompleteRef.current = handleSurveyComplete;
  }

  const handleSearchResultClick = async (clickedObj) => {
    window.open(clickedObj.url, "_blank");

    try {
      const fetchAndStoreWebPage = httpsCallable(functions, "fetchAndStoreWebPage");

      fetchAndStoreWebPage({
        url: clickedObj.url,
        customID: clickedObj.customID,
      })
        .then((result) => {
          console.log(result.data);
        })
        .catch((error) => {
          console.error("Error storing webpage:", error);
        });

      const searchTaskRef = doc(db, "searchTask", user.uid);

      await runTransaction(db, async (transaction) => {
        const searchTaskDoc = await transaction.get(searchTaskRef);
        if (!searchTaskDoc.exists()) {
          console.error("Document does not exist!");
          return;
        }

        const data = searchTaskDoc.data();
        const { queryInteractions } = data;

        const interactionIndex = queryInteractions.findIndex(
          (interaction) => interaction.query === query,
        );
        if (interactionIndex === -1) {
          console.error("Query interaction not found!");
          return;
        }

        const updatedQueryInteractions = [...queryInteractions];
        const interaction = updatedQueryInteractions[interactionIndex];
        const updatedClickedResults = interaction.clickedResults
          ? [...interaction.clickedResults, clickedObj]
          : [clickedObj];
        updatedQueryInteractions[interactionIndex] = {
          ...interaction,
          clickedResults: updatedClickedResults,
        };

        transaction.update(searchTaskRef, {
          queryInteractions: updatedQueryInteractions,
        });
      });
    } catch (error) {
      console.error("Error recording click:", error);
    }
  };

  const storeSearchResults = async (searchQuery, results, qID, aiSummaryText) => {
    const searchDocRef = doc(db, "searchTask", user.uid);

    const simplifiedSearchResults = results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      customID: result.customID,
    }));

    const existingDoc = await getDoc(searchDocRef);

    const entry = {
      ts: Timestamp.now(),
      query: searchQuery,
      queryID: qID,
      searchResults: simplifiedSearchResults,
      clickedResults: [],
      aiSummary: aiSummaryText,
    };

    if (existingDoc.exists()) {
      await updateDoc(searchDocRef, {
        queryInteractions: arrayUnion(entry),
      });
    } else {
      await setDoc(searchDocRef, {
        queryInteractions: [entry],
        userID: user.uid,
      });
    }
  };

  const handleTextareaChange = (event) => {
    setQuery(event.target.value);
    if (textRef.current) {
      textRef.current.style.height = "7px";
      textRef.current.style.height = `${textRef.current.scrollHeight}px`;
      if (!typingStartTime) {
        setTypingStartTime(new Date());
      }
    }
  };

  const executeSearch = async (searchQuery) => {
    setIsLoading(true);
    setIsAiLoading(true);
    setAiSummary(null);
    setTypingStartTime(null);
    taskCtx.setQueryCount();
    const qID = uid();
    setQueryID(qID);

    // Fire both in parallel; AI box stays visible (isAiLoading=true) even after
    // search results arrive, so the box never disappears when results appear.
    const braveSearchFn = httpsCallable(functions, "braveSearch");

    const aiCallPromise = adminId
      ? callLLM({
          adminId,
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: searchQuery },
          ],
          maxTokens: 300,
        })
      : Promise.reject(new Error("Admin ID not resolved"));

    // Show search results as soon as they arrive — don't wait for AI.
    let localSearchResults = [];
    try {
      const result = await braveSearchFn({ query: searchQuery });
      const data = result.data;

      if (!data.web || !data.web.results) {
        throw new Error("No web results found in Brave Search response");
      }

      localSearchResults = data.web.results.map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.description,
        displayUrl: result.url,
        name: result.title,
        customID: uid(),
        favicon: result.meta_url?.favicon,
      }));

      setSearchResults(localSearchResults);
      setIsLoading(false);
      taskCtx.setShowEditNoteReminder(true);
    } catch (error) {
      console.error("Brave Search failed:", error);
      alert("Search failed. Please try again.");
      setIsLoading(false);
      setIsAiLoading(false);
      return;
    }

    // Resolve AI summary independently — box stays visible (spinner) until here.
    let aiSummaryText = null;
    try {
      aiSummaryText = await aiCallPromise;
    } catch (error) {
      console.error("AI Summary failed:", error);
    }
    setAiSummary(aiSummaryText || "No summary available for this query.");
    setIsAiLoading(false);

    await storeSearchResults(searchQuery, localSearchResults, qID, aiSummaryText);

    if (markResponseReceived) {
      markResponseReceived();
    }
  };

  const search = async () => {
    if (!query) return;

    if (taskCtx.showEditNoteReminder) {
      taskCtx.setShowPopUp(true);
      return;
    }

    if (checkPendingResponseSurvey && checkPendingResponseSurvey()) {
      setPendingQuery(query);
      return;
    }

    await executeSearch(query);
  };

  return (
    <div className="p-4 w-full bg-white overflow-y-auto">
      {/* Search bar */}
      <div className="flex flex-row space-x-6">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 px-8 py-3 min-h-11 flex flex-grow items-center">
          <textarea
            className="bg-transparent focus:outline-none h-7 text-black resize-none w-full"
            ref={textRef}
            value={query}
            placeholder="Search the web..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search();
              }
            }}
            onChange={handleTextareaChange}
          ></textarea>
          <button onClick={search} title="Search" disabled={isLoading}>
            <img className="h-5 w-5" src={search_icon} alt="Search" />
          </button>
        </div>
      </div>

      {/* AI Summary — shown above results, hidden if call failed */}
      {(isAiLoading || aiSummary) && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm mb-2">AI Summary</p>
          {isAiLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-600 text-sm">Generating summary...</span>
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{aiSummary}</p>
          )}
        </div>
      )}

      {/* Search results */}
      <div className="flex flex-col space-y-2 mt-4 overflow-y-auto">
        {isLoading ? (
          <p className="text-black text-center">Searching...</p>
        ) : (
          searchResults.map((page, index) => (
            <SingleResultContainer
              key={index}
              displayUrl={page.displayUrl}
              name={page.name}
              snippet={page.snippet}
              favicon={page.favicon}
              onClick={() =>
                handleSearchResultClick({
                  url: page.displayUrl,
                  customID: page.customID,
                  ts: Timestamp.now(),
                  rank: index + 1,
                })
              }
            />
          ))
        )}
      </div>

      {taskCtx.showPopUp && (
        <div className="fixed top-0 z-10 left-0 w-screen h-screen flex items-center justify-center">
          <EditNoteReminder />
        </div>
      )}
    </div>
  );
};

export default SearchWithAISummary;
