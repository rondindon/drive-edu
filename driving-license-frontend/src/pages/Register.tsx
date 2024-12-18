// src/pages/Register.tsx

import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { AuthError, User } from "@supabase/supabase-js";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FcGoogle } from "react-icons/fc"; // Google icon for styling

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>(""); // Add username state
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // To handle multiple submissions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error }: { data: { user: User | null }; error: AuthError | null } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setShowAlert(true);
      } else if (data.user) {
        setMessage("User registered successfully! Please check your email for verification.");
        setShowAlert(true);

        // Notify the backend to add the user to the Prisma User table
        const response = await fetch("http://localhost:4444/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }), // Send username to backend
        });

        if (!response.ok) {
          throw new Error("Failed to create user in the backend.");
        }
      }
    } catch (err: any) {
      setMessage(`Registration failed: ${err.message || err}`);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
      // No need to set message here; the AuthProvider handles it via onAuthStateChange
    } catch (err: any) {
      setMessage(`Google sign-up failed: ${err.message || err}`);
      setShowAlert(true);
      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-secondary-lightGray">
      <Card className="w-full max-w-md shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-main-darkBlue">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Alert with animation */}
          <div
            className={`mb-4 transition-all duration-500 ease-out ${
              showAlert ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 h-0"
            }`}
            style={{
              height: showAlert ? "auto" : "0", // Smoothly adjusts height
            }}
          >
            {message && (
              <Alert
                className={`mb-4 ${
                  message.includes("Error") || message.includes("failed")
                    ? "bg-secondary-red text-white border-secondary-red"
                    : "bg-secondary-greenBackground text-main-green border-main-green"
                }`}
              >
                <AlertTitle className="font-bold">
                  {message.includes("Error") || message.includes("failed") ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-main-darkBlue">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="transition-colors duration-200 focus:border-main-green focus:ring focus:ring-main-green"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-main-darkBlue">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="transition-colors duration-200 focus:border-main-green focus:ring focus:ring-main-green"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-main-darkBlue">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="transition-colors duration-200 focus:border-main-green focus:ring focus:ring-main-green"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-main-green text-white font-semibold rounded-lg shadow-md hover:bg-main-darkBlue transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-main-darkBlue">OR</span>
            </div>
          </div>

          {/* Google Register */}
          <Button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 shadow hover:bg-gray-100 transition-all duration-300"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-main-darkBlue font-semibold">Continue with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;