// import React, { useEffect, useState, useContext } from "react";
// import AuthContext from "../context/auth-context";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase-config";
// import { doc, setDoc, collection, getDocs } from "firebase/firestore";

// const ConsentForm = () => {
//   // State to store the responses
//   const [archiveConsent, setArchiveConsent] = useState("");
//   const [futureContactConsent, setFutureContactConsent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for dynamic admin/researcher info
//   const [researcherInfo, setResearcherInfo] = useState({
//     firstName: "",
//     lastName: "",
//     organization: "",
//     email: "",
//   });
//   const [isLoadingInfo, setIsLoadingInfo] = useState(true);

//   const authCtx = useContext(AuthContext);
//   const navigate = useNavigate();

//   // Fetch admin/researcher info on mount
//   useEffect(() => {
//     const fetchResearcherInfo = async () => {
//       try {
//         // Fetch from admin/users/list collection (get the first/primary admin)
//         const adminListRef = collection(db, "admin", "users", "list");
//         const snapshot = await getDocs(adminListRef);

//         if (!snapshot.empty) {
//           // Get the first admin (or you could filter by a specific criteria)
//           const adminDoc = snapshot.docs[0];
//           const adminData = adminDoc.data();

//           setResearcherInfo({
//             firstName: adminData.firstName || "",
//             lastName: adminData.lastName || "",
//             organization: adminData.organization || "",
//             email: adminData.email || "",
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching researcher info:", error);
//       } finally {
//         setIsLoadingInfo(false);
//       }
//     };

//     fetchResearcherInfo();
//   }, []);

//   // Remove the beforeunload listener when on consent page to prevent the popup
//   useEffect(() => {
//     // Store the original handler
//     const originalHandler = window.onbeforeunload;

//     // Remove any beforeunload handlers while on consent page
//     window.onbeforeunload = null;

//     // Also remove event listeners that might have been added
//     const preventUnloadWarning = (e) => {
//       // Don't prevent default, don't set returnValue
//       // This effectively disables the warning
//     };

//     // Override any existing handlers
//     window.addEventListener("beforeunload", preventUnloadWarning, true);

//     return () => {
//       // Restore when leaving consent page
//       window.removeEventListener("beforeunload", preventUnloadWarning, true);
//       window.onbeforeunload = originalHandler;
//     };
//   }, []);

//   // Handler for form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!archiveConsent || !futureContactConsent) {
//       alert("Please answer both questions before submitting.");
//       return;
//     }

//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     // Save the data in firestore
//     const consentData = {
//       archiveConsent,
//       futureContactConsent,
//       consentTimestamp: new Date(),
//     };

//     const usersRef = doc(db, "users", authCtx.user.uid);

//     try {
//       // Use setDoc with merge instead of updateDoc to handle new users
//       await setDoc(usersRef, consentData, { merge: true });
//       console.log("Consent form submitted successfully");

//       // Use replace to prevent back navigation issues
//       navigate("/home", { replace: true });
//     } catch (e) {
//       console.error("Error submitting consent:", e);
//       alert("Error submitting consent. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   // Get display name for researcher
//   const getResearcherName = () => {
//     if (researcherInfo.firstName && researcherInfo.lastName) {
//       return `${researcherInfo.firstName} ${researcherInfo.lastName}`;
//     }
//     return "the researcher";
//   };

//   // Get organization name
//   const getOrganization = () => {
//     return researcherInfo.organization || "the University";
//   };

