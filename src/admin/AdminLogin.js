import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import AuthContext from "../context/auth-context";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const authCtx = useContext(AuthContext);

  // Check if admin exists and show success message if coming from setup
  useEffect(() => {
    const checkAdminAndMessages = async () => {
      // Check for setup success message
      if (searchParams.get("setup") === "success") {
        setSuccessMessage(
          "Admin account created successfully! Please login with your credentials.",
        );
      }

      // Check if any admin exists
      try {
        const adminListRef = collection(db, "admin", "users", "list");
        const snapshot = await getDocs(adminListRef);
        setAdminExists(!snapshot.empty);
      } catch (error) {
        console.error("Error checking admin existence:", error);
        setAdminExists(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAndMessages();
  }, [searchParams]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      console.log("Admin user logged in:", user.uid);

      // Check admin status directly
      const isUserAdmin = await authCtx.checkAdminStatus(user.uid, user.email);

      console.log("Admin status check result:", isUserAdmin);

      // Check if user is actually an admin
      if (isUserAdmin) {
        console.log("Admin verified, logging in user");
        await authCtx.login(user, password);
        console.log("Navigating to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Access denied - not an admin");
        alert("Access denied. You are not authorized as an admin.");
      }
    } catch (error) {
      console.error("Error logging in as admin:", error);
      alert("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // No admin exists - show setup prompt
  if (!adminExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Setup Required
          </h1>
          <p className="text-gray-600 mb-6">
            No admin account has been configured yet. Please complete the
            initial setup to create your admin account.
          </p>
          <button
            onClick={() => navigate("/admin/setup")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Start Setup
          </button>
          {/* <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Back to User Login
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Email
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors mt-6"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
