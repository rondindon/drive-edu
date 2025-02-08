// src/pages/Register.tsx
import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { AuthError, User } from "@supabase/supabase-js";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FcGoogle } from "react-icons/fc"; // Google icon for styling
import { useAuth } from "src/context/AuthContext";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { login, loginWithGoogle, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data,
        error,
      }: { data: { user: User | null }; error: AuthError | null } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setShowAlert(true);
      } else if (data.user) {
        const response = await fetch("https://drive-edu.onrender.com/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }),
        });

        if (!response.ok) {
          throw new Error("User already exists.");
        }else{
          setMessage("User registered successfully! Please check your email for verification.");
          setShowAlert(true);
        }
      }
    } catch (err: any) {
      setMessage(`Registration failed: ${err.message || err}`);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (err: any) {
      setMessage(`Google sign-up failed: ${err.message || err}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Card className="w-full max-w-md shadow-lg transform hover:scale-105 transition-transform duration-300 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-[hsl(var(--foreground))]">
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
              height: showAlert ? "auto" : "0",
            }}
          >
            {message && (
              <Alert
                className={`mb-4 ${
                  message.includes("Error") || message.includes("failed")
                    ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border-[hsl(var(--destructive))]"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]"
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
              <label htmlFor="username" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="transition-colors duration-200 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="transition-colors duration-200 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="transition-colors duration-200 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-2 px-4
                bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                font-semibold rounded-lg shadow-md
                hover:bg-[hsl(var(--primary))]/90
                transition-all duration-300 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--muted))]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              {/* We can keep a small 'box' with card background color */}
              <span className="px-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                OR
              </span>
            </div>
          </div>

          {/* Google Register */}
          <Button
            onClick={handleGoogleRegister}
            className="
              w-full flex items-center justify-center space-x-2
              bg-[hsl(var(--background))] border border-[hsl(var(--muted))]
              shadow transition-all duration-300
            "
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-[hsl(var(--foreground))] font-semibold">Continue with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;