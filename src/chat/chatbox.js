// import { useState, useContext } from "react";
// import { useEffect } from "react";
// import MsgEntry from "./MsgEntry";
// import Prompt from "./prompt";
// import user_profile from "../assets/chatbox/user_profile.svg";
// import ai_profile from "../assets/chatbox/ai_profile.svg";
// import { doc, arrayUnion, getDoc, updateDoc, setDoc } from "firebase/firestore";
// import AuthContext from "../context/auth-context";
// import { db } from "../firebase-config";
// import { uid } from "uid";
// import ReactMarkdown from "react-markdown";
// import hljs from "highlight.js";
// import TaskContext from "../context/task-context";
// import EditNoteReminder from "./EditNoteReminder";
// import OpenAI from "openai";
// import Reminder from "../common/Reminder";
// import { getOpenAIApiKey } from "../utils/apiSettings";

// function ChatBox() {
//   const [prompt, setPrompt] = useState("");
//   const [showDataQualityReminder, setShowDataQualityReminder] = useState(true);
//   const [response, setResponse] = useState("");
//   const [promptID, setPromptID] = useState("");
//   const [responseID, setResponseID] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [promptResponseArray, setPromptResponseArray] = useState([]);
//   const [openaiClient, setOpenaiClient] = useState(null);
//   const [apiKeyError, setApiKeyError] = useState(null);

//   const authCtx = useContext(AuthContext);
//   const taskCtx = useContext(TaskContext);

//   const bgObj = { user: "bg-[#f9f9f9]", ai: "bg-[#FFFFFF]" };

//   // Initialize OpenAI client with API key from the participant's assigned admin
//   useEffect(() => {
//     const initializeOpenAI = async () => {
//       if (!authCtx.user?.uid) return;

//       try {
//         // Get the adminId associated with this participant
//         let adminId = null;

//         // If current user is an admin, use their own keys
//         if (authCtx.isAdmin) {
//           adminId = authCtx.user.uid;
//           console.log("User is admin, using own API keys");
//         } else {
//           // Get the adminId from the participant's user document
//           adminId = await authCtx.getParticipantAdminId(authCtx.user.uid);
//           console.log("Participant's adminId:", adminId);
//         }

//         if (!adminId) {
//           setApiKeyError(
//             "No admin associated with this account. Please contact the study administrator.",
//           );
//           return;
//         }

//         // Fetch the API key for this admin
//         const apiKey = await getOpenAIApiKey(adminId);

//         if (apiKey) {
//           const client = new OpenAI({
//             apiKey: apiKey,
//             dangerouslyAllowBrowser: true,
//           });
//           setOpenaiClient(client);
//           setApiKeyError(null);
//           console.log(
//             "OpenAI client initialized successfully for adminId:",
//             adminId,
//           );
//         } else {
//           setApiKeyError(
//             "OpenAI API key not configured. Please contact the study administrator.",
//           );
//         }
//       } catch (error) {
//         console.error("Error initializing OpenAI:", error);
//         setApiKeyError("Failed to load API configuration.");
//       }
//     };

//     initializeOpenAI();
//   }, [authCtx.user?.uid, authCtx.isAdmin]);

//   // Pull the chat history from the database
//   useEffect(() => {
//     const getChatHistory = async () => {
//       console.log("Getting the updated chat history");
//       const chatTaskRef = doc(db, "chatTasks", authCtx.user.uid);
//       const docSnap = await getDoc(chatTaskRef);
//       const chatHistory = [];
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         const prompts = data?.prompts;
//         if (!prompts) return;
//         for (const prompt of prompts) {
//           const obj = {
//             role: prompt.role,
//             content: prompt.prompt,
//             id: prompt.id,
//             ratingID: prompt.ratingID || null,
//           };
//           chatHistory.push(obj);
//         }
//       }
//       setPromptResponseArray(chatHistory);
//     };
//     if (authCtx.user) {
//       getChatHistory();
//     }
//   }, [authCtx.user, taskCtx.showRatingPopUp]);

