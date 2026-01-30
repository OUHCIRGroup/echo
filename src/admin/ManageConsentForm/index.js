import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

const ManageConsentForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Consent form configuration
  const [consentConfig, setConsentConfig] = useState({
    // Header
    title: "Consent to Participate in Research",

    // Study Information
    studyTitle: "Functional Fixedness Evaluation in Human-LLM Interaction",
    studyDescription:
      "This research aims to study the functional fixedness in human-Large Language Model (LLM) interaction, specifically focusing on users' intention distribution and interaction behaviors in both search engine and ChatGPT settings.",

    // Participation Details
    participantCount: "800-1,000",
    taskDescription:
      "If you agree to be in this research, you will be asked to perform a task using ChatGPT and answer a questionnaire about your search engine usage.",
    duration: "35-40 minutes",

    // Risks and Benefits
    risksAndBenefits:
      "We will keep the logs of your task performance. We will not ask for names or any personal information. These logs are not identifiable to each participant.",

    // Compensation
    compensation:
      "Each participant will receive compensation upon completion as specified in the study recruitment.",

    // Privacy
    privacyStatement:
      "There will be no information in research reports that will make it possible to identify you. Research records will be stored securely, and only approved researchers and the Institutional Review Board will have access to the records.",

    // Voluntary Participation
    voluntaryStatement:
      "No. If you do not participate, you will not be penalized or lose benefits or services unrelated to the research. If you decide to participate, you don't have to answer any questions and can stop participating at any time.",

    // Anonymity
    anonymityStatement:
      "Your name will not be retained or linked with your responses unless you agree to be identified.",

    // Future Data Use
    futureDataUse:
      "We might re-use and re-analyze your de-identified data in future research without obtaining additional consent from you.",

    // Future Contact
    futureContactStatement:
      "The researcher might contact you to gather additional data or recruit you for new research.",

    // IRB Contact Info
    irbInfo:
      "You can also contact the Institutional Review Board if you have questions about your rights as a research participant, concerns, or complaints about the research and wish to talk to someone other than the researcher(s).",

    // Consent Questions
    archiveConsentQuestion:
      "I agree for my data to be archived for scholarly and public access",
    futureContactQuestion:
      "I give my permission for the researcher to contact me in the future",

    // Button Text
    submitButtonText: "I agree to participate",

    // Age Requirement
    ageRequirement:
      "You must be at least 18 years of age to participate in this research.",
    minimumAge: 18,
  });

  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, "admin", "consentFormConfig");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setConsentConfig((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error loading consent form config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Save configuration
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const docRef = doc(db, "admin", "consentFormConfig");
      await setDoc(docRef, {
        ...consentConfig,
        updatedAt: new Date(),
      });

      setSaveStatus({
        type: "success",
        message: "Consent form saved successfully!",
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving consent form config:", error);
      setSaveStatus({
        type: "error",
        message: "Failed to save. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update field
  const updateField = (field, value) => {
    setConsentConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Render a text input field
  const renderTextField = (label, field, placeholder = "") => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={consentConfig[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // Render a textarea field
  const renderTextArea = (label, field, rows = 3, helpText = "") => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}
      <textarea
        value={consentConfig[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
      />
    </div>
  );

  // Render a number input field
  const renderNumberField = (label, field, min = 0) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={consentConfig[field] || ""}
        onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
        min={min}
        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading consent form configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
                Manage Consent Form
              </h1>
              <p className="text-gray-600">
                Customize the consent form content shown to participants
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSaving
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {saveStatus && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                saveStatus.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {saveStatus.message}
            </div>
          )}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Header & Title
            </h2>
            {renderTextField(
              "Form Title",
              "title",
              "Consent to Participate in Research",
            )}
            {renderTextField("Study Title", "studyTitle", "Your Study Title")}
          </div>

          {/* Study Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Study Information
            </h2>
            {renderTextArea(
              "Study Description / Purpose",
              "studyDescription",
              4,
              "Explain what your research is about and its goals",
            )}
            {renderTextField(
              "Expected Number of Participants",
              "participantCount",
              "e.g., 100-200",
            )}
            {renderTextArea(
              "Task Description",
              "taskDescription",
              3,
              "What will participants be asked to do?",
            )}
            {renderTextField(
              "Estimated Duration",
              "duration",
              "e.g., 30-45 minutes",
            )}
          </div>

          {/* Risks, Benefits & Compensation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Risks, Benefits & Compensation
            </h2>
            {renderTextArea(
              "Risks and Benefits Statement",
              "risksAndBenefits",
              3,
              "Describe any potential risks and benefits of participation",
            )}
            {renderTextArea(
              "Compensation Statement",
              "compensation",
              2,
              "Describe how participants will be compensated",
            )}
          </div>

          {/* Privacy & Data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Privacy & Data Handling
            </h2>
            {renderTextArea(
              "Privacy Statement",
              "privacyStatement",
              3,
              "Explain how participant data will be protected",
            )}
            {renderTextArea(
              "Anonymity Statement",
              "anonymityStatement",
              2,
              "Explain how participant identity is protected",
            )}
            {renderTextArea(
              "Future Data Use Statement",
              "futureDataUse",
              2,
              "Explain how data may be used in the future",
            )}
          </div>

          {/* Participation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Participation Details
            </h2>
            {renderTextArea(
              "Voluntary Participation Statement",
              "voluntaryStatement",
              3,
              "Explain that participation is voluntary and can be withdrawn",
            )}
            {renderTextArea(
              "Future Contact Statement",
              "futureContactStatement",
              2,
              "Explain if/how participants may be contacted in the future",
            )}
            {renderNumberField("Minimum Age Requirement", "minimumAge", 18)}
            {renderTextField(
              "Age Requirement Text",
              "ageRequirement",
              "You must be at least 18 years...",
            )}
          </div>

          {/* Consent Questions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Consent Questions
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              These are the Yes/No questions participants must answer
            </p>
            {renderTextArea(
              "Data Archive Consent Question",
              "archiveConsentQuestion",
              2,
              "Question about archiving data for scholarly access",
            )}
            {renderTextArea(
              "Future Contact Consent Question",
              "futureContactQuestion",
              2,
              "Question about permission to contact in the future",
            )}
          </div>

          {/* IRB & Contact */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              IRB & Contact Information
            </h2>
            {renderTextArea(
              "IRB Contact Information",
              "irbInfo",
              3,
              "Information about contacting the Institutional Review Board",
            )}
          </div>

          {/* Button Customization */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Submit Button
            </h2>
            {renderTextField(
              "Submit Button Text",
              "submitButtonText",
              "I agree to participate",
            )}
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isSaving
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageConsentForm;
