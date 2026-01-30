import React, { useEffect, useState, useRef, useContext } from "react";
import AuthContext from "../context/auth-context";
import TaskContext from "../context/task-context";
import send_message_icon from "../assets/msg_entry/send_message_icon.svg";
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
import SingleResultContainer from "./SingleResultContainer";
import EditNoteReminder from "../chat/EditNoteReminder";

const SearchPage = ({
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
  const [pendingQuery, setPendingQuery] = useState(null); // Store query while survey is showing

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);
  const user = authCtx.user;
  const functions = getFunctions();

  const textRef = useRef();

  // Handle survey completion - execute pending search
  const handleSurveyComplete = () => {
    if (pendingQuery) {
      const queryToExecute = pendingQuery;
      setPendingQuery(null);
      executeSearch(queryToExecute);
    }
  };

  // Expose the handler to parent via ref
  if (onSurveyCompleteRef) {
    onSurveyCompleteRef.current = handleSurveyComplete;
  }

  const handleSearchResultClick = async (clickedObj) => {
    // IMPORTANT: Open the URL first, before any async operations
    window.open(clickedObj.url, "_blank");

    try {
      const fetchAndStoreWebPage = httpsCallable(
        functions,
        "fetchAndStoreWebPage",
      );

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

  const storeSearchResults = async (query, results, queryID) => {
    const searchDocRef = doc(db, "searchTask", user.uid);

    const simplifiedSearchResults = results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      customID: result.customID,
    }));

    const existingDoc = await getDoc(searchDocRef);

    if (existingDoc.exists()) {
      await updateDoc(searchDocRef, {
        queryInteractions: arrayUnion({
          ts: Timestamp.now(),
          query: query,
          queryID: queryID,
          searchResults: simplifiedSearchResults,
          clickedResults: [],
        }),
      });
    } else {
      await setDoc(searchDocRef, {
        queryInteractions: [
          {
            ts: Timestamp.now(),
            query: query,
            queryID: queryID,
            searchResults: simplifiedSearchResults,
            clickedResults: [],
          },
        ],
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

  // Actually execute the search
  const executeSearch = async (searchQuery) => {
    setIsLoading(true);
    setTypingStartTime(null);
    taskCtx.setQueryCount();
    const qID = uid();
    setQueryID(qID);

    try {
      const braveSearch = httpsCallable(functions, "braveSearch");
      const result = await braveSearch({ query: searchQuery });
      const data = result.data;

      console.log("Brave Search Results:", data);

      if (!data.web || !data.web.results) {
        throw new Error("No web results found in Brave Search response");
      }

      const localSearchResults = data.web.results.map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.description,
        displayUrl: result.url,
        name: result.title,
        customID: uid(),
        favicon: result.meta_url?.favicon,
      }));

      console.log("First favicon URL:", localSearchResults[0]?.favicon);

      setSearchResults(localSearchResults);
      taskCtx.setShowEditNoteReminder(true);
      await storeSearchResults(searchQuery, localSearchResults, qID);

      // Mark response received - survey will show before next search query
      if (markResponseReceived) {
        markResponseReceived();
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const search = async () => {
    if (!query) return;

    // Check if notes need to be edited first
    if (taskCtx.showEditNoteReminder) {
      taskCtx.setShowPopUp(true);
      return;
    }

    // Check for pending "afterResponseReceive" survey before executing search
    if (checkPendingResponseSurvey && checkPendingResponseSurvey()) {
      // Survey is now showing, store the query to execute after survey completes
      setPendingQuery(query);
      return;
    }

    // No pending survey, execute search immediately
    await executeSearch(query);
  };

  return (
    <div className="p-4 w-full bg-white overflow-y-auto ">
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
                  rank: index + 1, // Track the ranking position (1-based)
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

export default SearchPage;
