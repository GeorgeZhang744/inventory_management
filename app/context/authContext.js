"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

// AuthContextProvider component to provide authentication context to its children
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // useEffect hook to set up a listener for authentication state changes
  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Update user state whenever the authentication changes
      setUser(currentUser);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [user]); 

  // Provide the user state to all children components
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const UserAuth = () => {
  return useContext(AuthContext); // Return the current context value (user)
};