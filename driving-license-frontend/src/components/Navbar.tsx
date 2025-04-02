import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { User, Menu, Sun, Moon } from "lucide-react";
import { toast } from "react-toastify";
import AppHelmet from "./AppHelmet";

const translations = {
  en: {
    home: "Home",
    about: "About",
    simulator: "Simulator",
    signs: "Signs",
    profile: "Profile",
    logout: "Logout",
    signIn: "Sign in",
    register: "Register",
    adminPanel: "Admin Panel",
    role: "Role",
    signUp: "Sign up",
  },
  sk: {
    home: "Domov",
    about: "O nás",
    simulator: "Simulátor",
    signs: "Značky",
    profile: "Profil",
    logout: "Odhlásiť sa",
    signIn: "Prihlásiť sa",
    register: "Registrovať sa",
    adminPanel: "Administrácia",
    role: "Rola",
    signUp: "Registrovať sa",
  },
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, username, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Language state (default to English)
  const [language, setLanguage] = useState<"en" | "sk">("en");
  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "sk" : "en"));
  };

  // Get current translations
  const t = translations[language];

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-main-green font-semibold"
      : "text-secondary-lightGray hover:text-main-green transition-colors";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Log out successful!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <AppHelmet title="DriveReady - Home" />
      <header className="w-full bg-main-darkBlue shadow-md">
        <nav className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Left Section: Logo */}
          <div className="flex-1">
            <a
              href="/"
              className="text-xl font-bold text-secondary-lightGray font-inclusive tracking-wider"
            >
              DriveReady
            </a>
          </div>

          {/* Center Section: Navigation Links (Visible on md and above) */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            <a href="/" className={isActive("/")}>
              {t.home}
            </a>
            <a href="/about" className={isActive("/about")}>
              {t.about}
            </a>
            <a href="/simulator" className={isActive("/simulator")}>
              {t.simulator}
            </a>
            <a href="/signs" className={isActive("/signs")}>
              {t.signs}
            </a>
          </div>

          {/* Right Section: Profile, Admin, Theme & Language Toggle (md) */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-main-darkBlue border-main-green text-secondary-lightGray hover:bg-main-green hover:text-main-darkBlue transition-colors flex items-center space-x-2"
                >
                  {user ? (
                    <>
                      <span>{username || "User"}</span>
                      <User className="w-4 h-4" />
                    </>
                  ) : (
                    t.signUp
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-main-darkBlue border border-main-green text-secondary-lightGray"
              >
                {!user ? (
                  <>
                    <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                      <a href="/login" className="block w-full">
                        {t.signIn}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                      <a href="/register" className="block w-full">
                        {t.register}
                      </a>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                      <span>{t.role}: {role || "User"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="hover:bg-main-green hover:text-main-darkBlue transition-colors cursor-pointer"
                    >
                      {t.profile}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="hover:bg-main-green hover:text-main-darkBlue transition-colors cursor-pointer"
                    >
                      {t.logout}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {user && role === "ADMIN" && (
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="bg-main-darkBlue border-main-green text-secondary-lightGray hover:bg-main-green hover:text-main-darkBlue transition-colors"
              >
                {t.adminPanel}
              </Button>
            )}

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Sun
                  className={`w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-yellow-400"
                  } transition-colors`}
                />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  className="bg-white border border-gray-300 data-[state=checked]:bg-white"
                />
                <Moon
                  className={`w-5 h-5 ${
                    theme === "light" ? "text-gray-500" : "text-gray-300"
                  } transition-colors`}
                />
              </div>

              {/* Language Toggle */}
              <div className="flex items-center space-x-1">
                <span className="text-xs">EN</span>
                <Switch
                  checked={language === "sk"}
                  onCheckedChange={toggleLanguage}
                  className="w-8 h-4 bg-white border border-gray-300 data-[state=checked]:bg-white"
                />
                <span className="text-xs color-white">SK</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu (below md) */}
          <div className="flex md:hidden flex-1 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-main-darkBlue border-none text-secondary-lightGray hover:text-main-green focus:outline-none"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-main-darkBlue border border-main-green text-secondary-lightGray"
              >
                <div className="px-4 py-2 border-b border-main-green">
                  <a
                    href="/"
                    className={`block px-2 py-1 rounded ${isActive("/")}`}
                  >
                    {t.home}
                  </a>
                  <a
                    href="/about"
                    className={`block px-2 py-1 rounded ${isActive("/about")}`}
                  >
                    {t.about}
                  </a>
                  <a
                    href="/simulator"
                    className={`block px-2 py-1 rounded ${isActive("/simulator")}`}
                  >
                    {t.simulator}
                  </a>
                  <a
                    href="/signs"
                    className={`block px-2 py-1 rounded ${isActive("/signs")}`}
                  >
                    {t.signs}
                  </a>
                </div>

                <div className="px-4 py-2 border-b border-main-green">
                  {!user ? (
                    <>
                      <a
                        href="/login"
                        className="block px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                      >
                        {t.signIn}
                      </a>
                      <a
                        href="/register"
                        className="block px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                      >
                        {t.register}
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="block px-2 py-1 rounded">
                        <span>{t.role}: {role || "User"}</span>
                      </div>
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                      >
                        {t.profile}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                      >
                        {t.logout}
                      </button>
                      {role === "ADMIN" && (
                        <button
                          onClick={() => navigate("/admin")}
                          className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors mt-2"
                        >
                          {t.adminPanel}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2 px-4 py-2">
                  <Sun
                    className={`w-5 h-5 ${
                      theme === "dark" ? "text-gray-500" : "text-yellow-400"
                    } transition-colors`}
                  />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                    className="bg-white border border-gray-300 data-[state=checked]:bg-white"
                  />
                  <Moon
                    className={`w-5 h-5 ${
                      theme === "light" ? "text-gray-500" : "text-gray-300"
                    } transition-colors`}
                  />
                  <div className="flex items-center space-x-1">
                    <span className="text-xs color-white">EN</span>
                    <Switch
                      checked={language === "sk"}
                      onCheckedChange={toggleLanguage}
                      className="w-8 h-4 bg-white border border-gray-300 data-[state=checked]:bg-white"
                    />
                    <span className="text-xs">SK</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;