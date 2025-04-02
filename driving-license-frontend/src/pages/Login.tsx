import React, { useEffect, useState, useContext } from "react";
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
import { LanguageContext } from "src/context/LanguageContext";

const translations = {
  en: {
    helmetTitle: "DriveReady - Sign in",
    helmetDescription:
      "Sign in to your DriveReady account to access your driving license tests and resources.",
    signInTitle: "Sign in",
    emailLabel: "Email",
    enterEmailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    enterPasswordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    googleSignIn: "Continue with Google",
    signInSuccess: "Sign in successful!",
    signInFailed: "Sign in failed:",
    googleSignInFailed: "Google sign-in failed:",
    enterEmailForReset: "Please enter your email address first.",
    passwordResetSuccess:
      "Password reset email sent! Please check your inbox.",
    passwordResetError: "Error sending password reset email:",
    error: "Error",
    success: "Success",
    passwordRecoveryPrompt: "What would you like your new password to be?",
    passwordUpdateCancelled: "Password update cancelled.",
    passwordUpdatedSuccess: "Password updated successfully!",
    passwordMatchesOld: "The password matches the old one.",
  },
  sk: {
    helmetTitle: "DriveReady - Prihlásenie",
    helmetDescription:
      "Prihláste sa do svojho účtu DriveReady a získajte prístup k testom na vodičský preukaz a zdrojom.",
    signInTitle: "Prihlásiť sa",
    emailLabel: "Email",
    enterEmailPlaceholder: "Zadajte svoj email",
    passwordLabel: "Heslo",
    enterPasswordPlaceholder: "Zadajte svoje heslo",
    forgotPassword: "Zabudli ste heslo?",
    googleSignIn: "Pokračovať s Google",
    signInSuccess: "Prihlásenie úspešné!",
    signInFailed: "Prihlásenie zlyhalo:",
    googleSignInFailed: "Prihlásenie cez Google zlyhalo:",
    enterEmailForReset: "Najprv zadajte svoj email.",
    passwordResetSuccess:
      "Email na obnovenie hesla odoslaný! Skontrolujte svoj inbox.",
    passwordResetError: "Chyba pri odosielaní emailu na obnovenie hesla:",
    error: "Chyba",
    success: "Úspech",
    passwordRecoveryPrompt: "Aké by ste chceli mať nové heslo?",
    passwordUpdateCancelled: "Aktualizácia hesla zrušená.",
    passwordUpdatedSuccess: "Heslo bolo úspešne aktualizované!",
    passwordMatchesOld: "Heslo sa zhoduje s predchádzajúcim.",
  },
};

const Login: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          const newPassword = prompt(t.passwordRecoveryPrompt);
          if (!newPassword) {
            alert(t.passwordUpdateCancelled);
            return;
          }
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (data) {
            alert(t.passwordUpdatedSuccess);
          }
          if (error) {
            alert(t.passwordMatchesOld);
          }
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success(t.signInSuccess);
    } catch (err: any) {
      setMessage(`${t.signInFailed} ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setMessage(`${t.googleSignInFailed} ${err.message}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(t.enterEmailForReset);
      return;
    }
    try {
      console.log("Sending password reset email to:", email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      console.log("Reset password response:", { data, error });
      if (error) throw error;
      toast.success(t.passwordResetSuccess);
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      toast.error(`${t.passwordResetError} ${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <AppHelmet
        title={t.helmetTitle}
        description={t.helmetDescription}
      />
      <Card className="w-full max-w-md shadow-lg transform hover:scale-105 transition-transform duration-300 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-[hsl(var(--foreground))]">
            {t.signInTitle}
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
                  {message.includes("failed") ? t.error : t.success}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[hsl(var(--foreground))]"
              >
                {t.emailLabel}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.enterEmailPlaceholder}
                required
                className="
                  transition-colors duration-200
                  focus:border-[hsl(var(--primary))]
                  focus:ring-[hsl(var(--primary))]
                "
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[hsl(var(--foreground))]"
              >
                {t.passwordLabel}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.enterPasswordPlaceholder}
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
                {t.forgotPassword}
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
              {t.signInTitle}
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
            <span className="text-[hsl(var(--foreground))] font-semibold">
              {t.googleSignIn}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;