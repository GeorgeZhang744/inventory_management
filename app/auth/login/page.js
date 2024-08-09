"use client";

// Import necessary modules from React, Next.js, Firebase, and icons
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "../../firebase";

import { UserAuth } from "@/app/context/authContext";

export default function Login() {
  // State variables to manage email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter(); // Initialize Next.js router for navigation
  const { user } = UserAuth(); // Access the current user from the authentication context

  // Function to handle login with email and password
  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation to ensure email and password are provided
    if (email === "") {
      alert("Missing email!");
      return;
    }
    if (password === "") {
      alert("Missing password!");
      return;
    }

    try {
      // Sign in the user with email and password using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user; // Get the logged-in user

      // Clear the email and password fields
      setEmail("");
      setPassword("");

      // Redirect the user to the dashboard
      router.push(`/dashboard/${loggedInUser.uid}`);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please try again.");
    }
  };

  // Function to handle login with third-party providers (Google, Facebook)
  const handleThirdPartyLogin = async (provider) => {
    try {
      // Sign in the user with a third-party provider using Firebase Auth
      const userCredential = await signInWithPopup(auth, provider);
      const loggedInUser = userCredential.user; // Get the logged-in user

      // Redirect the user to the dashboard
      router.push(`/dashboard/${loggedInUser.uid}`);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please try again.");
    }
  };

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard
    if (user) {
      router.push(`/dashboard/${user.uid}`);
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-4 rounded-md text-white max-w-md w-full">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        {/* Login Form */}
        <form className="flex flex-col space-y-4 text-black" onSubmit={handleLogin}>
          <input
            className="p-3 border rounded-md"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
          />
          <input
            className="p-3 border rounded-md"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
          />
          <button className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-lg rounded-md" type="submit">
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          {/* Link to Sign Up page */}
          <p>
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-slate-400 hover:text-slate-300">
              Sign Up
            </a>
          </p>
        </div>
        {/* Third-Party Login Buttons */}
        <div className="mt-6 space-y-2">
          <button
            className="flex items-center justify-center w-full text-white bg-red-600 hover:bg-red-500 p-3 text-lg rounded-md mb-2"
            onClick={() => handleThirdPartyLogin(new GoogleAuthProvider())} // Handle Google login
          >
            <FaGoogle className="mr-2" /> Sign in with Google
          </button>
          <button
            className="flex items-center justify-center w-full text-white bg-blue-600 hover:bg-blue-500 p-3 text-lg rounded-md mb-2"
            onClick={() => handleThirdPartyLogin(new FacebookAuthProvider())} // Handle Facebook login
          >
            <FaFacebook className="mr-2" /> Sign in with Facebook
          </button>
        </div>
      </div>
    </main>
  );
}
