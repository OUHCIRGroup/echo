// import React, { useState, useEffect } from "react";
// import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
// import { db } from "../firebase-config";

// const AuthContext = React.createContext({
//   user: {},
//   isLoggedIn: false,
//   isAdmin: false,
//   adminInfo: null,
//   isAuthLoading: true,
//   login: (user) => {},
//   logout: () => {},
//   addUserToFirestore: (user) => {},
//   updateMTurkId: (mturkId) => {},
//   checkAdminStatus: (uid) => {},
// });

// export const AuthContextProvider = (props) => {
//   const [user, setUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [adminInfo, setAdminInfo] = useState(null);
//   const [isAuthLoading, setIsAuthLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is logged in from localStorage
//     const checkInitialAuth = async () => {
//       const loggedInUser = localStorage.getItem("user");
//       if (loggedInUser) {
//         const userData = JSON.parse(loggedInUser);
//         setUser(userData);
//         // Check admin status when user is loaded from localStorage
//         await checkAdminStatus(userData.uid, userData.email);
//       }
//       setIsAuthLoading(false);
//     };

//     checkInitialAuth();
//   }, []);

//   const isLoggedIn = !!user;

//   const addUserToFirestore = async (user, password) => {
//     if (!user || !user.uid) return;
//     const userDoc = {
//       uid: user.uid,
//       email: user.email,
//       displayName: user.displayName,
//       creationTs: Timestamp.now(),
//       password: password,
//     };
//     try {
//       await setDoc(doc(db, "users", user.uid), userDoc, { merge: true });
//       console.log("User added to Firestore successfully");
//     } catch (error) {
//       console.error("Error adding user to Firestore:", error);
//     }
//   };

//   const checkAdminStatus = async (uid, userEmail) => {
//     if (!uid && !userEmail) return false;
//     try {
//       const adminDoc = await getDoc(doc(db, "admin", "account"));
//       if (adminDoc.exists()) {
//         console.log("User ID for admin check:", uid);
//         console.log("User email for admin check:", userEmail);
//         const adminData = adminDoc.data();
//         console.log("Admin UID from Firestore:", adminData.uid);
//         console.log("Admin email from Firestore:", adminData.email);

//         // Check both UID and email for admin verification
//         const isAdminByUid = adminData.uid === uid;
//         const isAdminByEmail = adminData.email === userEmail;

//         if (isAdminByUid || isAdminByEmail) {
//           setIsAdmin(true);
//           setAdminInfo(adminData);
//           console.log("Admin access granted");
//           return true;
//         } else {
//           setIsAdmin(false);
//           setAdminInfo(null);
//           console.log("Admin access denied");
//           return false;
//         }
//       } else {
//         console.log("No admin document found");
//         setIsAdmin(false);
//         setAdminInfo(null);
//         return false;
//       }
//     } catch (error) {
//       console.error("Error checking admin status:", error);
//       setIsAdmin(false);
//       setAdminInfo(null);
//       return false;
//     }
//   };

//   const login = async (user, password) => {
//     setIsAuthLoading(true);
//     setUser(user);
//     localStorage.setItem("user", JSON.stringify(user));
//     await addUserToFirestore(user, password); // Add or update the user in Firestore
//     await checkAdminStatus(user.uid, user.email); // Check admin status on login
//     setIsAuthLoading(false);
//   };

//   const logout = () => {
//     setUser(null);
//     setIsAdmin(false);
//     setAdminInfo(null);
//     localStorage.removeItem("user");
//   };

//   const updateMTurkId = async (mturkId, uid) => {
//     if (!uid) return;
//     await setDoc(doc(db, "users", uid), { mturkId }, { merge: true });
//   };

//   const contextValue = {
//     user: user,
//     login: login,
//     logout: logout,
//     isLoggedIn: isLoggedIn,
//     isAdmin: isAdmin,
//     adminInfo: adminInfo,
//     isAuthLoading: isAuthLoading,
//     addUserToFirestore,
//     updateMTurkId,
//     checkAdminStatus,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {" "}
//       {props.children}{" "}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;