//   // Show loading while fetching researcher info
//   if (isLoadingInfo) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
//         <div className="text-lg text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-4 text-center">
//         Consent to Participate in Research
//       </h1>
//       <h2 className="text-xl mb-2 text-center">{getOrganization()}</h2>
//       <p className="mb-4">
//         <strong>
//           Would you like to be involved in research at {getOrganization()}?
//         </strong>
//       </p>
//       <p>
//         I am {getResearcherName()} from {getOrganization()} and I invite you to
//         participate in my research entitled Functional Fixedness Evaluation in
//         Human-LLM Interaction. This research is being conducted remotely via
//         your own computer. You were selected as a possible participant because
//         you meet the eligibility requirement for the study. You must be at least
//         18 years of age to participate in this research.
//       </p>
//       <p className="mt-4 underline font-bold">
//         Please read this document and contact me to ask any questions you may
//         have BEFORE agreeing to participate in my research.
//       </p>
//       <br />
//       <p className="mb-4">
//         <strong>What is the purpose of this research?</strong> This research
//         aims to study the functional fixedness in human-Large Language Model
//         (LLM) interaction, specifically focusing on users' intention
//         distribution and interaction behaviors in both search engine and ChatGPT
//         settings.
//       </p>
//       <p className="mb-4">
//         <strong>How many participants will be in this research?</strong> About
//         800-1,000 online participants will take part in this research.
//       </p>
//       <p className="mb-4">
//         <strong>What will I be asked to do?</strong> If you agree to be in this
//         research, you will be asked to perform a task using ChatGPT and answer a
//         questionnaire about your search engine usage.
//       </p>
//       <p className="mb-4">
//         <strong>How long will this take?</strong> Your participation will take
//         35-40 minutes.
//       </p>
//       <p className="mb-4">
//         <strong>What are the risks and benefits if I participate?</strong> We
//         will keep the logs of your task performance. We will not ask for names
//         or any personal information. These logs are not identifiable to each
//         participant.
//       </p>
//       <p className="mb-4">
//         <strong>Will I be compensated for participating?</strong> Each
//         participant will receive compensation upon completion as specified in
//         the study recruitment.
//       </p>
//       <p className="mb-4">
//         <strong>Who will see my information?</strong> There will be no
//         information in research reports that will make it possible to identify
//         you. Research records will be stored securely, and only approved
//         researchers and the Institutional Review Board will have access to the
//         records.
//       </p>
//       <p className="mb-4">
//         <strong>Do I have to participate?</strong> No. If you do not
//         participate, you will not be penalized or lose benefits or services
//         unrelated to the research. If you decide to participate, you don't have
//         to answer any questions and can stop participating at any time.
//       </p>
//       <p className="mb-4">
//         <strong>Will my identity be anonymous or confidential?</strong> Your
//         name will not be retained or linked with your responses
//         <span className="underline"> unless you agree</span> to be identified.
//         Please check all of the options that you agree to:
//       </p>

//       {/* Data archive consent */}
//       <div>
//         <p>
//           I agree for my data to be archived for scholarly and public access
//         </p>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveYes"
//             name="archiveConsent"
//             type="radio"
//             value="Yes"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("Yes")}
//             checked={archiveConsent === "Yes"}
//           />
//           <label
//             htmlFor="archiveYes"
//             className="ml-2 font-medium text-gray-700"
//           >
//             Yes
//           </label>
//         </div>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveNo"
//             name="archiveConsent"
//             type="radio"
//             value="No"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("No")}
//             checked={archiveConsent === "No"}
//           />
//           <label htmlFor="archiveNo" className="ml-2 font-medium text-gray-700">
//             No
//           </label>
//         </div>
//       </div>

//       <p className="mt-4">
//         <strong>What will happen to my data in the future?</strong> We might
//         re-use and re-analyze your <strong>de-identified</strong> data in future
//         research without obtaining additional consent from you.
//       </p>
//       <p className="mt-4">
//         <strong>Will I be contacted again?</strong> The researcher might contact
//         you to gather additional data or recruit you for new research.
//       </p>
//       <p>I give my permission for the researcher to contact me in the future</p>
//       <div className="flex items-center mb-2">
//         <input
//           id="contactYes"
//           name="futureContact"
//           type="radio"
//           value="Yes"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("Yes")}
//           checked={futureContactConsent === "Yes"}
//         />
//         <label htmlFor="contactYes" className="ml-2 font-medium text-gray-700">
//           Yes
//         </label>
//       </div>
//       <div className="flex items-center">
//         <input
//           id="contactNo"
//           name="futureContact"
//           type="radio"
//           value="No"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("No")}
//           checked={futureContactConsent === "No"}
//         />
//         <label htmlFor="contactNo" className="ml-2 font-medium text-gray-700">
//           No
//         </label>
//       </div>

//       <p className="mt-4">
//         <strong>
//           Who do I contact with questions, concerns, or complaints?
//         </strong>{" "}
//         If you have questions, concerns, or complaints about the research or
//         have experienced a research-related injury, contact{" "}
//         {getResearcherName()} at{" "}
//         {researcherInfo.email || "the email provided during recruitment"}.
//       </p>
//       <p className="mt-4">
//         You can also contact the Institutional Review Board if you have
//         questions about your rights as a research participant, concerns, or
//         complaints about the research and wish to talk to someone other than the
//         researcher(s).
//       </p>
//       <p className="mt-4">
//         Please print a copy of this document. By providing information to the
//         researcher, I confirm that I am at least 18 years old and agree to
//         participate in this research.
//       </p>

