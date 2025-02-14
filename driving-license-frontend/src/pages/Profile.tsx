import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import { motion } from "framer-motion";
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
import FireAnimation from "../components/FireAnimation";

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

  // ** Badges State **
  const [badges, setBadges] = useState<{ title: string; rank: string; description: string }[]>([]);
  const [badgesLoading, setBadgesLoading] = useState<boolean>(true);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<{ title: string; rank: string; description: string } | null>(null);

  const [profilePicDialogOpen, setProfilePicDialogOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState("https://github.com/shadcn.png");

  const profilePics = [
    "https://res.cloudinary.com/dw9jwwmue/image/upload/v1729336300/znacky/ohxd0n1ssw6cs4zqn5hk.jpg",
    "https://res.cloudinary.com/dw9jwwmue/image/upload/v1729271508/znacky/upjscaggcu6asripbkep.jpg",
    "https://res.cloudinary.com/dw9jwwmue/image/upload/v1729020799/znacky/qnvpbmlip6g41hyjpomo.jpg",
  ];

  const token = localStorage.getItem("supabaseToken");
  const { theme } = useContext(ThemeContext);

  const badgeStyles: Record<string, string> = {
    DIAMOND: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-2 border-purple-700 font-bold",
    PLATINUM: "bg-gray-400 text-black border border-gray-600 font-semibold",
    SILVER: "bg-gray-300 text-black border border-gray-500",
    BRONZE: "bg-yellow-600 text-white border border-yellow-800",
  };

  // Base animation variant for non-glowing badges
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  // Handler for selecting a new profile picture
  const handleProfilePicSelect = async (url: string) => {
    setProfilePicture(url);
    await axios.put('https://drive-edu.onrender.com/api/users/updateProfilePic', { profilePicture: url }, { headers: { Authorization: `Bearer ${token}` } });
    setProfilePicDialogOpen(false);
  };

  useEffect(() => {
    const fetchTestSummary = async () => {
      setTestStatsLoading(true);
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/user/stats/test-summary", {
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

  useEffect(() => {
    const fetchTestsPerDay = async () => {
      setTestsPerDayLoading(true);
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/user/stats/tests", {
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

  useEffect(() => {
    const fetchUserTests = async () => {
      if (activeTab !== "History") return;
      setUserTestsLoading(true);
      setUserTestsError(null);
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/user/tests", {
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

  useEffect(() => {
    const fetchStreak = async () => {
      setStreakLoading(true);
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/user/stats/streak", {
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

  useEffect(() => {
    const fetchBadges = async () => {
      setBadgesLoading(true);
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/user/badges", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBadges(response.data);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchBadges();
  }, [token]);

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

  // Animation variants for the page and test cards
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const testCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const navButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="p-6 bg-[hsl(var(--background))] min-h-screen flex flex-col items-center text-[hsl(var(--foreground))]"
    >
      <div className="max-w-5xl w-full">
        {/* Profile Card with Avatar, Calendar, and Achievements */}
        <Card className="mt-5 py-12 shadow-lg rounded-md flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0 md:space-x-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] items-center justify-around">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            {/* Make the Avatar clickable to open the profile picture selection dialog */}
            <div onClick={() => setProfilePicDialogOpen(true)} className="cursor-pointer">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profilePicture} alt={username || "Avatar"} />
                <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col space-y-1 items-center md:items-start">
              <span className="text-lg font-bold">{username || "Not set"}</span>
              <span className="text-sm">{user?.email}</span>
              {testStatsLoading ? (
                <div className="text-gray-500">Loading success rate...</div>
              ) : testStatsError ? (
                <div className="text-red-500">{testStatsError}</div>
              ) : (
                <div className="flex flex-col items-center md:items-start space-y-1 font-semibold">
                  <div className="flex items-center space-x-2">
                    <span>{successRate.toFixed(2)}%</span>
                    <span>- {testsPassed}/{testsTaken}</span>
                  </div>
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
                      <FireAnimation width={30} height={30} />
                      <span className="mt-1">{streak} day{streak !== 1 ? 's' : ''} streak</span>
                    </motion.div>
                  )}
                  {/* Achievements Section */}
                  <div className="mt-4">
                    <div className="mt-2 flex flex-wrap gap-2">
                      {badgesLoading ? (
                        <p>Loading badges...</p>
                      ) : (
                        badges.map((badge) => (
                          <motion.div
                            key={badge.title}
                            onClick={() => {
                              setSelectedBadge(badge);
                              setBadgeDialogOpen(true);
                            }}
                            variants={badgeVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05 }}
                            className={`px-2 py-1 text-xs rounded inline-flex items-center cursor-pointer ${badgeStyles[badge.rank]}`}
                          >
                            {badge.title}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
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

        {/* Profile Picture Selection Dialog */}
        {profilePicDialogOpen && (
          <AlertDialog open={profilePicDialogOpen} onOpenChange={setProfilePicDialogOpen}>
            <AlertDialogContent className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]">
              <AlertDialogHeader>
                <AlertDialogTitle>Select Profile Picture</AlertDialogTitle>
                <AlertDialogDescription>
                  Choose one of the available profile pictures.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-around my-4">
                {profilePics.map((pic, idx) => (
                  <motion.img
                    key={idx}
                    src={pic}
                    alt={`Profile option ${idx + 1}`}
                    className="w-16 h-16 rounded-full cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleProfilePicSelect(pic)}
                  />
                ))}
              </div>
              <AlertDialogFooter>
                <Button onClick={() => setProfilePicDialogOpen(false)}>Cancel</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Badge Description Dialog */}
        {selectedBadge && (
          <AlertDialog
            open={badgeDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedBadge(null);
              }
              setBadgeDialogOpen(open);
            }}
          >
            <AlertDialogContent className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]">
              <AlertDialogHeader>
                <AlertDialogTitle>{selectedBadge.title}</AlertDialogTitle>
                <AlertDialogDescription>{selectedBadge.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={() => setBadgeDialogOpen(false)}>Close</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

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
              <div className="flex justify-between items-center">
                <span className="font-semibold">Role:</span>
                <span>{role}</span>
              </div>
              {user?.created_at && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Created At:</span>
                  <span>{new Date(user.created_at).toLocaleString()}</span>
                </div>
              )}
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
              <div>
                <p className="text-[hsl(var(--card-foreground))]">No completed tests found.</p>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
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
                            <p className="font-semibold">{test.score}/100 points</p>
                            <p>{passed ? "Passed" : "Failed"}</p>
                          </motion.div>
                        </DrawerTrigger>
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
                              <strong>Date:</strong> {new Date(test.createdAt).toLocaleString()}
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