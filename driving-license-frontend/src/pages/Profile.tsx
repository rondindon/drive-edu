// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
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
import ActivityStats from "../components/ActivityStats"; // Import the ActivityStats component
import CustomCalendar, { TestsPerDay } from "../components/CustomCalendar"; // Import the CustomCalendar component
import axios from "axios"; // Import axios for API calls

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

  // **Function to Fetch Test Summary**
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

  // **Function to Fetch Tests Per Day**
  useEffect(() => {
    const fetchTestsPerDay = async () => {
      setTestsPerDayLoading(true);
      try {
        const response = await axios.get('http://localhost:4444/api/user/stats/tests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTestsPerDay(response.data.testsOverTimeDay ?? []);
        console.log(response.data.testsOverTimeDay);
      } catch (error) {
        console.error('Error fetching tests per day:', error);
        setTestsPerDayError('Failed to load daily test statistics.');
      } finally {
        setTestsPerDayLoading(false);
      }
    };

    fetchTestsPerDay();
  }, [token]);

  const handleSave = async () => {
    if (!newUsername.trim()) {
      alert("Username cannot be empty.");
      return;
    }

    try {
      await updateUsername(newUsername); // Use the context function to update username
      setMessage("Username updated successfully!");
      setEditing(false);
    } catch (error) {
      setMessage("Error updating username. Please try again.");
      console.error(error);
    } finally {
      setDialogOpen(false); // Close the dialog after processing
    }
  };

  return (
    <div className="p-6 bg-secondary-lightGray min-h-screen flex flex-col items-center animate-fadeIn">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-main-darkBlue text-center mb-6">
          My Account
        </h1>

        {/* Profile Card with Avatar and Calendar */}
        <Card className="p-6 shadow-lg rounded-md flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0 md:space-x-6 items-center justify-around">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            {/* Avatar */}
            <Avatar className="w-24 h-24">
              <AvatarImage src={"https://github.com/shadcn.png"} alt={username || "Avatar"} />
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 items-center md:items-start">
              <span className="text-lg font-bold text-main-darkBlue">{username || "Not set"}</span>
              <span className="text-sm text-gray-500">{user?.email}</span>
              {/* **Success Rate and Test Counts** */}
              {testStatsLoading ? (
                <div className="text-gray-500">Loading success rate...</div>
              ) : testStatsError ? (
                <div className="text-red-500">{testStatsError}</div>
              ) : (
                <div className="flex items-center space-x-2 text-main-darkBlue font-semibold">
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
              className={`px-3 py-2 text-main-darkBlue font-semibold ${
                activeTab === "Profile Info"
                  ? "border-b-2 border-main-green"
                  : "text-gray-500 hover:text-main-green"
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("Activity")}
              className={`px-3 py-2 text-main-darkBlue font-semibold ${
                activeTab === "Activity"
                  ? "border-b-2 border-main-green"
                  : "text-gray-500 hover:text-main-green"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("Settings")}
              className={`px-3 py-2 text-main-darkBlue font-semibold ${
                activeTab === "Settings"
                  ? "border-b-2 border-main-green"
                  : "text-gray-500 hover:text-main-green"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "Profile Info" && (
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
            <div className="space-y-6">
              {/* Role */}
              <div className="flex justify-between items-center">
                <span className="text-main-darkBlue font-semibold">Role:</span>
                <span>{role}</span>
              </div>

              {/* Username */}
              <div className="flex justify-between items-center">
                <span className="text-main-darkBlue font-semibold">
                  Username:
                </span>
                {editing ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                    />

                    {/* AlertDialog for Confirmation */}
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-main-green text-white hover:bg-main-darkGreen"
                        >
                          Save
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-main-green text-white hover:bg-main-darkGreen"
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
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{username || "Not set"}</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Edit Username"
                    >
                      <Edit className="w-5 h-5 text-main-green" />
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
          <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
            <p className="text-main-darkBlue">Settings content will go here.</p>
          </Card>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 p-2 text-center rounded-md ${
            message.includes("Error") ? "bg-red-200" : "bg-green-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Profile;