//       <button
//         className={`w-fit py-2 px-8 rounded-xl flex mt-4 ${
//           isSubmitting
//             ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//             : "bg-[#e3e3e3] text-black hover:bg-[#d0d0d0]"
//         }`}
//         onClick={handleSubmit}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Submitting..." : "I agree to participate"}
//       </button>
//     </div>
//   );
// };

// export default ConsentForm;

// import React, { useEffect, useState, useContext } from "react";
// import AuthContext from "../context/auth-context";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase-config";
// import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";

// const ConsentForm = () => {
//   // State to store the responses
//   const [archiveConsent, setArchiveConsent] = useState("");
//   const [futureContactConsent, setFutureContactConsent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for dynamic admin/researcher info
//   const [researcherInfo, setResearcherInfo] = useState({
//     firstName: "",
//     lastName: "",
//     organization: "",
//     email: "",
//   });

//   // State for dynamic consent form configuration
//   const [config, setConfig] = useState({
//     title: "Consent to Participate in Research",
//     studyTitle: "Research Study",
//     studyDescription: "",
//     participantCount: "",
//     taskDescription: "",
//     duration: "",
//     risksAndBenefits: "",
//     compensation: "",
//     privacyStatement: "",
//     voluntaryStatement: "",
//     anonymityStatement: "",
//     futureDataUse: "",
//     futureContactStatement: "",
//     irbInfo: "",
//     archiveConsentQuestion:
//       "I agree for my data to be archived for scholarly and public access",
//     futureContactQuestion:
//       "I give my permission for the researcher to contact me in the future",
//     submitButtonText: "I agree to participate",
//     ageRequirement:
//       "You must be at least 18 years of age to participate in this research.",
//     minimumAge: 18,
//   });

//   const [isLoading, setIsLoading] = useState(true);

//   const authCtx = useContext(AuthContext);
//   const navigate = useNavigate();

//   // Fetch admin/researcher info and consent config on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch researcher info
//         const adminListRef = collection(db, "admin", "users", "list");
//         const snapshot = await getDocs(adminListRef);

//         if (!snapshot.empty) {
//           const adminDoc = snapshot.docs[0];
//           const adminData = adminDoc.data();

//           setResearcherInfo({
//             firstName: adminData.firstName || "",
//             lastName: adminData.lastName || "",
//             organization: adminData.organization || "",
//             email: adminData.email || "",
//           });
//         }

//         // Fetch consent form configuration
//         const configRef = doc(db, "admin", "consentFormConfig");
//         const configSnap = await getDoc(configRef);

//         if (configSnap.exists()) {
//           const configData = configSnap.data();
//           setConfig((prev) => ({ ...prev, ...configData }));
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Remove the beforeunload listener when on consent page
//   useEffect(() => {
//     const originalHandler = window.onbeforeunload;
//     window.onbeforeunload = null;

//     const preventUnloadWarning = (e) => {};
//     window.addEventListener("beforeunload", preventUnloadWarning, true);

//     return () => {
//       window.removeEventListener("beforeunload", preventUnloadWarning, true);
//       window.onbeforeunload = originalHandler;
//     };
//   }, []);

//   // Handler for form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!archiveConsent || !futureContactConsent) {
//       alert("Please answer both questions before submitting.");
//       return;
//     }

//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     const consentData = {
//       archiveConsent,
//       futureContactConsent,
//       consentTimestamp: new Date(),
//     };

//     const usersRef = doc(db, "users", authCtx.user.uid);

//     try {
//       await setDoc(usersRef, consentData, { merge: true });
//       console.log("Consent form submitted successfully");
//       navigate("/home", { replace: true });
//     } catch (e) {
//       console.error("Error submitting consent:", e);
//       alert("Error submitting consent. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   // Get display name for researcher
//   const getResearcherName = () => {
//     if (researcherInfo.firstName && researcherInfo.lastName) {
//       return `${researcherInfo.firstName} ${researcherInfo.lastName}`;
//     }
//     return "the researcher";
//   };

//   // Get organization name
//   const getOrganization = () => {
//     return researcherInfo.organization || "the University";
//   };

//   // Show loading while fetching data
//   if (isLoading) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
//         <div className="text-lg text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-4 text-center">{config.title}</h1>
//       <h2 className="text-xl mb-2 text-center">{getOrganization()}</h2>

