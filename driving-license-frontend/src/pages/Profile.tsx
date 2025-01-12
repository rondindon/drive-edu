// src/pages/Profile.tsx
import React, { useState } from "react";
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

const Profile: React.FC = () => {
  const { user, username, role, updateUsername } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile Info");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const [message, setMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-main-darkBlue text-center mb-6">
          My Account
        </h1>

        {/* Profile Card */}
        <Card className="p-6 shadow-lg rounded-md flex items-center space-x-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src={"https://github.com/shadcn.png"} alt={username || "Avatar"} />
            <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <span className="text-lg font-bold text-main-darkBlue">{username || "Not set"}</span>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <div className="success-rate">65%</div>
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
                    />

                    {/* AlertDialog for Confirmation */}
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-main-green text-white hover:bg-main-green/90"
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
                            className="bg-main-green text-white hover:bg-main-green/90"
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
          <ActivityStats /> // Render the ActivityStats component
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