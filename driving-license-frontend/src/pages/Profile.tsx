// src/pages/Profile.tsx
import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../components/ui/alert-dialog";
import { Edit } from "lucide-react";
import ActivityStats from "../components/ActivityStats"; 
import CustomCalendar, { TestsPerDay } from "../components/CustomCalendar"; 
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext"; 
import Toggle from "src/components/ToggleTheme";

const Profile: React.FC = () => {
  const { user, username, role, updateUsername } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile Info");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const [message, setMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // **State Variables for Test Statistics**
  const [testsTaken, setTestsTaken] = useState<number>(0);
  const [testsPassed, setTestsPassed] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [testStatsLoading, setTestStatsLoading] = useState<boolean>(true);
  const [testStatsError, setTestStatsError] = useState<string | null>(null);

  // **State Variables for Tests Per Day**
  const [testsPerDay, setTestsPerDay] = useState<TestsPerDay[]>([]);
  const [testsPerDayLoading, setTestsPerDayLoading] = useState<boolean>(true);
  const [testsPerDayError, setTestsPerDayError] = useState<string | null>(null);

  const token = localStorage.getItem('supabaseToken');
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Fetch Test Summary
  useEffect(() => {
    const fetchTestSummary = async () => {
      setTestStatsLoading(true);
      try {
        const response = await axios.get('http://localhost:4444/api/user/stats/test-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { testsTaken, testsPassed } = response.data;

        setTestsTaken(testsTaken ?? 0);
        setTestsPassed(testsPassed ?? 0);

        if (testsTaken > 0) {
          setSuccessRate((testsPassed / testsTaken) * 100);
        } else {
          setSuccessRate(0);
        }
      } catch (error) {
        console.error('Error fetching test summary:', error);
        setTestStatsError('Failed to load test statistics.');
      } finally {
        setTestStatsLoading(false);
      }
    };

    fetchTestSummary();
  }, [token]);

  // Fetch Tests Per Day
  useEffect(() => {
    const fetchTestsPerDay = async () => {
      setTestsPerDayLoading(true);
      try {
        const response = await axios.get('http://localhost:4444/api/user/stats/tests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTestsPerDay(response.data.testsOverTimeDay ?? []);
      } catch (error) {
        console.error('Error fetching tests per day:', error);
        setTestsPerDayError('Failed to load daily test statistics.');
      } finally {
        setTestsPerDayLoading(false);
      }
    };

    fetchTestsPerDay();
  }, [token]);

  // Save Updated Username
  const handleSave = async () => {
    if (!newUsername.trim()) {
      alert("Username cannot be empty.");
      return;
    }

    try {
      await updateUsername(newUsername);
      setMessage("Username updated successfully!");
      setEditing(false);
    } catch (error) {
      setMessage("Error updating username. Please try again.");
      console.error(error);
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <div className="p-6 bg-[hsl(var(--background))] min-h-screen flex flex-col items-center animate-fadeIn text-[hsl(var(--foreground))]">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">
          My Account
        </h1>

        {/* Profile Card with Avatar and Calendar */}
        <Card className="p-8 shadow-lg rounded-md flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0 md:space-x-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] items-center justify-around">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            {/* Avatar */}
            <Avatar className="w-24 h-24">
              <AvatarImage src={"https://github.com/shadcn.png"} alt={username || "Avatar"} />
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 items-center md:items-start">
              <span className="text-lg font-bold">{username || "Not set"}</span>
              <span className="text-sm">{user?.email}</span>
              {/* **Success Rate and Test Counts** */}
              {testStatsLoading ? (
                <div className="text-gray-500">Loading success rate...</div>
              ) : testStatsError ? (
                <div className="text-red-500">{testStatsError}</div>
              ) : (
                <div className="flex items-center space-x-2 font-semibold">
                  <span>{successRate.toFixed(2)}%</span>
                  <span>- {testsPassed}/{testsTaken}</span>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            {testsPerDayLoading ? (
              <div className="text-gray-500">Loading calendar...</div>
            ) : testsPerDayError ? (
              <div className="text-red-500">{testsPerDayError}</div>
            ) : (
              <CustomCalendar testsPerDay={testsPerDay} />
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 my-6">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab("Profile Info")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "Profile Info"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("Activity")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "Activity"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("Settings")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "Settings"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "Profile Info" && (
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <div className="space-y-6">
              {/* Role */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">Role:</span>
                <span>{role}</span>
              </div>

              {/* Created At */}
              {user?.created_at && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Created At:</span>
                  <span>{new Date(user.created_at).toLocaleString()}</span>
                </div>
              )}

              {/* Username */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Username:
                </span>
                {editing ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                    />

                    {/* AlertDialog for Confirmation */}
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                        >
                          Save
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Username Update</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to change your username to{" "}
                            <strong>{newUsername}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                          >
                            Confirm
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(false)}
                      className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{username || "Not set"}</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                      aria-label="Edit Username"
                    >
                      <Edit className="w-5 h-5 text-[hsl(var(--accent-foreground))]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "Activity" && (
          <ActivityStats />
        )}

        {activeTab === "Settings" && (
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <h2 className="text-xl font-semibold mb-4">
              Settings
            </h2>
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <Toggle
                enabled={theme === 'dark'}
                setEnabled={toggleTheme}
                label="Enable Dark Mode"
              />

              {/* Additional Settings can be added here */}
              {/* Example: Notification Preferences */}
              {/* 
              <div className="flex items-center justify-between">
                <span className="font-semibold">Email Notifications:</span>
                <ToggleSwitchComponent />
              </div>
              */}

              {/* Example: Change Password */}
              {/* 
              <div className="flex items-center justify-between">
                <span className="font-semibold">Change Password:</span>
                <Button variant="outline" className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90">
                  Update
                </Button>
              </div>
              */}

              {/* Add more settings options as needed */}
            </div>
          </Card>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 p-2 text-center rounded-md ${
            message.includes("Error") ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]" : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Profile;