//       <p className="mb-4">
//         <strong>
//           Would you like to be involved in research at {getOrganization()}?
//         </strong>
//       </p>
//       <p>
//         I am {getResearcherName()} from {getOrganization()} and I invite you to
//         participate in my research entitled {config.studyTitle}. This research
//         is being conducted remotely via your own computer. You were selected as
//         a possible participant because you meet the eligibility requirement for
//         the study. {config.ageRequirement}
//       </p>

//       <p className="mt-4 underline font-bold">
//         Please read this document and contact me to ask any questions you may
//         have BEFORE agreeing to participate in my research.
//       </p>
//       <br />

//       {config.studyDescription && (
//         <p className="mb-4">
//           <strong>What is the purpose of this research?</strong>{" "}
//           {config.studyDescription}
//         </p>
//       )}

//       {config.participantCount && (
//         <p className="mb-4">
//           <strong>How many participants will be in this research?</strong> About{" "}
//           {config.participantCount} participants will take part in this
//           research.
//         </p>
//       )}

//       {config.taskDescription && (
//         <p className="mb-4">
//           <strong>What will I be asked to do?</strong> {config.taskDescription}
//         </p>
//       )}

//       {config.duration && (
//         <p className="mb-4">
//           <strong>How long will this take?</strong> Your participation will take{" "}
//           {config.duration}.
//         </p>
//       )}

//       {config.risksAndBenefits && (
//         <p className="mb-4">
//           <strong>What are the risks and benefits if I participate?</strong>{" "}
//           {config.risksAndBenefits}
//         </p>
//       )}

//       {config.compensation && (
//         <p className="mb-4">
//           <strong>Will I be compensated for participating?</strong>{" "}
//           {config.compensation}
//         </p>
//       )}

//       {config.privacyStatement && (
//         <p className="mb-4">
//           <strong>Who will see my information?</strong>{" "}
//           {config.privacyStatement}
//         </p>
//       )}

//       {config.voluntaryStatement && (
//         <p className="mb-4">
//           <strong>Do I have to participate?</strong> {config.voluntaryStatement}
//         </p>
//       )}

//       {config.anonymityStatement && (
//         <p className="mb-4">
//           <strong>Will my identity be anonymous or confidential?</strong>{" "}
//           {config.anonymityStatement}
//           <span className="underline"> unless you agree</span> to be identified.
//           Please check all of the options that you agree to:
//         </p>
//       )}

//       {/* Data archive consent */}
//       <div>
//         <p>{config.archiveConsentQuestion}</p>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveYes"
//             name="archiveConsent"
//             type="radio"
//             value="Yes"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("Yes")}
//             checked={archiveConsent === "Yes"}
//           />
//           <label
//             htmlFor="archiveYes"
//             className="ml-2 font-medium text-gray-700"
//           >
//             Yes
//           </label>
//         </div>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveNo"
//             name="archiveConsent"
//             type="radio"
//             value="No"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("No")}
//             checked={archiveConsent === "No"}
//           />
//           <label htmlFor="archiveNo" className="ml-2 font-medium text-gray-700">
//             No
//           </label>
//         </div>
//       </div>

//       {config.futureDataUse && (
//         <p className="mt-4">
//           <strong>What will happen to my data in the future?</strong>{" "}
//           {config.futureDataUse}
//         </p>
//       )}

//       {config.futureContactStatement && (
//         <p className="mt-4">
//           <strong>Will I be contacted again?</strong>{" "}
//           {config.futureContactStatement}
//         </p>
//       )}

//       {/* Future contact consent */}
//       <p>{config.futureContactQuestion}</p>
//       <div className="flex items-center mb-2">
//         <input
//           id="contactYes"
//           name="futureContact"
//           type="radio"
//           value="Yes"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("Yes")}
//           checked={futureContactConsent === "Yes"}
//         />
//         <label htmlFor="contactYes" className="ml-2 font-medium text-gray-700">
//           Yes
//         </label>
//       </div>
//       <div className="flex items-center">
//         <input
//           id="contactNo"
//           name="futureContact"
//           type="radio"
//           value="No"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("No")}
//           checked={futureContactConsent === "No"}
//         />
//         <label htmlFor="contactNo" className="ml-2 font-medium text-gray-700">
//           No
//         </label>
//       </div>

