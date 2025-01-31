// src/pages/Profile.tsx

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import { motion } from "framer-motion"; // <-- Import framer-motion
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
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
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "../components/ui/drawer";

import ActivityStats from "../components/ActivityStats";
import CustomCalendar, { TestsPerDay } from "../components/CustomCalendar";
import { toast } from "react-toastify";

import FireAnimation from "../components/FireAnimation"; // Import the FireAnimation component

const Profile: React.FC = () => {
  const { user, username, role, updateUsername } = useAuth();
  const [activeTab, setActiveTab] = useState<"Profile Info" | "Activity" | "History">("Profile Info");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const [message, setMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ** Test Summary State **
  const [testsTaken, setTestsTaken] = useState<number>(0);
  const [testsPassed, setTestsPassed] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [testStatsLoading, setTestStatsLoading] = useState<boolean>(true);
  const [testStatsError, setTestStatsError] = useState<string | null>(null);

  // ** Tests Per Day State **
  const [testsPerDay, setTestsPerDay] = useState<TestsPerDay[]>([]);
  const [testsPerDayLoading, setTestsPerDayLoading] = useState<boolean>(true);
  const [testsPerDayError, setTestsPerDayError] = useState<string | null>(null);

  // ** History State **
  const [userTests, setUserTests] = useState<any[]>([]);
  const [userTestsLoading, setUserTestsLoading] = useState<boolean>(false);
  const [userTestsError, setUserTestsError] = useState<string | null>(null);

  // ** Streak State **
  const [streak, setStreak] = useState<number>(0);
  const [streakLoading, setStreakLoading] = useState<boolean>(true);
  const [streakError, setStreakError] = useState<string | null>(null);

  const token = localStorage.getItem("supabaseToken");
  const { theme, toggleTheme } = useContext(ThemeContext);

  // --------------------
  // FETCH TEST SUMMARY
  // --------------------
  useEffect(() => {
    const fetchTestSummary = async () => {
      setTestStatsLoading(true);
      try {
        const response = await axios.get("http://localhost:4444/api/user/stats/test-summary", {
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
        console.error("Error fetching test summary:", error);
        setTestStatsError("Failed to load test statistics.");
      } finally {
        setTestStatsLoading(false);
      }
    };

    fetchTestSummary();
  }, [token]);

  // --------------------
  // FETCH TESTS PER DAY (Calendar)
  // --------------------
  useEffect(() => {
    const fetchTestsPerDay = async () => {
      setTestsPerDayLoading(true);
      try {
        const response = await axios.get("http://localhost:4444/api/user/stats/tests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTestsPerDay(response.data.testsOverTimeDay ?? []);
      } catch (error) {
        console.error("Error fetching tests per day:", error);
        setTestsPerDayError("Failed to load daily test statistics.");
      } finally {
        setTestsPerDayLoading(false);
      }
    };

    fetchTestsPerDay();
  }, [token]);

  // --------------------
  // FETCH USER TEST HISTORY (when History tab is clicked)
  // --------------------
  useEffect(() => {
    const fetchUserTests = async () => {
      if (activeTab !== "History") return;
      setUserTestsLoading(true);
      setUserTestsError(null);

      try {
        // Replace with your route that calls getUserTests
        const response = await axios.get("http://localhost:4444/api/user/tests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserTests(response.data);
      } catch (error) {
        console.error("Error fetching user tests:", error);
        setUserTestsError("Failed to fetch test history.");
      } finally {
        setUserTestsLoading(false);
      }
    };

    fetchUserTests();
  }, [activeTab, token]);

  // --------------------
  // FETCH USER STREAK
  // --------------------
  useEffect(() => {
    const fetchStreak = async () => {
      setStreakLoading(true);
      try {
        const response = await axios.get("http://localhost:4444/api/user/stats/streak", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStreak(response.data.streak);
      } catch (error) {
        console.error("Error fetching streak:", error);
        setStreakError("Failed to load streak.");
      } finally {
        setStreakLoading(false);
      }
    };

    fetchStreak();
  }, [token]);

  // --------------------
  // SAVE UPDATED USERNAME
  // --------------------
  const handleSave = async () => {
    if (!newUsername.trim()) {
      alert("Username cannot be empty.");
      return;
    }

    try {
      await updateUsername(newUsername);
      toast.success("Username updated successfully!");
      setEditing(false);
    } catch (error) {
      setMessage("Error updating username. Please try again.");
      console.error(error);
    } finally {
      setDialogOpen(false);
    }
  };

  // A simple fade+slide in for the entire page container
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Variants for test cards
  const testCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  // Variants for navigation buttons
  const navButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    // Wrap the entire page in a motion.div with minimal fade+slide
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="p-6 bg-[hsl(var(--background))] min-h-screen flex flex-col items-center text-[hsl(var(--foreground))]"
    >
      <div className="max-w-5xl w-full">
        {/* Profile Card with Avatar and Calendar */}
        <Card className="mt-5 py-12 shadow-lg rounded-md flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0 md:space-x-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] items-center justify-around">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={"https://github.com/shadcn.png"} alt={username || "Avatar"} />
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 items-center md:items-start">
              <span className="text-lg font-bold">{username || "Not set"}</span>
              <span className="text-sm">{user?.email}</span>
              {/* Success Rate and Streak */}
              {testStatsLoading ? (
                <div className="text-gray-500">Loading success rate...</div>
              ) : testStatsError ? (
                <div className="text-red-500">{testStatsError}</div>
              ) : (
                <div className="flex flex-col items-center md:items-start space-y-1 font-semibold">
                  {/* Success Rate */}
                  <div className="flex items-center space-x-2">
                    <span>{successRate.toFixed(2)}%</span>
                    <span>
                      - {testsPassed}/{testsTaken}
                    </span>
                  </div>
                  {/* Streak */}
                  {streakLoading ? (
                    <div className="text-gray-500">Loading streak...</div>
                  ) : streakError ? (
                    <div className="text-red-500">{streakError}</div>
                  ) : (
                    <motion.div
                      className="flex items-center space-x-1 font-semibold text-yellow-500"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FireAnimation width={30} height={30} /> {/* Animated Fire SVG */}
                      <span className="mt-1">{streak} day{streak !== 1 ? 's' : ''} streak</span>
                    </motion.div>
                  )}
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
              onClick={() => setActiveTab("History")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "History"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* PROFILE INFO TAB */}
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
                <span className="font-semibold">Username:</span>
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

        {/* ACTIVITY TAB */}
        {activeTab === "Activity" && <ActivityStats />}

        {/* HISTORY TAB */}
        {activeTab === "History" && (
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn bg-[hsl(var(--card))] text-black">
            <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--card-foreground))]">
              My Test History
            </h2>

            {userTestsLoading ? (
              <div className="text-gray-500 text-[hsl(var(--card-foreground))]">
                Loading test history...
              </div>
            ) : userTestsError ? (
              <div className="text-red-500">{userTestsError}</div>
            ) : userTests.length === 0 ? (
              <div>No completed tests found.</div>
            ) : (
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {userTests.map((test, index) => {
                  const passed = test.isPassed;
                  const bgColor = passed ? "bg-green-100" : "bg-red-100";

                  return (
                    <motion.div
                      key={test.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={testCardVariants}
                    >
                      <Drawer>
                        <DrawerTrigger asChild>
                          {/* Wrap the div with motion.div to apply hover animations */}
                          <motion.div
                            className={`p-4 rounded-md cursor-pointer ${bgColor}`}
                            whileHover={{
                              y: -5,
                              boxShadow:
                                theme === "dark"
                                  ? "0px 4px 15px rgba(255, 255, 255, 0.5)"
                                  : "0px 4px 15px rgba(0, 0, 0, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <p className="font-medium mb-1">Group: {test.group}</p>
                            <p className="font-semibold">
                              {test.score}/{100} points
                            </p>
                            <p>{passed ? "Passed" : "Failed"}</p>
                          </motion.div>
                        </DrawerTrigger>

                        {/* Drawer Content for Details */}
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle className="text-[hsl(var(--card-foreground))]">
                              Test Details
                            </DrawerTitle>
                            <DrawerDescription>
                              Information about your test
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="py-4 text-[hsl(var(--card-foreground))] flex gap-8 items-center justify-center">
                            <p>
                              <strong>Group:</strong> {test.group}
                            </p>
                            <p>
                              <strong>Score:</strong> {test.score}/100
                            </p>
                            <p>
                              <strong>Passed:</strong> {passed ? "Yes" : "No"}
                            </p>
                            <p>
                              <strong>Time Taken:</strong> {test.timeTaken} seconds
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(test.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <DrawerFooter>{/* Optional footer actions */}</DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </Card>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 p-2 text-center rounded-md ${
            message.includes("Error")
              ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
              : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          }`}
        >
          {message}
        </div>
      )}
    </motion.div>
  );
};

export default Profile;