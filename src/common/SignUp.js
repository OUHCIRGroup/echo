// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase-config";
// import AuthContext from "../context/auth-context";
// import TaskContext from "../context/task-context";
// import Jabber from "jabber";

// const SignUp = () => {
//   const jabber = new Jabber();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState(jabber.createEmail("example.com"));
//   const [password, setPassword] = useState("");
//   const [verifyPassword, setVerifyPassword] = useState("");
//   const [mturkId, setMTurkId] = useState("");
//   const authCtx = useContext(AuthContext);
//   const taskCtx = useContext(TaskContext);

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     // check if all the fields are filled
//     if (password === "" || mturkId === "") {
//       alert("Please fill all the fields.");
//       return;
//     }
//     if (password !== verifyPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     if (password.length < 6) {
//       alert("Password must be at least 6 characters long.");
//       return;
//     }
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       console.log("Signed up user:", user);
//       // login the user
//       authCtx.login(user, password);
//       authCtx.updateMTurkId(mturkId, user.uid);
//       // assing a task to the user
//       taskCtx.setTasks(user);
//       // Redirect to login page after successful sign up
//       navigate("/consent?refresh=true");
//     } catch (error) {
//       console.error("Error signing up:", error);
//       alert("An error occurred while signing up. Please try again.");
//     }
//   };

//   return (
//     <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center">
//       <div className="bg-[#e3e3e3] max-w-[30rem] p-6 rounded-lg flex flex-col items-center">
//         <form
//           onSubmit={handleSignUp}
//           className="flex flex-col items-center space-y-6 px-16 mt-[4rem]"
//         >
//           <h1 className="text-2xl font-bold">Sign Up</h1>
//           <p className="text-sm text-gray-600">
//             A random email has been generated for you to preserve privacy.
//             Please remember this email as you may need it to log in.
//           </p>

//           <label
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3 flex items-center"
//             value={email}
//             contentEditable={false}
//           >
//             {email}
//           </label>
//           <p className="text-sm text-gray-600">
//             Create a password with a length of at least 6 characters.
//           </p>

//           <input
//             type="password"
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3"
//             value={password}
//             required
//             placeholder="Password"
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <input
//             type="password"
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3"
//             value={verifyPassword}
//             required
//             placeholder="Verify password"
//             onChange={(e) => setVerifyPassword(e.target.value)}
//           />
//           <input
//             type="text"
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3"
//             value={mturkId}
//             required
//             placeholder="mTurk ID"
//             onChange={(e) => setMTurkId(e.target.value)}
//           />
//         </form>
//         <div className="flex flex-col w-full items-center justify-end space-y-8 mb-4 mt-2">
//           <button
//             type="submit"
//             className="w-fit bg-white text-black py-2 px-8 rounded-xl mt-"
//             onClick={handleSignUp}
//           >
//             {" "}
//             Sign Up
//           </button>
//           <button
//             className="text-black w-fit underline"
//             onClick={() => navigate("/login")}
//           >
//             Log in instead
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import AuthContext from "../context/auth-context";
import TaskContext from "../context/task-context";
import Jabber from "jabber";

const SignUp = () => {
  const jabber = new Jabber();
  const navigate = useNavigate();
  const [email, setEmail] = useState(jabber.createEmail("example.com"));
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [mturkId, setMTurkId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password === "" || mturkId === "") {
      setError("Please fill all the fields.");
      return;
    }
    if (password !== verifyPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("Signed up user:", user);

      authCtx.login(user, password);
      authCtx.updateMTurkId(mturkId, user.uid);
      taskCtx.setTasks(user);

      navigate("/consent?refresh=true");
    } catch (error) {
      console.error("Error signing up:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError("An error occurred while signing up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Generated Email Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  Privacy-Protected Email
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  A random email has been generated for your privacy. Please
                  save it for future login.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Email Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Generated Email
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm overflow-hidden">
                  {email}
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    copied
                      ? "bg-green-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                  }`}
                >
                  {copied ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={password}
                required
                placeholder="Create a password (min 6 characters)"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Verify Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={verifyPassword}
                required
                placeholder="Confirm your password"
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
              {password && verifyPassword && password !== verifyPassword && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
              {password && verifyPassword && password === verifyPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

            {/* MTurk ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MTurk Worker ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={mturkId}
                required
                placeholder="Enter your MTurk Worker ID"
                onChange={(e) => setMTurkId(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