//       <p className="mt-4">
//         <strong>
//           Who do I contact with questions, concerns, or complaints?
//         </strong>{" "}
//         If you have questions, concerns, or complaints about the research or
//         have experienced a research-related injury, contact{" "}
//         {getResearcherName()} at{" "}
//         {researcherInfo.email || "the email provided during recruitment"}.
//       </p>

//       {config.irbInfo && <p className="mt-4">{config.irbInfo}</p>}

//       <p className="mt-4">
//         Please print a copy of this document. By providing information to the
//         researcher, I confirm that I am at least {config.minimumAge || 18} years
//         old and agree to participate in this research.
//       </p>

//       <button
//         className={`w-fit py-2 px-8 rounded-xl flex mt-4 ${
//           isSubmitting
//             ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//             : "bg-[#e3e3e3] text-black hover:bg-[#d0d0d0]"
//         }`}
//         onClick={handleSubmit}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Submitting..." : config.submitButtonText}
//       </button>
//     </div>
//   );
// };

// export default ConsentForm;

// import React, { useEffect, useState, useContext } from "react";
// import AuthContext from "../context/auth-context";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase-config";
// import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";

// const ConsentForm = () => {
//   // State to store the responses
//   const [archiveConsent, setArchiveConsent] = useState("");
//   const [futureContactConsent, setFutureContactConsent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for dynamic admin/researcher info
//   const [researcherInfo, setResearcherInfo] = useState({
//     firstName: "",
//     lastName: "",
//     organization: "",
//     email: "",
//   });
//   const [isLoadingInfo, setIsLoadingInfo] = useState(true);
//   const [consentEnabled, setConsentEnabled] = useState(true);

//   const authCtx = useContext(AuthContext);
//   const navigate = useNavigate();

//   // Fetch admin/researcher info and check if consent is enabled
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Check if consent form is enabled
//         const settingsRef = doc(db, "admin", "studySettings");
//         const settingsSnap = await getDoc(settingsRef);

//         if (settingsSnap.exists()) {
//           const settingsData = settingsSnap.data();
//           // If consent form is disabled, redirect to home
//           if (settingsData.consentFormEnabled === false) {
//             setConsentEnabled(false);
//             navigate("/home", { replace: true });
//             return;
//           }
//         }

//         // Fetch from admin/users/list collection (get the first/primary admin)
//         const adminListRef = collection(db, "admin", "users", "list");
//         const snapshot = await getDocs(adminListRef);

//         if (!snapshot.empty) {
//           // Get the first admin (or you could filter by a specific criteria)
//           const adminDoc = snapshot.docs[0];
//           const adminData = adminDoc.data();

//           setResearcherInfo({
//             firstName: adminData.firstName || "",
//             lastName: adminData.lastName || "",
//             organization: adminData.organization || "",
//             email: adminData.email || "",
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoadingInfo(false);
//       }
//     };

//     fetchData();
//   }, [navigate]);

//   // Remove the beforeunload listener when on consent page to prevent the popup
//   useEffect(() => {
//     // Store the original handler
//     const originalHandler = window.onbeforeunload;

//     // Remove any beforeunload handlers while on consent page
//     window.onbeforeunload = null;

//     // Also remove event listeners that might have been added
//     const preventUnloadWarning = (e) => {
//       // Don't prevent default, don't set returnValue
//       // This effectively disables the warning
//     };

//     // Override any existing handlers
//     window.addEventListener("beforeunload", preventUnloadWarning, true);

//     return () => {
//       // Restore when leaving consent page
//       window.removeEventListener("beforeunload", preventUnloadWarning, true);
//       window.onbeforeunload = originalHandler;
//     };
//   }, []);

//   // Handler for form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!archiveConsent || !futureContactConsent) {
//       alert("Please answer both questions before submitting.");
//       return;
//     }

//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     // Save the data in firestore
//     const consentData = {
//       archiveConsent,
//       futureContactConsent,
//       consentTimestamp: new Date(),
//     };

//     const usersRef = doc(db, "users", authCtx.user.uid);

//     try {
//       // Use setDoc with merge instead of updateDoc to handle new users
//       await setDoc(usersRef, consentData, { merge: true });
//       console.log("Consent form submitted successfully");

//       // Use replace to prevent back navigation issues
//       navigate("/home", { replace: true });
//     } catch (e) {
//       console.error("Error submitting consent:", e);
//       alert("Error submitting consent. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   // Get display name for researcher
//   const getResearcherName = () => {
//     if (researcherInfo.firstName && researcherInfo.lastName) {
//       return `${researcherInfo.firstName} ${researcherInfo.lastName}`;
//     }
//     return "the researcher";
//   };

