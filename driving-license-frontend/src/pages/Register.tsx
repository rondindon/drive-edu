import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { AuthError, User } from "@supabase/supabase-js";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        await fetch("http://localhost:4444/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
      }
    } catch (err) {
      setMessage(`Registration failed: ${err}`);
      setShowAlert(true);
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
                  message.includes("Error")
                    ? "bg-secondary-red text-white border-secondary-red"
                    : "bg-secondary-greenBackground text-main-green border-main-green"
                }`}
              >
                <AlertTitle className="font-bold">
                  {message.includes("Error") ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;