//   const getAPIResponse = async (array, promptID) => {
//     if (!openaiClient) {
//       alert(
//         "OpenAI is not configured. Please contact the study administrator.",
//       );
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const filteredMessages = array.map((message) => ({
//         role: message.role,
//         content: message.content,
//       }));

//       const typingStartTime = new Date();

//       const stream = await openaiClient.chat.completions.create({
//         model: "gpt-4-turbo-preview",
//         messages: filteredMessages,
//         stream: true,
//       });
//       const tempResponseID = uid();
//       let allResponses = "";
//       for await (const part of stream) {
//         if (part.choices && part.choices.length > 0) {
//           const message = part.choices[0].delta?.content || "";
//           allResponses += message;
//           const updatedArray = [
//             ...array,
//             {
//               role: "assistant",
//               content: allResponses,
//               id: tempResponseID,
//             },
//           ];
//           setPromptResponseArray(updatedArray);
//         }
//       }
//       setResponseID(tempResponseID);
//       setIsLoading(false);
//       const formData = {
//         id: tempResponseID,
//         responseTo: promptID,
//         prompt: allResponses,
//         userID: authCtx?.user.uid || "",
//         role: "assistant",
//         typingStartTime,
//         typingEndTime: new Date(),
//       };
//       // Save the complete response to Firestore database
//       saveChatHistory(formData);

//       // Trigger task instruction popup (if configured)
//       // if (taskCtx.triggerAfterResponse) {
//       //   taskCtx.triggerAfterResponse();
//       // }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       alert("Error communicating with ChatGPT. Please try again.");
//     }
//     setIsLoading(false);
//   };

//   const saveChatHistory = async (formData) => {
//     // Get a reference to the chatTasks document
//     const chatTaskRef = doc(db, "chatTasks", authCtx.user.uid);

//     // Check if the document exists
//     const docSnap = await getDoc(chatTaskRef);

//     if (docSnap.exists()) {
//       // If it exists, append the new query interaction
//       await updateDoc(chatTaskRef, {
//         prompts: arrayUnion(formData),
//       });
//     } else {
//       // If the document does not exist, create it with the new query interaction
//       await setDoc(chatTaskRef, {
//         prompts: [formData],
//         userID: authCtx.user.uid,
//       });
//     }
//   };

//   const renderers = {
//     code({ node, inline, className, children, ...props }) {
//       const match = /language-(\w+)/.exec(className || "");
//       const language = match && match[1] ? match[1] : "";

//       const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
//       const highlighted = hljs.highlight(validLanguage, children[0]).value;

//       if (inline) {
//         return (
//           <code
//             className={className}
//             {...props}
//             dangerouslySetInnerHTML={{ __html: highlighted }}
//           />
//         );
//       }
//       return (
//         <pre className={className} {...props}>
//           <code dangerouslySetInnerHTML={{ __html: highlighted }} />
//         </pre>
//       );
//     },
//   };

//   // Create an array of message components
//   const messageComponents = promptResponseArray.map((message, index) => {
//     return (
//       <div key={`message-${index}`}>
//         {message.role === "user" ? (
//           <Prompt
//             divKey={`message-${index}`}
//             role="user"
//             promptID={message.id}
//             text={message.content}
//             stringText={message.content}
//             bgColor={bgObj.user}
//             profile_image={user_profile}
//           />
//         ) : (
//           <Prompt
//             divKey={`message-${index}`}
//             promptID={message.id}
//             role="assistant"
//             ratingID={message?.ratingID}
//             stringText={message.content}
//             text={
//               <ReactMarkdown
//                 components={renderers}
//                 children={message.content}
//               />
//             }
//             bgColor={bgObj.ai}
//             profile_image={ai_profile}
//           />
//         )}
//       </div>
//     );
//   });

//   const isAllResponsesRated = promptResponseArray
//     .filter((prompt) => prompt.role === "assistant")
//     .every((prompt) => prompt.ratingID);
//   taskCtx.setAllResponsesRated(isAllResponsesRated);

//   return (
//     <div className="bg-[#FFFFFF] flex w-full flex-col">
//       {/* API Key Error Banner */}
//       {apiKeyError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
//           <strong>Configuration Error:</strong> {apiKeyError}
//         </div>
//       )}

//       <div className="w-full mb-56">{messageComponents}</div>
//       <div className="fixed bottom-0 mb-8 flex flex-col left-[45%] w-[50%] transform -translate-x-1/2 ">
//         <MsgEntry
//           isAllResponsesRated={isAllResponsesRated}
//           isLoading={isLoading}
//           setShowDataQualityReminder={setShowDataQualityReminder}
//           saveChatHistory={saveChatHistory}
//           setPromptID={setPromptID}
//           responseID={responseID}
//           setPromptResponseArray={setPromptResponseArray}
//           promptResponseArray={promptResponseArray}
//           setPrompt={setPrompt}
//           getAPIResponse={getAPIResponse}
//         />
//       </div>
//       {showDataQualityReminder && (
//         <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
//           <Reminder setShowReminder={setShowDataQualityReminder} />
//         </div>
//       )}
//       {taskCtx.showPopUp && (
//         <div className="fixed top-0 left-0 z-10 w-screen h-screen flex items-center justify-center">
//           <EditNoteReminder />
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatBox;

import { useState, useContext, useRef } from "react";
import { useEffect } from "react";
import MsgEntry from "./MsgEntry";
import Prompt from "./prompt";
import user_profile from "../assets/chatbox/user_profile.svg";
import ai_profile from "../assets/chatbox/ai_profile.svg";
import { doc, arrayUnion, getDoc, updateDoc, setDoc } from "firebase/firestore";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import { uid } from "uid";
import ReactMarkdown from "react-markdown";
import hljs from "highlight.js";
import TaskContext from "../context/task-context";
import EditNoteReminder from "./EditNoteReminder";
import OpenAI from "openai";
import Reminder from "../common/Reminder";
import { getOpenAIApiKey } from "../utils/apiSettings";

function ChatBox({
  triggerAfterPromptSubmit,
  markResponseReceived,
  checkPendingResponseSurvey,
  onSurveyCompleteRef,
}) {
  const [prompt, setPrompt] = useState("");
  const [showDataQualityReminder, setShowDataQualityReminder] = useState(true);
  const [response, setResponse] = useState("");
  const [promptID, setPromptID] = useState("");
  const [responseID, setResponseID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promptResponseArray, setPromptResponseArray] = useState([]);
  const [openaiClient, setOpenaiClient] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(null);

  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);

  const bgObj = { user: "bg-[#f9f9f9]", ai: "bg-[#FFFFFF]" };

  // Initialize OpenAI client with API key from the participant's assigned admin
  useEffect(() => {
    const initializeOpenAI = async () => {
      if (!authCtx.user?.uid) return;

      try {
        // Get the adminId associated with this participant
        let adminId = null;

        // If current user is an admin, use their own keys
        if (authCtx.isAdmin) {
          adminId = authCtx.user.uid;
          console.log("User is admin, using own API keys");
        } else {
          // Get the adminId from the participant's user document
          adminId = await authCtx.getParticipantAdminId(authCtx.user.uid);
          console.log("Participant's adminId:", adminId);
        }

        if (!adminId) {
          setApiKeyError(
            "No admin associated with this account. Please contact the study administrator.",
          );
          return;
        }

        // Fetch the API key for this admin
        const apiKey = await getOpenAIApiKey(adminId);

        if (apiKey) {
          const client = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
          });
          setOpenaiClient(client);
          setApiKeyError(null);
          console.log(
            "OpenAI client initialized successfully for adminId:",
            adminId,
          );
        } else {
          setApiKeyError(
            "OpenAI API key not configured. Please contact the study administrator.",
          );
        }
      } catch (error) {
        console.error("Error initializing OpenAI client:", error);
        setApiKeyError("Error initializing AI service. Please try again.");
      }
    };

    initializeOpenAI();
  }, [authCtx.user, authCtx.isAdmin, authCtx.getParticipantAdminId]);

  // Load existing chat history from Firestore
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!authCtx.user?.uid) return;

      try {
        const chatDocRef = doc(db, "chatTasks", authCtx.user.uid);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists() && chatDoc.data().prompts) {
          const existingPrompts = chatDoc.data().prompts;
          const formattedPrompts = existingPrompts.map((p) => ({
            role: p.role,
            content: p.prompt || p.content,
            id: p.id || uid(),
          }));
          setPromptResponseArray(formattedPrompts);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [authCtx.user]);

  // Save chat history to Firestore
  const saveChatHistory = async (formData) => {
    if (!authCtx.user?.uid) return;

    try {
      const chatDocRef = doc(db, "chatTasks", authCtx.user.uid);
      await setDoc(
        chatDocRef,
        {
          prompts: arrayUnion({
            ...formData,
            content: formData.prompt,
          }),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // Get API response from OpenAI
  const getAPIResponse = async (messages, currentPromptID) => {
    if (!openaiClient) {
      console.error("OpenAI client not initialized");
      return;
    }

    setIsLoading(true);

    // Trigger after-prompt-submit survey (from props)
    if (triggerAfterPromptSubmit) {
      triggerAfterPromptSubmit();
    }

    try {
      // Format messages for OpenAI API
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages,
      });

      const aiResponse = completion.choices[0].message.content;
      const newResponseID = uid();
      setResponseID(newResponseID);

      // Save AI response to Firestore
      await saveChatHistory({
        id: newResponseID,
        responseTo: currentPromptID,
        prompt: aiResponse,
        role: "assistant",
        userID: authCtx.user?.uid || "",
        typingStartTime: new Date(),
        typingEndTime: new Date(),
      });

      // Update local state
      setPromptResponseArray((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          id: newResponseID,
        },
      ]);

      setResponse(aiResponse);
      taskCtx.setQueryCount();

      // Mark that response was received - survey will show before next prompt (from props)
      if (markResponseReceived) {
        markResponseReceived();
      }
    } catch (error) {
      console.error("Error getting API response:", error);
      // Add error message to chat
      setPromptResponseArray((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
          id: uid(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Code syntax highlighting for markdown
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-2">
          <code
            className={className}
            dangerouslySetInnerHTML={{
              __html: hljs.highlight(String(children).replace(/\n$/, ""), {
                language: match[1],
              }).value,
            }}
          />
        </pre>
      ) : (
        <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
          {children}
        </code>
      );
    },
  };

  // Render message components
  const messageComponents = promptResponseArray.map((message, index) => {
    return (
      <div key={message.id || index}>
        {message.role === "user" ? (
          <Prompt
            divKey={`message-${index}`}
            role="user"
            promptID={message.id}
            text={message.content}
            stringText={message.content}
            bgColor={bgObj.user}
            profile_image={user_profile}
          />
        ) : (
          <Prompt
            divKey={`message-${index}`}
            promptID={message.id}
            role="assistant"
            stringText={message.content}
            text={
              <ReactMarkdown
                components={renderers}
                children={message.content}
              />
            }
            bgColor={bgObj.ai}
            profile_image={ai_profile}
          />
        )}
      </div>
    );
  });

  return (
    <div className="bg-[#FFFFFF] flex w-full flex-col">
      {/* API Key Error Banner */}
      {apiKeyError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          <strong>Configuration Error:</strong> {apiKeyError}
        </div>
      )}

      <div className="w-full mb-56">{messageComponents}</div>
      <div className="fixed bottom-0 mb-8 flex flex-col left-[45%] w-[50%] transform -translate-x-1/2 ">
        <MsgEntry
          isLoading={isLoading}
          setShowDataQualityReminder={setShowDataQualityReminder}
          saveChatHistory={saveChatHistory}
          setPromptID={setPromptID}
          responseID={responseID}
          setPromptResponseArray={setPromptResponseArray}
          promptResponseArray={promptResponseArray}
          setPrompt={setPrompt}
          getAPIResponse={getAPIResponse}
          checkPendingResponseSurvey={checkPendingResponseSurvey}
          onSurveyCompleteRef={onSurveyCompleteRef}
        />
      </div>

      {/* Existing reminders */}
      {showDataQualityReminder && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
          <Reminder setShowReminder={setShowDataQualityReminder} />
        </div>
      )}
      {taskCtx.showPopUp && (
        <div className="fixed top-0 left-0 z-10 w-screen h-screen flex items-center justify-center">
          <EditNoteReminder />
        </div>
      )}
    </div>
  );
}

export default ChatBox;
