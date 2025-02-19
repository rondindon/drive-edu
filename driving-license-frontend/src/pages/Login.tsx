// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";
import AppHelmet from "src/components/AppHelmet";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !message) {
      navigate("/");
    }
  }, [user, message, navigate]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        const newPassword = prompt("What would you like your new password to be?");
        if (!newPassword) {
          alert("Password update cancelled.");
          return;
        }
        
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (data) {
          alert("Password updated successfully!");
        }
        if (error) {
          alert("The password matches the old one.");
        }
      }
    });
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Sign in successful!");
    } catch (err: any) {
      setMessage(`Sign in failed: ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setMessage(`Google sign-in failed: ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    try {
      console.log("Sending password reset email to:", email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      console.log("Reset password response:", { data, error });
      if (error) throw error;
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      toast.error("Error sending password reset email: " + err.message);
    }
  };  

  return (
    <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <AppHelmet title="DriveReady - Sign in" description="Sign in to your DriveReady account to access your driving license tests and resources." />
      <Card className="w-full max-w-md shadow-lg transform hover:scale-105 transition-transform duration-300 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-[hsl(var(--foreground))]">
            Sign in
          </CardTitle>
        </CardHeader>

        <CardContent>
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
                    ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border-[hsl(var(--destructive))]"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]"
                }`}
              >
                <AlertTitle className="font-bold">
                  {message.includes("failed") ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                className="
                  transition-colors duration-200
                  focus:border-[hsl(var(--primary))]
                  focus:ring-[hsl(var(--primary))]
                "
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
                className="
                  transition-colors duration-200
                  focus:border-[hsl(var(--primary))]
                  focus:ring-[hsl(var(--primary))]
                "
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[hsl(var(--primary))] underline hover:no-underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="
                w-full py-2 px-4
                bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                font-semibold rounded-lg shadow-md
                hover:bg-[hsl(var(--primary))]/90
                transition-all duration-300
                transform hover:scale-105
              "
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--muted))]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                OR
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="
              w-full flex items-center justify-center space-x-2
              bg-[hsl(var(--background))] border border-[hsl(var(--muted))]
              shadow hover:bg-[hsl(var(--background))] transition-all duration-300
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

export default Login;