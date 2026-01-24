import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";

const AdminSetup = () => {
  const [setupCode, setSetupCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  // Check if admin already exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Check admin/users/list collection
        const adminListRef = collection(db, "admin", "users", "list");
        const snapshot = await getDocs(adminListRef);

        if (!snapshot.empty) {
          setAdminExists(true);
        }
      } catch (error) {
        console.error("Error checking admin existence:", error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  const validateSetupCode = () => {
    const envSetupCode = process.env.REACT_APP_ADMIN_SETUP_CODE;

    if (!envSetupCode) {
      setError(
        "Setup code not configured. Please set REACT_APP_ADMIN_SETUP_CODE in your .env file.",
      );
      return;
    }

    if (setupCode.trim() !== envSetupCode) {
      setError(
        "Invalid setup code. Please check your .env file for the correct code.",
      );
      return;
    }

    setError("");
    setStep(2);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Add to admin/users/list in Firestore
      const adminDocRef = doc(db, "admin", "users", "list", user.uid);
      await setDoc(adminDocRef, {
        uid: user.uid,
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organization: organization.trim(),
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: "setup",
      });

      // Sign out after creation (user will login through admin login page)
      await auth.signOut();

      // Redirect to admin login with success message
      navigate("/admin/login?setup=success");
    } catch (error) {
      console.error("Error creating admin:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to create admin account: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking if admin exists
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Checking setup status...</div>
      </div>
    );
  }

  // Admin already exists
  if (adminExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Admin Already Configured
          </h1>
          <p className="text-gray-600 mb-6">
            An admin account has already been set up for this application.
            Please login with your admin credentials.
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Setup</h1>
          <p className="text-gray-600 mt-2">
            {step === 1
              ? "Enter the setup code to begin"
              : "Create your admin account"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Setup Code */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Setup Code
              </label>
              <input
                type="password"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value)}
                placeholder="Enter setup code from .env file"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && validateSetupCode()}
              />
              <p className="text-sm text-gray-500 mt-2">
                This code is set in your{" "}
                <code className="bg-gray-100 px-1 rounded">.env</code> file as{" "}
                <code className="bg-gray-100 px-1 rounded">
                  REACT_APP_ADMIN_SETUP_CODE
                </code>
              </p>
            </div>

            <button
              onClick={validateSetupCode}
              disabled={!setupCode.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Verify Code
            </button>
          </div>
        )}

        {/* Step 2: Admin Details */}
        {step === 2 && (
          <form onSubmit={handleCreateAdmin}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="University / Institution"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        )}

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Need help? Check the README file for setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
