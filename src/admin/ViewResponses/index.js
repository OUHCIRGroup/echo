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

  // Fetch all participants belonging to this admin
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!authCtx.user?.uid) return;

      try {
        setIsLoading(true);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("adminId", "==", authCtx.user.uid));
        const snapshot = await getDocs(q);

        const participantsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          participantsList.push({
            uid: doc.id,
            email: data.email,
            mturkId: data.mturkId || "N/A",
            createdAt: data.creationTs?.toDate?.() || null,
            tasks: data.tasks || {},
            demographyCompleted: data.demographyCompleted || false,
            task1Completed: data.task1Completed || false,
            isEndOfStudySurveyCompleted:
              data.isEndOfStudySurveyCompleted || false,
          });
        });

        // Sort by creation date (newest first)
        participantsList.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt - a.createdAt;
        });

        setParticipants(participantsList);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [authCtx.user?.uid]);

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
        data.background = userDoc.data().backgroundResponses || null;
      }

      // 2. Experience Survey responses
      const expQuery = query(
        collection(db, "experienceSurvey"),
        where("userId", "==", participant.uid),
      );
      const expSnapshot = await getDocs(expQuery);
      expSnapshot.forEach((doc) => {
        data.experienceSurvey.push({ id: doc.id, ...doc.data() });
      });

      // 3. Questionnaire responses (pre-task and post-task)
      const questQuery = query(
        collection(db, "questionnaireResponses"),
        where("userID", "==", participant.uid),
      );
      const questSnapshot = await getDocs(questQuery);
      questSnapshot.forEach((doc) => {
        data.questionnaireResponses.push({ id: doc.id, ...doc.data() });
      });

      // 4. Chat tasks
      const chatDoc = await getDoc(doc(db, "chatTasks", participant.uid));
      if (chatDoc.exists()) {
        data.chatTasks = chatDoc.data();
      }

      // 5. Search tasks
      const searchQuery = query(
        collection(db, "searchTask"),
        where("userID", "==", participant.uid),
      );
      const searchSnapshot = await getDocs(searchQuery);
      const searchTasks = [];
      searchSnapshot.forEach((doc) => {
        searchTasks.push({ id: doc.id, ...doc.data() });
      });
      data.searchTasks = searchTasks.length > 0 ? searchTasks : null;

      // 6. Prompt ratings
      const promptQuery = query(
        collection(db, "promptRatings"),
        where("userID", "==", participant.uid),
      );
      const promptSnapshot = await getDocs(promptQuery);
      promptSnapshot.forEach((doc) => {
        data.promptRatings.push({ id: doc.id, ...doc.data() });
      });

      // 7. Search ratings
      const searchRatingQuery = query(
        collection(db, "searchRating"),
        where("userID", "==", participant.uid),
      );
      const searchRatingSnapshot = await getDocs(searchRatingQuery);
      searchRatingSnapshot.forEach((doc) => {
        data.searchRatings.push({ id: doc.id, ...doc.data() });
      });

      setParticipantData(data);
    } catch (error) {
      console.error("Error fetching participant details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
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
          createdAt: participant.createdAt?.toISOString() || "N/A",
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
        expSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.experienceSurveys.push({
            participantId: participant.uid,
            task: data.task || "N/A",
            ...flattenObject(data),
          });
        });

        // Questionnaire responses
        const questQuery = query(
          collection(db, "questionnaireResponses"),
          where("userID", "==", participant.uid),
        );
        const questSnapshot = await getDocs(questQuery);
        questSnapshot.forEach((doc) => {
          const data = doc.data();
          // Flatten ratings object
          const flatRatings = {};
          if (data.ratings) {
            Object.entries(data.ratings).forEach(([key, value]) => {
              flatRatings[`rating_${key}_expectation`] =
                value.expectationRating || "";
              flatRatings[`rating_${key}_frequency`] =
                value.usageFrequencyRating || "";
            });
          }
          allData.questionnaireResponses.push({
            participantId: participant.uid,
            isPostTask: data.isPostTask,
            currentTask: data.currentTask,
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
              content: prompt.prompt?.substring(0, 500) || "", // Truncate for CSV
              timestamp:
                prompt.typingEndTime?.toDate?.()?.toISOString() || "N/A",
            });
          });
        }

        // Search interactions
        const searchQuery = query(
          collection(db, "searchTask"),
          where("userID", "==", participant.uid),
        );
        const searchSnapshot = await getDocs(searchQuery);
        searchSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.searchInteractions.push({
            participantId: participant.uid,
            query: data.query || "N/A",
            timestamp: data.ts?.toDate?.()?.toISOString() || "N/A",
          });
        });

        // Prompt ratings
        const promptQuery = query(
          collection(db, "promptRatings"),
          where("userID", "==", participant.uid),
        );
        const promptSnapshot = await getDocs(promptQuery);
        promptSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.promptRatings.push({
            participantId: participant.uid,
            promptId: data.promptID || "N/A",
            rating: data.rating || "N/A",
            timestamp: data.ts?.toDate?.()?.toISOString() || "N/A",
          });
        });

        // Search ratings
        const searchRatingQuery = query(
          collection(db, "searchRating"),
          where("userID", "==", participant.uid),
        );
        const searchRatingSnapshot = await getDocs(searchRatingQuery);
        searchRatingSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.searchRatings.push({
            participantId: participant.uid,
            queryId: data.queryID || "N/A",
            rating: data.rating || "N/A",
            timestamp: data.ts?.toDate?.()?.toISOString() || "N/A",
          });
        });
      }

      // Create ZIP file with all CSVs
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split("T")[0];

      // Add each CSV to the ZIP
      zip.file("participants.csv", generateCSVContent(allData.participants));

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

  // Helper function to flatten nested objects
  const flattenObject = (obj, prefix = "") => {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !(obj[key] instanceof Date)
        ) {
          // Skip Firestore Timestamp objects
          if (obj[key].toDate) {
            result[newKey] = obj[key].toDate().toISOString();
          } else {
            Object.assign(result, flattenObject(obj[key], newKey));
          }
        } else if (Array.isArray(obj[key])) {
          result[newKey] = obj[key].join("; ");
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  };

  // Helper function to generate CSV content string
  const generateCSVContent = (data) => {
    if (!data || data.length === 0) return "";

    // Get all unique headers
    const headers = [...new Set(data.flatMap((obj) => Object.keys(obj)))];

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            // Escape quotes and wrap in quotes if contains comma or newline
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(",") ||
              stringValue.includes("\n") ||
              stringValue.includes('"')
              ? `"${stringValue}"`
              : stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    return csvContent;
  };

  // Helper function to convert array to CSV and download (kept for single file downloads if needed)
  const downloadCSV = (data, filename) => {
    const csvContent = generateCSVContent(data);
    if (!csvContent) return;

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Render JSON data nicely
  const renderJSON = (data, title) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-gray-500 italic p-4">
          No {title.toLowerCase()} data available.
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
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
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Participant Responses
              </h1>
              <p className="text-gray-600">
                View and export survey responses from your participants
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
                  No participants found for your account.
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
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {participant.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        MTurk: {participant.mturkId}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            participant.demographyCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          Background
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            participant.task1Completed
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          Task
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            participant.isEndOfStudySurveyCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          Complete
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participant Details */}
          <div className="w-2/3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
                      {selectedParticipant.email}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                      MTurk ID: {selectedParticipant.mturkId} | Task:{" "}
                      {selectedParticipant.tasks?.firstTask || "N/A"} | Topic:{" "}
                      {selectedParticipant.tasks?.firstTaskTopic || "N/A"}
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
                                  <div className="text-sm font-medium text-gray-600">
                                    {key}
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
                      </div>
                    )}

                    {activeTab === "questionnaire" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Pre/Post Task Questionnaire Responses
                        </h3>
                        {renderJSON(
                          participantData?.questionnaireResponses,
                          "Questionnaire",
                        )}
                      </div>
                    )}

                    {activeTab === "experience" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Experience Survey Responses
                        </h3>
                        {renderJSON(
                          participantData?.experienceSurvey,
                          "Experience Survey",
                        )}
                      </div>
                    )}

                    {activeTab === "chat" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Chat Interactions
                        </h3>
                        {participantData?.chatTasks?.prompts ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        {renderJSON(
                          participantData?.searchTasks,
                          "Search Interactions",
                        )}
                      </div>
                    )}

                    {activeTab === "ratings" && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">
                          Prompt & Search Ratings
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">
                              Prompt Ratings
                            </h4>
                            {renderJSON(
                              participantData?.promptRatings,
                              "Prompt Ratings",
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">
                              Search Ratings
                            </h4>
                            {renderJSON(
                              participantData?.searchRatings,
                              "Search Ratings",
                            )}
                          </div>
                        </div>
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
