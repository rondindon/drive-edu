import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
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
import AppHelmet from "src/components/AppHelmet";

const translations = {
  en: {
    helmetTitle: "DriveReady - Profile",
    helmetDescription:
      "View your profile information, test history, and activity statistics.",
    profileInfoTab: "Profile Info",
    activityTab: "Activity",
    historyTab: "History",
    roleLabel: "Role:",
    createdAtLabel: "Created At:",
    usernameLabel: "Username:",
    notSet: "Not set",
    editUsername: "Edit Username",
    enterNewUsername: "Enter new username",
    confirmUsernameUpdateTitle: "Confirm Username Update",
    confirmUsernameUpdateDescription: (name: string) =>
      `Are you sure you want to change your username to "${name}"?`,
    save: "Save",
    cancel: "Cancel",
    loadingSuccessRate: "Loading success rate...",
    loadingStreak: "Loading streak...",
    loadingBadges: "Loading badges...",
    selectProfilePicture: "Select Profile Picture",
    chooseProfilePicture: "Choose one of the available profile pictures.",
    close: "Close",
    profileTabMessage: "Username updated successfully!",
    loadingCalendar: "Loading calendar...",
    profileTestHistoryTitle: "My Test History",
    loadingTestHistory: "Loading test history...",
    noCompletedTests: "No completed tests found.",
    groupLabel: "Group:",
    scoreLabel: "Score:",
    passed: "Passed",
    failed: "Failed",
    timeTakenLabel: "Time Taken:",
    dateLabel: "Date:",
    errorUpdatingUsername: "Error updating username. Please try again.",
  },
  sk: {
    helmetTitle: "DriveReady - Profil",
    helmetDescription:
      "Zobraziť informácie o profile, históriu skúšok a štatistiky aktivity.",
    profileInfoTab: "Informácie o Profile",
    activityTab: "Aktivita",
    historyTab: "História",
    roleLabel: "Rola:",
    createdAtLabel: "Vytvorené:",
    usernameLabel: "Používateľské meno:",
    notSet: "Nenastavené",
    editUsername: "Upraviť používateľské meno",
    enterNewUsername: "Zadajte nové používateľské meno",
    confirmUsernameUpdateTitle: "Potvrdiť zmenu používateľského mena",
    confirmUsernameUpdateDescription: (name: string) =>
      `Ste si istý, že chcete zmeniť používateľské meno na "${name}"?`,
    save: "Uložiť",
    cancel: "Zrušiť",
    loadingSuccessRate: "Načítava sa miera úspešnosti...",
    loadingStreak: "Načítava sa séria...",
    loadingBadges: "Načítavajú sa odznaky...",
    selectProfilePicture: "Vyberte profilový obrázok",
    chooseProfilePicture:
      "Vyberte si jeden z dostupných profilových obrázkov.",
    close: "Zatvoriť",
    profileTabMessage: "Používateľské meno bolo úspešne aktualizované!",
    loadingCalendar: "Načítava sa kalendár...",
    profileTestHistoryTitle: "Moja História Skúšok",
    loadingTestHistory: "Načítava sa história skúšok...",
    noCompletedTests: "Neboli nájdené žiadne dokončené skúšky.",
    groupLabel: "Skupina:",
    scoreLabel: "Skóre:",
    passed: "Splnené",
    failed: "Neúspešné",
    timeTakenLabel: "Čas:",
    dateLabel: "Dátum:",
    errorUpdatingUsername: "Chyba pri aktualizácii používateľského mena. Skúste to prosím znova.",
  },
};

