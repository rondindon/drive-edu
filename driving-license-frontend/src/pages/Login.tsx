// src/pages/Login.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FcGoogle } from "react-icons/fc"; // Google icon for styling

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if the user is already logged in
  useEffect(() => {
    if (user && !message) {
      navigate("/");
    }
  }, [user, message, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      setMessage("Sign in successful!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setMessage(`Sign in failed: ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // No need to set message here; the AuthProvider handles it via onAuthStateChange
    } catch (err: any) {
      setMessage(`Google sign-in failed: ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-secondary-lightGray">
      <Card className="w-full max-w-md shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-main-darkBlue">
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Alert with animation */}
          <div
            className={`mb-4 transition-all duration-500 ease-out ${
              showAlert ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 h-0"
            }`}
            style={{
              height: showAlert ? "auto" : "0",
            }}
          >
            {message && (
              <Alert
                className={`mb-4 ${
                  message.includes("failed")
                    ? "bg-secondary-red text-white border-secondary-red"
                    : "bg-secondary-greenBackground text-main-green border-main-green"
                }`}
              >
                <AlertTitle className="font-bold">
                  {message.includes("failed") ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Email and Password Login */}
          <form onSubmit={handleLogin} className="space-y-6">
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
              className="w-full py-2 px-4 bg-main-green text-white font-semibold rounded-lg shadow-md hover:bg-main-darkBlue transition-all duration-300 transform hover:scale-105"
            >
              Sign in
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

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 shadow hover:bg-gray-100 transition-all duration-300"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-main-darkBlue font-semibold">Continue with Google</span>
          </Button>

          {/* Placeholder for more buttons */}
          <div className="mt-4">
            <Button
              className="w-full py-2 px-4 bg-secondary-lightGray text-main-darkBlue border border-gray-400 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
              disabled
            >
              More Login Options Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;