"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

// Define password constraints
const maxLength = 16;
const minLength = 8;
const uppercaseLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z
const lowercaseLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)); // a-z
const digits = Array.from({ length: 10 }, (_, i) => i.toString()); // 0-9
const specialCharacters = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "=",
  "+",
  "[",
  "]",
  "{",
  "}",
  "|",
  "\\",
  ":",
  ";",
  '"',
  "'",
  "<",
  ">",
  ",",
  ".",
  "?",
  "/",
]; // Special characters allowed in the password

export default function SignUp() {
  // State variables to manage form inputs and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter(); // Initialize Next.js router for navigation

  // Handle sign-up with email and password
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate the form inputs
    if (!checkError()) {
      return; // If there are errors, stop the sign-up process
    }

    try {
      // Create a new user with email and password using Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // Clear form inputs after successful sign-up
      setEmail("");
      setPassword("");
      setConfirmedPassword("");

      // Redirect to the login page
      router.push("/auth/login");
      alert("Sign up successful!");
    } catch (error) {
      console.error("Error during sign up:", error);
      alert(`Sign up failed: ${error.message}`);
    }
  };

  // Handle sign-up with third-party providers (Google, Facebook)
  const handleThirdPartySignUp = async (provider) => {
    try {
      // Sign in the user with a third-party provider using Firebase Auth
      await signInWithPopup(auth, provider);
      alert("Sign up successful!");
    } catch (error) {
      console.error("Error during sign up:", error);
      alert("Sign up failed. Please try again.");
    }
  };

  // Helper functions to validate the form inputs
  const hasEmail = () => email !== "";
  const hasPwd = () => password !== "";
  const doesPwdMatch = () => password === confirmedPassword;
  const isPwdTooShort = (pwd) => pwd.length >= minLength;
  const isPwdTooLong = (pwd) => pwd.length <= maxLength;
  const containsNumber = (pwd) => pwd.some((ch) => digits.includes(ch));
  const containsLowercase = (pwd) => pwd.some((ch) => lowercaseLetters.includes(ch));
  const containsUppercase = (pwd) => pwd.some((ch) => uppercaseLetters.includes(ch));
  const containsSpecial = (pwd) => pwd.some((ch) => specialCharacters.includes(ch));

  // Error messages for various validation failures
  const errorMsg = {
    missingEmail: "Missing email",
    missingPwd: "Missing password",
    pwdUnmatched: "Passwords do not match",
    tooShortPwd: "Password needs at least 8 characters",
    tooLongPwd: "Password cannot have more than 16 characters",
    missingNumber: "Password requires at least a number",
    missingLowercase: "Password requires at least a lowercase character",
    missingUppercase: "Password requires at least an uppercase character",
    missingSpecial: "Password requires at least a special character",
  };

  // Function to check for errors in the form inputs
  const checkError = () => {
    // Split the password into an array of characters
    const pwdArr = password.split("");

    // Check each validation condition and set an appropriate error message
    if (!hasEmail()) {
      setError(errorMsg.missingEmail);
      return false;
    }
    if (!hasPwd()) {
      setError(errorMsg.missingPwd);
      return false;
    }
    if (!doesPwdMatch()) {
      setError(errorMsg.pwdUnmatched);
      return false;
    }
    if (!isPwdTooShort(pwdArr)) {
      setError(errorMsg.tooShortPwd);
      return false;
    }
    if (!isPwdTooLong(pwdArr)) {
      setError(errorMsg.tooLongPwd);
      return false;
    }
    if (!containsNumber(pwdArr)) {
      setError(errorMsg.missingNumber);
      return false;
    }
    if (!containsLowercase(pwdArr)) {
      setError(errorMsg.missingLowercase);
      return false;
    }
    if (!containsUppercase(pwdArr)) {
      setError(errorMsg.missingUppercase);
      return false;
    }
    if (!containsSpecial(pwdArr)) {
      setError(errorMsg.missingSpecial);
      return false;
    }

    // If no errors, clear the error state
    setError("");
    
    return true;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-4 rounded-md text-white max-w-md w-full">
        <h1 className="text-4xl text-center mb-4">Sign Up</h1>
        {/* Display error message if any */}
        {error && <p className="text-red-500 m-1">{error}</p>}
        {/* Sign Up Form */}
        <form className="flex flex-col space-y-4 text-black" onSubmit={handleSignUp}>
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
          <input
            className="p-3 border rounded-md"
            type="password"
            placeholder="Confirm Password"
            value={confirmedPassword}
            onChange={(e) => setConfirmedPassword(e.target.value)} // Update confirmed password state on change
          />
          <button className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-lg rounded-md" type="submit">
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          {/* Link to Login page */}
          <p>
            Already have an account?{" "}
            <a href="/auth/login" className="text-slate-400 hover:text-slate-300">
              Login
            </a>
          </p>
        </div>
        <div className="mt-6 space-y-2">
          {/* Google Sign Up Button */}
          <button
            className="flex items-center justify-center w-full text-white bg-red-600 hover:bg-red-500 p-3 text-lg rounded-md mb-2"
            onClick={() => handleThirdPartySignUp(new GoogleAuthProvider())} // Handle Google sign-up
          >
            <FaGoogle className="mr-2" /> Sign up with Google
          </button>
          {/* Facebook Sign Up Button */}
          <button
            className="flex items-center justify-center w-full text-white bg-blue-600 hover:bg-blue-500 p-3 text-lg rounded-md mb-2"
            onClick={() => handleThirdPartySignUp(new FacebookAuthProvider())} // Handle Facebook sign-up
          >
            <FaFacebook className="mr-2" /> Sign up with Facebook
          </button>
        </div>
      </div>
    </main>
  );
}
