// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth } from "../firebase-config";
// import { db } from "../firebase-config";
// import AuthContext from "../context/auth-context";
// import TaskContext from "../context/task-context";
// import { FlowContext } from "../context/flow-context";

// const Login = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const authCtx = useContext(AuthContext);
//   const taskCtx = useContext(TaskContext);
//   const flowCtx = useContext(FlowContext);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       // Login the user
//       authCtx.login(user);
//       // Redirect to home page after successful login
//       // delay for one second
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       navigate("/home?refresh=true");
//     } catch (error) {
//       console.error("Error logging in:", error);
//       alert("Invalid email or password. Please try again.");
//     }
//   };

//   const handleGoogleLogin = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       const userCredential = await signInWithPopup(auth, provider);
//       const user = userCredential.user;

//       // Check if the user document exists in Firestore
//       const userDocRef = doc(db, "users", user.uid);
//       const userDocSnap = await getDoc(userDocRef);
//       // Login the user
//       authCtx.login(user);
//       if (!userDocSnap.exists()) {
//         // User document does not exist, indicating a new user
//         taskCtx.setTasks(user);
//       } else {
//         console.log("User already exists,  so not assigning an LLM task");
//       }
//       // Redirect to home page after successful login
//       // delay for one second
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       navigate("/consent?refresh=true");
//     } catch (error) {
//       console.error("Error logging in with Google:", error);
//       alert(
//         "An error occurred while logging in with Google. Please try again."
//       );
//     }
//   };

//   return (
//     <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center">
//       <div className="bg-[#e3e3e3] max-w-[30rem] p-6 rounded-lg flex flex-col items-center">
//         <form
//           onSubmit={handleLogin}
//           className="flex flex-col items-center space-y-6 px-16 mt-[4rem]"
//         >
//           <input
//             type="email"
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3"
//             value={email}
//             required
//             placeholder="Email"
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             type="password"
//             className="w-[20rem] bg-[#FFFFFF] h-8 text-black rounded py-2 px-3"
//             value={password}
//             required
//             placeholder="Password"
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button
//             type="submit"
//             className="w-fit bg-white text-black py-2 px-8 rounded-xl"
//           >
//             Log In
//           </button>
//         </form>
//         <div className="flex flex-col w-full items-center justify-end space-y-8 mb-[5rem]">
//           <button
//             className="text-black w-fit underline"
//             onClick={() => navigate("/forgot-password")}
//           >
//             Forgot Password
//           </button>
//           <button
//             className="text-black w-fit underline"
//             onClick={() => navigate("/signup")}
//           >
//             Create an account
//           </button>
//           <button
//             className="text-black w-fit underline"
//             onClick={() => navigate("/admin/login")}
//           >
//             Admin Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase-config";
import { db } from "../firebase-config";
import AuthContext from "../context/auth-context";
import TaskContext from "../context/task-context";
import { FlowContext } from "../context/flow-context";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);
  const flowCtx = useContext(FlowContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      authCtx.login(user);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/home?refresh=true");
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      authCtx.login(user);

      if (!userDocSnap.exists()) {
        taskCtx.setTasks(user);
      } else {
        console.log("User already exists, so not assigning an LLM task");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/consent?refresh=true");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError(
        "An error occurred while logging in with Google. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-2">
              Sign in to continue to the study
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={email}
                required
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={password}
                required
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Links */}
          <div className="mt-8 space-y-3 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/admin/login")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