//   // Get organization name
//   const getOrganization = () => {
//     return researcherInfo.organization || "the University";
//   };

//   // Show loading while fetching researcher info
//   if (isLoadingInfo) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
//         <div className="text-lg text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   // If consent is disabled, don't render anything (will redirect)
//   if (!consentEnabled) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
//         <div className="text-lg text-gray-600">Redirecting...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-4 text-center">
//         Consent to Participate in Research
//       </h1>
//       <h2 className="text-xl mb-2 text-center">{getOrganization()}</h2>
//       <p className="mb-4">
//         <strong>
//           Would you like to be involved in research at {getOrganization()}?
//         </strong>
//       </p>
//       <p>
//         I am {getResearcherName()} from {getOrganization()} and I invite you to
//         participate in my research entitled Functional Fixedness Evaluation in
//         Human-LLM Interaction. This research is being conducted remotely via
//         your own computer. You were selected as a possible participant because
//         you meet the eligibility requirement for the study. You must be at least
//         18 years of age to participate in this research.
//       </p>
//       <p className="mt-4 underline font-bold">
//         Please read this document and contact me to ask any questions you may
//         have BEFORE agreeing to participate in my research.
//       </p>
//       <br />
//       <p className="mb-4">
//         <strong>What is the purpose of this research?</strong> This research
//         aims to study the functional fixedness in human-Large Language Model
//         (LLM) interaction, specifically focusing on users' intention
//         distribution and interaction behaviors in both search engine and ChatGPT
//         settings.
//       </p>
//       <p className="mb-4">
//         <strong>How many participants will be in this research?</strong> About
//         800-1,000 online participants will take part in this research.
//       </p>
//       <p className="mb-4">
//         <strong>What will I be asked to do?</strong> If you agree to be in this
//         research, you will be asked to perform a task using ChatGPT and answer a
//         questionnaire about your search engine usage.
//       </p>
//       <p className="mb-4">
//         <strong>How long will this take?</strong> Your participation will take
//         35-40 minutes.
//       </p>
//       <p className="mb-4">
//         <strong>What are the risks and benefits if I participate?</strong> We
//         will keep the logs of your task performance. We will not ask for names
//         or any personal information. These logs are not identifiable to each
//         participant.
//       </p>
//       <p className="mb-4">
//         <strong>Will I be compensated for participating?</strong> Each
//         participant will receive compensation upon completion as specified in
//         the study recruitment.
//       </p>
//       <p className="mb-4">
//         <strong>Who will see my information?</strong> There will be no
//         information in research reports that will make it possible to identify
//         you. Research records will be stored securely, and only approved
//         researchers and the Institutional Review Board will have access to the
//         records.
//       </p>
//       <p className="mb-4">
//         <strong>Do I have to participate?</strong> No. If you do not
//         participate, you will not be penalized or lose benefits or services
//         unrelated to the research. If you decide to participate, you don't have
//         to answer any questions and can stop participating at any time.
//       </p>
//       <p className="mb-4">
//         <strong>Will my identity be anonymous or confidential?</strong> Your
//         name will not be retained or linked with your responses
//         <span className="underline"> unless you agree</span> to be identified.
//         Please check all of the options that you agree to:
//       </p>

//       {/* Data archive consent */}
//       <div>
//         <p>
//           I agree for my data to be archived for scholarly and public access
//         </p>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveYes"
//             name="archiveConsent"
//             type="radio"
//             value="Yes"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("Yes")}
//             checked={archiveConsent === "Yes"}
//           />
//           <label
//             htmlFor="archiveYes"
//             className="ml-2 font-medium text-gray-700"
//           >
//             Yes
//           </label>
//         </div>
//         <div className="flex items-center mb-2">
//           <input
//             id="archiveNo"
//             name="archiveConsent"
//             type="radio"
//             value="No"
//             className="form-radio h-3 w-3 text-blue-600"
//             onChange={() => setArchiveConsent("No")}
//             checked={archiveConsent === "No"}
//           />
//           <label htmlFor="archiveNo" className="ml-2 font-medium text-gray-700">
//             No
//           </label>
//         </div>
//       </div>