import React, { useState, useEffect } from "react";
import {
  setDoc,
  doc,
  Timestamp,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase-config";

const AuthContext = React.createContext({
  user: {},
  isLoggedIn: false,
  isAdmin: false,
  adminInfo: null,
  isAuthLoading: true,
  currentAdminId: null, // Track which admin is currently active (for participant creation)
  login: (user) => {},
  logout: () => {},
  addUserToFirestore: (user) => {},
  updateMTurkId: (mturkId) => {},
  checkAdminStatus: (uid) => {},
  setCurrentAdminId: (adminId) => {},
  getParticipantAdminId: (userId) => {},
});

export const AuthContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkInitialAuth = async () => {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        // Check admin status when user is loaded from localStorage
        await checkAdminStatus(userData.uid, userData.email);
      }

      // Restore currentAdminId from localStorage
      const storedAdminId = localStorage.getItem("currentAdminId");
      if (storedAdminId) {
        setCurrentAdminId(storedAdminId);
      }

      setIsAuthLoading(false);
    };

    checkInitialAuth();
  }, []);

  const isLoggedIn = !!user;

  const addUserToFirestore = async (user, password, adminId = null) => {
    if (!user || !user.uid) return;

    // Use provided adminId, or currentAdminId from state, or from localStorage
    const assignedAdminId =
      adminId || currentAdminId || localStorage.getItem("currentAdminId");

    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      creationTs: Timestamp.now(),
      password: password,
      // Store the admin who owns this participant
      adminId: assignedAdminId || null,
    };

    try {
      await setDoc(doc(db, "users", user.uid), userDoc, { merge: true });
      console.log(
        "User added to Firestore successfully with adminId:",
        assignedAdminId
      );
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  const checkAdminStatus = async (uid, userEmail) => {
    if (!uid && !userEmail) return false;

    try {
      // First, check the new multi-admin system (admin/users/list collection)
      const adminListRef = collection(db, "admin", "users", "list");
      const adminSnapshot = await getDocs(adminListRef);

      let foundAdmin = null;

      adminSnapshot.forEach((doc) => {
        const adminData = doc.data();
        // Check if UID or email matches and admin is active
        if (
          (adminData.uid === uid ||
            adminData.email?.toLowerCase() === userEmail?.toLowerCase()) &&
          adminData.isActive !== false
        ) {
          foundAdmin = adminData;
        }
      });

      if (foundAdmin) {
        console.log("Admin found in multi-admin system:", foundAdmin.email);
        setIsAdmin(true);
        setAdminInfo(foundAdmin);
        // Set currentAdminId when admin logs in
        setCurrentAdminId(uid);
        localStorage.setItem("currentAdminId", uid);
        return true;
      }

      // Fallback: Check the legacy single admin document (admin/account)
      const legacyAdminDoc = await getDoc(doc(db, "admin", "account"));
      if (legacyAdminDoc.exists()) {
        const adminData = legacyAdminDoc.data();
        console.log("Checking legacy admin document");

        const isAdminByUid = adminData.uid === uid;
        const isAdminByEmail =
          adminData.email?.toLowerCase() === userEmail?.toLowerCase();

        if (isAdminByUid || isAdminByEmail) {
          console.log("Admin access granted via legacy system");
          setIsAdmin(true);
          setAdminInfo(adminData);
          // Set currentAdminId when admin logs in
          setCurrentAdminId(uid);
          localStorage.setItem("currentAdminId", uid);
          return true;
        }
      }

      // Not an admin
      console.log("Admin access denied");
      setIsAdmin(false);
      setAdminInfo(null);
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setAdminInfo(null);
      return false;
    }
  };

  // Get the adminId associated with a participant
  const getParticipantAdminId = async (userId) => {
    if (!userId) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().adminId || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting participant adminId:", error);
      return null;
    }
  };

  const login = async (user, password) => {
    setIsAuthLoading(true);
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    await addUserToFirestore(user, password);
    await checkAdminStatus(user.uid, user.email);
    setIsAuthLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setAdminInfo(null);
    setCurrentAdminId(null);
    localStorage.removeItem("user");
    // Don't remove currentAdminId on logout so it persists for participant creation
  };

  const updateMTurkId = async (mturkId, uid) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), { mturkId }, { merge: true });
  };

  const updateCurrentAdminId = (adminId) => {
    setCurrentAdminId(adminId);
    if (adminId) {
      localStorage.setItem("currentAdminId", adminId);
    } else {
      localStorage.removeItem("currentAdminId");
    }
  };

  const contextValue = {
    user: user,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    adminInfo: adminInfo,
    isAuthLoading: isAuthLoading,
    currentAdminId: currentAdminId,
    addUserToFirestore,
    updateMTurkId,
    checkAdminStatus,
    setCurrentAdminId: updateCurrentAdminId,
    getParticipantAdminId,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
