import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import AuthContext from "../../context/auth-context";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

const ViewResponses = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("background");
  const [exportStatus, setExportStatus] = useState(null);

  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch ALL participants from the users collection
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);

        // Fetch ALL documents from users collection
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        const participantsList = [];

        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();

          // Skip if this is an admin user (check by looking for admin-specific fields or by checking admin collection)
          // For now, include all users - you can add filtering logic if needed

          participantsList.push({
            uid: docSnapshot.id,
            email: data.email || "No email",
            displayName: data.displayName || "",
            mturkId: data.mturkId || "N/A",
            createdAt:
              data.creationTs?.toDate?.() || data.createdAt?.toDate?.() || null,
            tasks: data.tasks || {},
            demographyCompleted: data.demographyCompleted || false,
            task1Completed: data.task1Completed || false,
            isEndOfStudySurveyCompleted:
              data.isEndOfStudySurveyCompleted || false,
            // Store raw data for debugging
            rawData: data,
          });
        });

        // Sort by creation date (newest first)
        participantsList.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt - a.createdAt;
        });

        console.log("Fetched participants:", participantsList);
        setParticipants(participantsList);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Fetch detailed data for selected participant
  const fetchParticipantDetails = async (participant) => {
    setIsLoadingDetails(true);
    setSelectedParticipant(participant);

    try {
      const data = {
        background: null,
        experienceSurvey: [],
        questionnaireResponses: [],
        chatTasks: null,
        searchTasks: null,
        promptRatings: [],
        searchRatings: [],
      };

      // 1. Background responses (stored in users/{uid})
      const userDoc = await getDoc(doc(db, "users", participant.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        data.background = userData.backgroundResponses || null;

        // Also check for consent data
        if (userData.archiveConsent || userData.futureContactConsent) {
          data.consentData = {
            archiveConsent: userData.archiveConsent,
            futureContactConsent: userData.futureContactConsent,
          };
        }
      }

      // 2. Experience Survey responses
      const expQuery = query(
        collection(db, "experienceSurvey"),
        where("userId", "==", participant.uid),
      );
      const expSnapshot = await getDocs(expQuery);
      expSnapshot.forEach((docSnap) => {
        data.experienceSurvey.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 3. Questionnaire responses (pre-task and post-task)
      const questQuery = query(
        collection(db, "questionnaireResponses"),
        where("userID", "==", participant.uid),
      );
      const questSnapshot = await getDocs(questQuery);
      questSnapshot.forEach((docSnap) => {
        data.questionnaireResponses.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 4. Chat tasks - document ID is the user's UID
      const chatDoc = await getDoc(doc(db, "chatTasks", participant.uid));
      if (chatDoc.exists()) {
        data.chatTasks = chatDoc.data();
      }

      // 5. Search tasks - document ID is the user's UID
      const searchDoc = await getDoc(doc(db, "searchTask", participant.uid));
      if (searchDoc.exists()) {
        data.searchTasks = searchDoc.data();
      }

      // 6. Prompt ratings
      const promptQuery = query(
        collection(db, "promptRatings"),
        where("userID", "==", participant.uid),
      );
      const promptSnapshot = await getDocs(promptQuery);
      promptSnapshot.forEach((docSnap) => {
        data.promptRatings.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 7. Search ratings
      const searchRatingQuery = query(
        collection(db, "searchRating"),
        where("userID", "==", participant.uid),
      );
      const searchRatingSnapshot = await getDocs(searchRatingQuery);
      searchRatingSnapshot.forEach((docSnap) => {
        data.searchRatings.push({ id: docSnap.id, ...docSnap.data() });
      });

      console.log("Fetched participant data:", data);
      setParticipantData(data);
    } catch (error) {
      console.error("Error fetching participant details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    if (ts.toDate) {
      return ts.toDate().toLocaleString();
    }
    if (ts instanceof Date) {
      return ts.toLocaleString();
    }
    return String(ts);
  };

  // Render Questionnaire Responses (nicely formatted)
  const renderQuestionnaireResponses = () => {
    if (
      !participantData?.questionnaireResponses ||
      participantData.questionnaireResponses.length === 0
    ) {
      return (
        <div className="text-gray-500 italic">
          No questionnaire responses available.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {participantData.questionnaireResponses.map((response, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <div>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    response.isPostTask
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {response.isPostTask ? "Post-Task" : "Pre-Task"} Questionnaire
                </span>
                <span className="ml-2 text-gray-600 text-sm">
                  Task:{" "}
                  {response.currentTask === "chat"
                    ? "ChatGPT"
                    : response.currentTask === "search"
                      ? "Search Engine"
                      : response.currentTask || "N/A"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {response.completedTs &&
                  `Completed: ${formatTimestamp(response.completedTs)}`}
              </div>
            </div>

            {/* Ratings */}
            {response.ratings && Object.keys(response.ratings).length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">
                  Intention Ratings:
                </h4>
                <div className="grid gap-2">
                  {Object.entries(response.ratings).map(
                    ([intentionId, rating], rIdx) => (
                      <div key={rIdx} className="bg-white p-3 rounded border">
                        <div className="text-sm text-gray-600 mb-1">
                          Intention:{" "}
                          <span className="font-medium">{intentionId}</span>
                        </div>
                        {rating.expectationRating && (
                          <div className="text-sm">
                            <span className="text-gray-500">Expectation:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {rating.expectationRating}
                            </span>
                          </div>
                        )}
                        {rating.usageFrequencyRating && (
                          <div className="text-sm">
                            <span className="text-gray-500">
                              Usage Frequency:
                            </span>{" "}
                            <span className="font-medium text-gray-800">
                              {rating.usageFrequencyRating}
                            </span>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">
                No ratings recorded
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Experience Survey (nicely formatted)
  const renderExperienceSurvey = () => {
    if (
      !participantData?.experienceSurvey ||
      participantData.experienceSurvey.length === 0
    ) {
      return (
        <div className="text-gray-500 italic">
          No experience survey responses available.
        </div>
      );
    }

    // Fields to exclude from display
    const excludeFields = [
      "id",
      "userId",
      "task",
      "ts",
      "timestamp",
      "startedTs",
      "completedTs",
    ];

    return (
      <div className="space-y-6">
        {participantData.experienceSurvey.map((survey, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  survey.task === "chat"
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {survey.task === "chat" ? "ChatGPT" : "Search Engine"}{" "}
                Experience
              </span>
              <div className="text-xs text-gray-500">
                {survey.ts && `Submitted: ${formatTimestamp(survey.ts)}`}
              </div>
            </div>

            {/* Responses */}
            <div className="space-y-3">
              {Object.entries(survey)
                .filter(([key]) => !excludeFields.includes(key))
                .map(([key, value], rIdx) => (
                  <div key={rIdx} className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </div>
                    <div className="text-gray-800">
                      {typeof value === "string" && value.length > 100 ? (
                        <p className="text-sm whitespace-pre-wrap">{value}</p>
                      ) : (
                        <span className="font-medium">{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Search Interactions (showing queries and clicked results)
  const renderSearchInteractions = () => {
    if (!participantData?.searchTasks) {
      return (
        <div className="text-gray-500 italic">
          No search interactions available.
        </div>
      );
    }

    const searchData = participantData.searchTasks;
    const queryInteractions = searchData.queryInteractions || [];

    if (queryInteractions.length === 0) {
      return (
        <div className="text-gray-500 italic">No search queries recorded.</div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Total Queries:{" "}
          <span className="font-medium">{queryInteractions.length}</span>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {queryInteractions.map((interaction, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
              {/* Query */}
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Search Query</div>
                  <div className="font-medium text-gray-800">
                    {interaction.query}
                  </div>
                  {interaction.ts && (
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(interaction.ts)}
                    </div>
                  )}
                </div>
              </div>

              {/* Results Count */}
              {interaction.searchResults && (
                <div className="text-sm text-gray-600 mb-2">
                  Results returned: {interaction.searchResults.length}
                </div>
              )}

              {/* Clicked Results */}
              {interaction.clickedResults &&
                interaction.clickedResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Clicked Results ({interaction.clickedResults.length}):
                    </div>
                    <div className="space-y-2">
                      {interaction.clickedResults.map((clicked, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white p-2 rounded border text-sm"
                        >
                          <a
                            href={clicked.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {clicked.url}
                          </a>
                          {clicked.ts && (
                            <div className="text-xs text-gray-400 mt-1">
                              Clicked: {formatTimestamp(clicked.ts)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Ratings (only show if data exists)
  const renderRatings = () => {
    const hasPromptRatings =
      participantData?.promptRatings &&
      participantData.promptRatings.length > 0;
    const hasSearchRatings =
      participantData?.searchRatings &&
      participantData.searchRatings.length > 0;

    if (!hasPromptRatings && !hasSearchRatings) {
      return <div className="text-gray-500 italic">No ratings available.</div>;
    }

    // Helper function to find search query text by queryID
    const getSearchQueryText = (queryID) => {
      if (!participantData?.searchTasks?.queryInteractions) return null;
      const interaction = participantData.searchTasks.queryInteractions.find(
        (q) => q.queryID === queryID,
      );
      return interaction?.query || null;
    };

    // Helper function to find user's chat prompt text by promptID
    const getChatPromptText = (promptID) => {
      if (!participantData?.chatTasks?.prompts) return null;
      // Find the prompt with matching ID
      const promptIndex = participantData.chatTasks.prompts.findIndex(
        (p) => p.id === promptID,
      );
      if (promptIndex === -1) return null;

      // Find the preceding user message (the one before the assistant response that was rated)
      // Usually the rated prompt is an assistant response, so we look for the user message before it
      for (let i = promptIndex - 1; i >= 0; i--) {
        if (participantData.chatTasks.prompts[i].role === "user") {
          return participantData.chatTasks.prompts[i].prompt;
        }
      }

      // If not found, try to return the prompt itself if it's a user message
      const prompt = participantData.chatTasks.prompts[promptIndex];
      if (prompt.role === "user") {
        return prompt.prompt;
      }

      return null;
    };

    // Helper function to get rating badge color
    const getRatingBadgeStyle = (rating) => {
      if (!rating) return "bg-gray-100 text-gray-800";
      const ratingLower = rating.toLowerCase();
      if (ratingLower.includes("exceeds")) {
        return "bg-green-100 text-green-800";
      } else if (ratingLower.includes("meets")) {
        return "bg-yellow-100 text-yellow-800";
      } else if (ratingLower.includes("does not")) {
        return "bg-red-100 text-red-800";
      }
      return "bg-gray-100 text-gray-800";
    };

    return (
      <div className="space-y-6">
        {/* Prompt Ratings (Chat) */}
        {hasPromptRatings && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">
              Chat Response Ratings ({participantData.promptRatings.length})
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {participantData.promptRatings.map((rating, idx) => {
                const chatText = getChatPromptText(rating.promptID);
                return (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border">
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">User Query:</span>
                      <p className="font-medium text-gray-800 mt-1">
                        {chatText ? (
                          chatText.length > 150 ? (
                            chatText.substring(0, 150) + "..."
                          ) : (
                            chatText
                          )
                        ) : (
                          <span className="italic text-gray-400">
                            Query not found
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${getRatingBadgeStyle(rating.rating)}`}
                      >
                        {rating.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Ratings */}
        {hasSearchRatings && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">
              Search Results Ratings ({participantData.searchRatings.length})
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {participantData.searchRatings.map((rating, idx) => {
                const queryText = getSearchQueryText(rating.queryID);
                return (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border">
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">
                        Search Query:
                      </span>
                      <p className="font-medium text-gray-800 mt-1">
                        {queryText || (
                          <span className="italic text-gray-400">
                            Query not found
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${getRatingBadgeStyle(rating.rating)}`}
                      >
                        {rating.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to flatten nested objects for CSV export
  const flattenObject = (obj, prefix = "") => {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !(obj[key] instanceof Date) &&
          !obj[key].toDate
        ) {
          Object.assign(result, flattenObject(obj[key], newKey));
        } else if (Array.isArray(obj[key])) {
          result[newKey] = obj[key].join("; ");
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  };

  // Generate CSV content from array of objects
  const generateCSVContent = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return "";
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  // Export all data to CSV (as ZIP file)
  const exportAllToCSV = async () => {
    setExportStatus("Exporting...");

    try {
      const allData = {
        participants: [],
        backgroundResponses: [],
        experienceSurveys: [],
        questionnaireResponses: [],
        chatInteractions: [],
        searchInteractions: [],
        promptRatings: [],
        searchRatings: [],
      };

      // Fetch all data for all participants
      for (const participant of participants) {
        // Add participant info
        allData.participants.push({
          participantId: participant.uid,
          email: participant.email,
          mturkId: participant.mturkId,
          taskType: participant.tasks?.firstTask || "N/A",
          taskTopic: participant.tasks?.firstTaskTopic || "N/A",
          demographyCompleted: participant.demographyCompleted,
          task1Completed: participant.task1Completed,
          studyCompleted: participant.isEndOfStudySurveyCompleted,
          createdAt: participant.createdAt?.toISOString?.() || "N/A",
        });

        // Background responses
        const userDoc = await getDoc(doc(db, "users", participant.uid));
        if (userDoc.exists() && userDoc.data().backgroundResponses) {
          const bg = userDoc.data().backgroundResponses;
          allData.backgroundResponses.push({
            participantId: participant.uid,
            ...flattenObject(bg),
          });
        }

        // Experience surveys
        const expQuery = query(
          collection(db, "experienceSurvey"),
          where("userId", "==", participant.uid),
        );
        const expSnapshot = await getDocs(expQuery);
        expSnapshot.forEach((docSnap) => {
          const expData = docSnap.data();
          allData.experienceSurveys.push({
            participantId: participant.uid,
            task: expData.task || "N/A",
            ...flattenObject(expData),
          });
        });

        // Questionnaire responses
        const questQuery = query(
          collection(db, "questionnaireResponses"),
          where("userID", "==", participant.uid),
        );
        const questSnapshot = await getDocs(questQuery);
        questSnapshot.forEach((docSnap) => {
          const questData = docSnap.data();
          const flatRatings = {};
          if (questData.ratings) {
            Object.entries(questData.ratings).forEach(([key, value]) => {
              flatRatings[`rating_${key}_expectation`] =
                value.expectationRating || "";
              flatRatings[`rating_${key}_frequency`] =
                value.usageFrequencyRating || "";
            });
          }
          allData.questionnaireResponses.push({
            participantId: participant.uid,
            isPostTask: questData.isPostTask,
            currentTask: questData.currentTask,
            ...flatRatings,
          });
        });

        // Chat interactions
        const chatDoc = await getDoc(doc(db, "chatTasks", participant.uid));
        if (chatDoc.exists() && chatDoc.data().prompts) {
          chatDoc.data().prompts.forEach((prompt, idx) => {
            allData.chatInteractions.push({
              participantId: participant.uid,
              messageIndex: idx,
              role: prompt.role,
              content: prompt.prompt?.substring(0, 500) || "",
              timestamp:
                prompt.typingEndTime?.toDate?.()?.toISOString() || "N/A",
            });
          });
        }

        // Search interactions
        const searchDoc = await getDoc(doc(db, "searchTask", participant.uid));
        if (searchDoc.exists()) {
          const searchData = searchDoc.data();
          if (searchData.queryInteractions) {
            searchData.queryInteractions.forEach((interaction, idx) => {
              allData.searchInteractions.push({
                participantId: participant.uid,
                queryIndex: idx,
                query: interaction.query || "N/A",
                resultsCount: interaction.searchResults?.length || 0,
                clickedCount: interaction.clickedResults?.length || 0,
                timestamp: interaction.ts?.toDate?.()?.toISOString() || "N/A",
              });
            });
          }
        }

        // Prompt ratings
        const promptQuery = query(
          collection(db, "promptRatings"),
          where("userID", "==", participant.uid),
        );
        const promptSnapshot = await getDocs(promptQuery);
        promptSnapshot.forEach((docSnap) => {
          const ratingData = docSnap.data();
          allData.promptRatings.push({
            participantId: participant.uid,
            promptId: ratingData.promptID || "N/A",
            rating: ratingData.rating || "N/A",
            timestamp: ratingData.ts?.toDate?.()?.toISOString() || "N/A",
          });
        });

        // Search ratings
        const searchRatingQuery = query(
          collection(db, "searchRating"),
          where("userID", "==", participant.uid),
        );
        const searchRatingSnapshot = await getDocs(searchRatingQuery);
        searchRatingSnapshot.forEach((docSnap) => {
          const ratingData = docSnap.data();
          allData.searchRatings.push({
            participantId: participant.uid,
            queryId: ratingData.queryID || "N/A",
            rating: ratingData.rating || "N/A",
            timestamp: ratingData.ts?.toDate?.()?.toISOString() || "N/A",
          });
        });
      }

      // Create ZIP file with all CSVs
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split("T")[0];

      // Add each CSV to the ZIP
      if (allData.participants.length > 0) {
        zip.file("participants.csv", generateCSVContent(allData.participants));
      }
      if (allData.backgroundResponses.length > 0) {
        zip.file(
          "background_responses.csv",
          generateCSVContent(allData.backgroundResponses),
        );
      }
      if (allData.experienceSurveys.length > 0) {
        zip.file(
          "experience_surveys.csv",
          generateCSVContent(allData.experienceSurveys),
        );
      }
      if (allData.questionnaireResponses.length > 0) {
        zip.file(
          "questionnaire_responses.csv",
          generateCSVContent(allData.questionnaireResponses),
        );
      }
      if (allData.chatInteractions.length > 0) {
        zip.file(
          "chat_interactions.csv",
          generateCSVContent(allData.chatInteractions),
        );
      }
      if (allData.searchInteractions.length > 0) {
        zip.file(
          "search_interactions.csv",
          generateCSVContent(allData.searchInteractions),
        );
      }
      if (allData.promptRatings.length > 0) {
        zip.file(
          "prompt_ratings.csv",
          generateCSVContent(allData.promptRatings),
        );
      }
      if (allData.searchRatings.length > 0) {
        zip.file(
          "search_ratings.csv",
          generateCSVContent(allData.searchRatings),
        );
      }

      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `study_responses_${timestamp}.zip`;
      link.click();

      setExportStatus("Export completed! Check your downloads.");
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
      setExportStatus("Export failed. Please try again.");
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading participants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Participant Responses
              </h1>
              <p className="text-gray-600">
                View and export survey responses from all participants
              </p>
            </div>
            <button
              onClick={exportAllToCSV}
              disabled={participants.length === 0}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              📥 Export All to CSV
            </button>
          </div>
          {exportStatus && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
              {exportStatus}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Participants List */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Participants ({participants.length})
              </h2>

              {participants.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No participants found.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.uid}
                      onClick={() => fetchParticipantDetails(participant)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedParticipant?.uid === participant.uid
                          ? "bg-blue-100 border-blue-300 border"
                          : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {participant.email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Task: {participant.tasks?.firstTask || "Not assigned"}
                        {participant.tasks?.firstTaskTopic && (
                          <span className="ml-1 text-xs">
                            ({participant.tasks.firstTaskTopic.substring(0, 20)}
                            ...)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {participant.demographyCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Background ✓
                          </span>
                        )}
                        {participant.task1Completed && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Task ✓
                          </span>
                        )}
                        {participant.isEndOfStudySurveyCompleted && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Complete ✓
                          </span>
                        )}
                      </div>
                      {participant.createdAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          {participant.createdAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participant Details */}
          <div className="w-2/3">
            <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[600px]">
              {!selectedParticipant ? (
                <div className="text-gray-500 text-center py-16">
                  Select a participant to view their responses
                </div>
              ) : isLoadingDetails ? (
                <div className="text-gray-500 text-center py-16">
                  Loading participant data...
                </div>
              ) : (
                <>
                  {/* Participant Header */}
                  <div className="mb-6 pb-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedParticipant.email || "No email"}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      <div>
                        <span className="font-medium">User ID:</span>{" "}
                        {selectedParticipant.uid}
                      </div>
                      <div>
                        <span className="font-medium">MTurk ID:</span>{" "}
                        {selectedParticipant.mturkId || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Task:</span>{" "}
                        {selectedParticipant.tasks?.firstTask || "N/A"} |
                        <span className="font-medium ml-2">Topic:</span>{" "}
                        {selectedParticipant.tasks?.firstTaskTopic || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[
                      { id: "background", label: "Background" },
                      { id: "questionnaire", label: "Questionnaires" },
                      { id: "experience", label: "Experience Survey" },
                      { id: "chat", label: "Chat Interactions" },
                      { id: "search", label: "Search Interactions" },
                      { id: "ratings", label: "Ratings" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === "background" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Background Survey Responses
                        </h3>
                        {participantData?.background ? (
                          <div className="space-y-3">
                            {Object.entries(participantData.background).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="text-sm font-medium text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </div>
                                  <div className="text-gray-800 mt-1">
                                    {Array.isArray(value)
                                      ? value.join(", ")
                                      : String(value)}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            No background responses available.
                          </div>
                        )}

                        {/* Consent Data */}
                        {participantData?.consentData && (
                          <div className="mt-6">
                            <h4 className="font-medium text-gray-800 mb-2">
                              Consent Responses
                            </h4>
                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-600">
                                  Archive Consent
                                </div>
                                <div className="text-gray-800">
                                  {participantData.consentData.archiveConsent ||
                                    "N/A"}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-600">
                                  Future Contact Consent
                                </div>
                                <div className="text-gray-800">
                                  {participantData.consentData
                                    .futureContactConsent || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "questionnaire" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Pre/Post Task Questionnaire Responses
                        </h3>
                        {renderQuestionnaireResponses()}
                      </div>
                    )}

                    {activeTab === "experience" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Experience Survey Responses
                        </h3>
                        {renderExperienceSurvey()}
                      </div>
                    )}

                    {activeTab === "chat" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Chat Interactions
                        </h3>
                        {participantData?.chatTasks?.prompts ? (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {participantData.chatTasks.prompts.map(
                              (prompt, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg ${
                                    prompt.role === "user"
                                      ? "bg-blue-50 border-l-4 border-blue-400"
                                      : "bg-gray-50 border-l-4 border-gray-400"
                                  }`}
                                >
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    {prompt.role === "user"
                                      ? "User"
                                      : "Assistant"}
                                  </div>
                                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {prompt.prompt}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            No chat interactions available.
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "search" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Search Interactions
                        </h3>
                        {renderSearchInteractions()}
                      </div>
                    )}

                    {activeTab === "ratings" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Response Ratings
                        </h3>
                        {renderRatings()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResponses;