//       <p className="mt-4">
//         <strong>What will happen to my data in the future?</strong> We might
//         re-use and re-analyze your <strong>de-identified</strong> data in future
//         research without obtaining additional consent from you.
//       </p>
//       <p className="mt-4">
//         <strong>Will I be contacted again?</strong> The researcher might contact
//         you to gather additional data or recruit you for new research.
//       </p>
//       <p>I give my permission for the researcher to contact me in the future</p>
//       <div className="flex items-center mb-2">
//         <input
//           id="contactYes"
//           name="futureContact"
//           type="radio"
//           value="Yes"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("Yes")}
//           checked={futureContactConsent === "Yes"}
//         />
//         <label htmlFor="contactYes" className="ml-2 font-medium text-gray-700">
//           Yes
//         </label>
//       </div>
//       <div className="flex items-center">
//         <input
//           id="contactNo"
//           name="futureContact"
//           type="radio"
//           value="No"
//           className="form-radio h-3 w-3 text-blue-600"
//           onChange={() => setFutureContactConsent("No")}
//           checked={futureContactConsent === "No"}
//         />
//         <label htmlFor="contactNo" className="ml-2 font-medium text-gray-700">
//           No
//         </label>
//       </div>

//       <p className="mt-4">
//         <strong>
//           Who do I contact with questions, concerns, or complaints?
//         </strong>{" "}
//         If you have questions, concerns, or complaints about the research or
//         have experienced a research-related injury, contact{" "}
//         {getResearcherName()} at{" "}
//         {researcherInfo.email || "the email provided during recruitment"}.
//       </p>
//       <p className="mt-4">
//         You can also contact the Institutional Review Board if you have
//         questions about your rights as a research participant, concerns, or
//         complaints about the research and wish to talk to someone other than the
//         researcher(s).
//       </p>
//       <p className="mt-4">
//         Please print a copy of this document. By providing information to the
//         researcher, I confirm that I am at least 18 years old and agree to
//         participate in this research.
//       </p>

//       <button
//         className={`w-fit py-2 px-8 rounded-xl flex mt-4 ${
//           isSubmitting
//             ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//             : "bg-[#e3e3e3] text-black hover:bg-[#d0d0d0]"
//         }`}
//         onClick={handleSubmit}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Submitting..." : "I agree to participate"}
//       </button>
//     </div>
//   );
// };

// export default ConsentForm;

import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";