const Profile: React.FC = () => {
  const { user, username, role, updateUsername } = useAuth();
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"Profile Info" | "Activity" | "History">("Profile Info");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const [message, setMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [testsTaken, setTestsTaken] = useState<number>(0);
  const [testsPassed, setTestsPassed] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [testStatsLoading, setTestStatsLoading] = useState<boolean>(true);
  const [testStatsError, setTestStatsError] = useState<string | null>(null);

  const [testsPerDay, setTestsPerDay] = useState<TestsPerDay[]>([]);
  const [testsPerDayLoading, setTestsPerDayLoading] = useState<boolean>(true);
  const [testsPerDayError, setTestsPerDayError] = useState<string | null>(null);

  const [userTests, setUserTests] = useState<any[]>([]);
  const [userTestsLoading, setUserTestsLoading] = useState<boolean>(false);
  const [userTestsError, setUserTestsError] = useState<string | null>(null);

  const [streak, setStreak] = useState<number>(0);
  const [streakLoading, setStreakLoading] = useState<boolean>(true);
  const [streakError, setStreakError] = useState<string | null>(null);

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

  const badgeStyles: Record<string, string> = {
    DIAMOND: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-2 border-purple-700 font-bold",
    PLATINUM: "bg-gray-400 text-black border border-gray-600 font-semibold",
    SILVER: "bg-gray-300 text-black border border-gray-500",
    BRONZE: "bg-yellow-600 text-white border border-yellow-800",
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const handleProfilePicSelect = async (url: string) => {
    setProfilePicture(url);
    axios.put(
      "https://drive-edu.onrender.com/api/users/updateProfilePicture",
      { profilePicture: url },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProfilePicDialogOpen(false);
  };

  useEffect(() => {
    const fetchTestSummary = async () => {
      setTestStatsLoading(true);
      try {
        const response = await axios.get(
          "https://drive-edu.onrender.com/api/user/stats/test-summary",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        setTestStatsError(t.errorUpdatingUsername);
      } finally {
        setTestStatsLoading(false);
      }
    };
    fetchTestSummary();
  }, [token, t.errorUpdatingUsername]);

  useEffect(() => {
    const fetchTestsPerDay = async () => {
      setTestsPerDayLoading(true);
      try {
        const response = await axios.get(
          "https://drive-edu.onrender.com/api/user/stats/tests",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTestsPerDay(response.data.testsOverTimeDay ?? []);
      } catch (error) {
        console.error("Error fetching tests per day:", error);
        setTestsPerDayError(t.loadingCalendar);
      } finally {
        setTestsPerDayLoading(false);
      }
    };
    fetchTestsPerDay();
  }, [token, t.loadingCalendar]);

  useEffect(() => {
    const fetchUserTests = async () => {
      if (activeTab !== "History") return;
      setUserTestsLoading(true);
      setUserTestsError(null);
      try {
        const response = await axios.get(
          "https://drive-edu.onrender.com/api/user/tests",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserTests(response.data);
      } catch (error) {
        console.error("Error fetching user tests:", error);
        setUserTestsError(t.loadingTestHistory);
      } finally {
        setUserTestsLoading(false);
      }
    };
    fetchUserTests();
  }, [activeTab, token, t.loadingTestHistory]);

  useEffect(() => {
    const fetchStreak = async () => {
      setStreakLoading(true);
      try {
        const response = await axios.get(
          "https://drive-edu.onrender.com/api/user/stats/streak",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStreak(response.data.streak);
      } catch (error) {
        console.error("Error fetching streak:", error);
        setStreakError(t.loadingStreak);
      } finally {
        setStreakLoading(false);
      }
    };
    fetchStreak();
  }, [token, t.loadingStreak]);

  useEffect(() => {
    const fetchBadges = async () => {
      setBadgesLoading(true);
      try {
        const response = await axios.get(
          "https://drive-edu.onrender.com/api/user/badges",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
      alert(t.enterNewUsername);
      return;
    }
    try {
      await updateUsername(newUsername);
      toast.success(t.profileTabMessage);
      setEditing(false);
    } catch (error) {
      setMessage(t.errorUpdatingUsername);
      console.error(error);
    } finally {
      setDialogOpen(false);
    }
  };

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="p-6 bg-[hsl(var(--background))] min-h-screen flex flex-col items-center text-[hsl(var(--foreground))]"
    >
      <AppHelmet title={t.helmetTitle} description={t.helmetDescription} />
      <div className="max-w-5xl w-full">
        {/* Profile Card with Avatar, Calendar, and Achievements */}
        <Card className="mt-5 py-12 shadow-lg rounded-md flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0 md:space-x-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] items-center justify-around">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div onClick={() => setProfilePicDialogOpen(true)} className="cursor-pointer">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profilePicture} alt={username || t.notSet} />
                <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col space-y-1 items-center md:items-start">
              <span className="text-lg font-bold">{username || t.notSet}</span>
              <span className="text-sm">{user?.email}</span>
              {testStatsLoading ? (
                <div className="text-gray-500">{t.loadingSuccessRate}</div>
              ) : testStatsError ? (
                <div className="text-red-500">{testStatsError}</div>
              ) : (
                <div className="flex flex-col items-center md:items-start space-y-1 font-semibold">
                  <div className="flex items-center space-x-2">
                    <span>{successRate.toFixed(2)}%</span>
                    <span>- {testsPassed}/{testsTaken}</span>
                  </div>
                  {streakLoading ? (
                    <div className="text-gray-500">{t.loadingStreak}</div>
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
                        <p>{t.loadingBadges}</p>
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
              <div className="text-gray-500">{t.loadingCalendar}</div>
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
                <AlertDialogTitle>{t.selectProfilePicture}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.chooseProfilePicture}
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
                <Button onClick={() => setProfilePicDialogOpen(false)}>{t.cancel}</Button>
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
                <Button onClick={() => setBadgeDialogOpen(false)}>{t.close}</Button>
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
              {t.profileInfoTab}
            </button>
            <button
              onClick={() => setActiveTab("Activity")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "Activity"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              {t.activityTab}
            </button>
            <button
              onClick={() => setActiveTab("History")}
              className={`px-3 py-2 font-semibold ${
                activeTab === "History"
                  ? "border-b-2 border-main-green text-[hsl(var(--primary))]"
                  : "text-gray-500 hover:text-[hsl(var(--primary))]"
              }`}
            >
              {t.historyTab}
            </button>
          </nav>
        </div>

        {/* PROFILE INFO TAB */}
        {activeTab === "Profile Info" && (
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.roleLabel}</span>
                <span>{role}</span>
              </div>
              {user?.created_at && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t.createdAtLabel}</span>
                  <span>{new Date(user.created_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.usernameLabel}</span>
                {editing ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={t.enterNewUsername}
                      className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                    />
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                        >
                          {t.save}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.confirmUsernameUpdateTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.confirmUsernameUpdateDescription(newUsername)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                          >
                            {t.cancel}
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                          >
                            {t.save}
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
                      {t.cancel}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{username || t.notSet}</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                      aria-label={t.editUsername}
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
              {t.profileTestHistoryTitle}
            </h2>
            {userTestsLoading ? (
              <div className="text-gray-500 text-[hsl(var(--card-foreground))]">
                {t.loadingTestHistory}
              </div>
            ) : userTestsError ? (
              <div className="text-red-500">{userTestsError}</div>
            ) : userTests.length === 0 ? (
              <div>
                <p className="text-[hsl(var(--card-foreground))]">{t.noCompletedTests}</p>
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
                            <p className="font-medium mb-1">
                              {t.groupLabel} {test.group}
                            </p>
                            <p className="font-semibold">
                              {t.scoreLabel} {test.score}/100
                            </p>
                            <p>{passed ? t.passed : t.failed}</p>
                          </motion.div>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle className="text-[hsl(var(--card-foreground))]">
                              Test Details
                            </DrawerTitle>
                            <DrawerDescription>
                              {t.helmetDescription}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="py-4 text-[hsl(var(--card-foreground))] flex gap-8 items-center justify-center">
                            <p>
                              <strong>{t.groupLabel}</strong> {test.group}
                            </p>
                            <p>
                              <strong>{t.scoreLabel}</strong> {test.score}/100
                            </p>
                            <p>
                              <strong>{t.passed}</strong> {passed ? "Yes" : "No"}
                            </p>
                            <p>
                              <strong>{t.timeTakenLabel}</strong> {test.timeTaken} seconds
                            </p>
                            <p>
                              <strong>{t.dateLabel}</strong> {new Date(test.createdAt).toLocaleString()}
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