const ConsentForm = () => {
  const [archiveConsent, setArchiveConsent] = useState("");
  const [futureContactConsent, setFutureContactConsent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [researcherInfo, setResearcherInfo] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
  });
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [consentEnabled, setConsentEnabled] = useState(true);

  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRef = doc(db, "admin", "studySettings");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const settingsData = settingsSnap.data();
          if (settingsData.consentFormEnabled === false) {
            setConsentEnabled(false);
            navigate("/home", { replace: true });
            return;
          }
        }

        const adminListRef = collection(db, "admin", "users", "list");
        const snapshot = await getDocs(adminListRef);

        if (!snapshot.empty) {
          const adminDoc = snapshot.docs[0];
          const adminData = adminDoc.data();

          setResearcherInfo({
            firstName: adminData.firstName || "",
            lastName: adminData.lastName || "",
            organization: adminData.organization || "",
            email: adminData.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const originalHandler = window.onbeforeunload;
    window.onbeforeunload = null;
    const preventUnloadWarning = (e) => {};
    window.addEventListener("beforeunload", preventUnloadWarning, true);

    return () => {
      window.removeEventListener("beforeunload", preventUnloadWarning, true);
      window.onbeforeunload = originalHandler;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archiveConsent || !futureContactConsent) {
      alert("Please answer both questions before submitting.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const consentData = {
      archiveConsent,
      futureContactConsent,
      consentTimestamp: new Date(),
    };

    const usersRef = doc(db, "users", authCtx.user.uid);

    try {
      await setDoc(usersRef, consentData, { merge: true });
      console.log("Consent form submitted successfully");
      navigate("/home", { replace: true });
    } catch (e) {
      console.error("Error submitting consent:", e);
      alert("Error submitting consent. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getResearcherName = () => {
    if (researcherInfo.firstName && researcherInfo.lastName) {
      return `${researcherInfo.firstName} ${researcherInfo.lastName}`;
    }
    return "the researcher";
  };

  const getOrganization = () => {
    return researcherInfo.organization || "the University";
  };

  if (isLoadingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!consentEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Consent to Participate in Research
        </h1>
        <h2 className="text-lg text-center text-gray-600 mb-8">
          {getOrganization()}
        </h2>

        {/* Content */}
        <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed">
          <p>
            <strong>
              Would you like to be involved in research at {getOrganization()}?
            </strong>
          </p>

          <p>
            I am {getResearcherName()} from {getOrganization()} and I invite you
            to participate in my research entitled Functional Fixedness
            Evaluation in Human-LLM Interaction. This research is being
            conducted remotely via your own computer. You were selected as a
            possible participant because you meet the eligibility requirement
            for the study. You must be at least 18 years of age to participate
            in this research.
          </p>

          <p className="font-semibold underline">
            Please read this document and contact me to ask any questions you
            may have BEFORE agreeing to participate in my research.
          </p>

          <p>
            <strong>What is the purpose of this research?</strong> This research
            aims to study the functional fixedness in human-Large Language Model
            (LLM) interaction, specifically focusing on users' intention
            distribution and interaction behaviors in both search engine and
            ChatGPT settings.
          </p>

          <p>
            <strong>How many participants will be in this research?</strong>{" "}
            About 800-1,000 online participants will take part in this research.
          </p>

          <p>
            <strong>What will I be asked to do?</strong> If you agree to be in
            this research, you will be asked to perform a task using ChatGPT and
            answer a questionnaire about your search engine usage.
          </p>

          <p>
            <strong>How long will this take?</strong> Your participation will
            take 35-40 minutes.
          </p>

          <p>
            <strong>What are the risks and benefits if I participate?</strong>{" "}
            We will keep the logs of your task performance. We will not ask for
            names or any personal information. These logs are not identifiable
            to each participant.
          </p>

          <p>
            <strong>Will I be compensated for participating?</strong> Each
            participant will receive compensation upon completion as specified
            in the study recruitment.
          </p>

          <p>
            <strong>Who will see my information?</strong> There will be no
            information in research reports that will make it possible to
            identify you. Research records will be stored securely, and only
            approved researchers and the Institutional Review Board will have
            access to the records.
          </p>

          <p>
            <strong>Do I have to participate?</strong> No. If you do not
            participate, you will not be penalized or lose benefits or services
            unrelated to the research. If you decide to participate, you don't
            have to answer any questions and can stop participating at any time.
          </p>

          <p>
            <strong>Will my identity be anonymous or confidential?</strong> Your
            name will not be retained or linked with your responses
            <span className="underline"> unless you agree</span> to be
            identified. Please check all of the options that you agree to:
          </p>

          {/* Consent Question 1 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-3">
              I agree for my data to be archived for scholarly and public access
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="archiveConsent"
                  value="Yes"
                  className="w-4 h-4"
                  onChange={() => setArchiveConsent("Yes")}
                  checked={archiveConsent === "Yes"}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="archiveConsent"
                  value="No"
                  className="w-4 h-4"
                  onChange={() => setArchiveConsent("No")}
                  checked={archiveConsent === "No"}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <p>
            <strong>What will happen to my data in the future?</strong> We might
            re-use and re-analyze your <strong>de-identified</strong> data in
            future research without obtaining additional consent from you.
          </p>

          <p>
            <strong>Will I be contacted again?</strong> The researcher might
            contact you to gather additional data or recruit you for new
            research.
          </p>

          {/* Consent Question 2 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-3">
              I give my permission for the researcher to contact me in the
              future
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="futureContact"
                  value="Yes"
                  className="w-4 h-4"
                  onChange={() => setFutureContactConsent("Yes")}
                  checked={futureContactConsent === "Yes"}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="futureContact"
                  value="No"
                  className="w-4 h-4"
                  onChange={() => setFutureContactConsent("No")}
                  checked={futureContactConsent === "No"}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <p>
            <strong>
              Who do I contact with questions, concerns, or complaints?
            </strong>{" "}
            If you have questions, concerns, or complaints about the research or
            have experienced a research-related injury, contact{" "}
            {getResearcherName()} at{" "}
            {researcherInfo.email || "the email provided during recruitment"}.
          </p>

          <p>
            You can also contact the Institutional Review Board if you have
            questions about your rights as a research participant, concerns, or
            complaints about the research and wish to talk to someone other than
            the researcher(s).
          </p>

          <p>
            Please print a copy of this document. By providing information to
            the researcher, I confirm that I am at least 18 years old and agree
            to participate in this research.
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !archiveConsent || !futureContactConsent}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting || !archiveConsent || !futureContactConsent
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? "Submitting..." : "I agree to participate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;
