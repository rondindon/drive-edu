// src/pages/LandingPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import Viewer from '../components/3DViewer';
import { Separator } from '../components/ui/separator';
import { ThemeContext } from '../context/ThemeContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; // Import your spinner
import TypedText from 'src/components/TypedText';

const typedMessages = [
  "Checking your license status...",
  "Reviewing your traffic knowledge...",
  "Adjusting your side mirrors...",
  "Ready... Set... Go!",
];

const LandingPage: React.FC = () => {
  const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; 
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const navigate = useNavigate();
  const token = localStorage.getItem("supabaseToken");
  const { theme } = useContext(ThemeContext);

  // Loading / typed messages states
  const [isLoading, setIsLoading] = useState(false);
  const [typedIndex, setTypedIndex] = useState(0); // which message we’re on
  const [showMessage, setShowMessage] = useState<string>(""); // current displayed message

  // Cycle typed messages
  useEffect(() => {
    if (!isLoading) return;

    setShowMessage(typedMessages[0]);
    setTypedIndex(0);

    const interval = setInterval(() => {
      setTypedIndex((prev) => {
        const nextIndex = (prev + 1) % typedMessages.length;
        setShowMessage(typedMessages[nextIndex]);
        return nextIndex;
      });
    }, 2200); // change message every 2.2 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleStartTest = async () => {
    if (!selectedGroup) {
      alert('Please select a group to start the test.');
      return;
    }

    try {
      setIsLoading(true); // show spinner + typed messages
      const response = await fetch('http://localhost:4444/api/tests/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ group: selectedGroup }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error starting test.');
      }

      const data = await response.json();
      // data will contain { message, testId, questions }

      navigate(`/test/${data.testId}`, {
        state: { questions: data.questions, testId: data.testId },
      });
    } catch (error: any) {
      console.error(error);
      alert(`Something went wrong starting the test:\n${error.message}`);
      setIsLoading(false); // revert if there's an error
    }
  };

  // If loading, show only spinner + typed messages
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <LoadingSpinner children={<TypedText text={showMessage} typingSpeed={30} />}/>
        
      </div>
    );
  }

  // Otherwise normal landing UI
  return (
    <div className='bg-[hsl(var(--background))] min-h-screen'>
      <div className="p-5 text-center flex flex-col items-center justify-center space-y-6 animate-fadeIn min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <h1 className="text-4xl font-bold text-[hsl(var(--primary))] mb-4 font-bam">
          Driving License Test
        </h1>
        <Separator className={`w-1/2 ${theme === 'dark' ? "bg-blue-200" : "bg-main-darkBlue"}`}/>
        <p className="text-lg text-[hsl(var(--card-foreground))] transition-opacity duration-500 ease-in-out">
          Select your group to begin the test:
        </p>

        <Select onValueChange={(value) => setSelectedGroup(value)}>
          <SelectTrigger className="w-60 py-1 px-2 transition-all duration-300 hover:py-5 hover:px-4 bg-[hsl(var(--card-bg))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--stroke-color))] rounded-md">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--stroke-color))] rounded-md shadow-l z-20">
            {allGroups.map((group) => (
              <SelectItem
                key={group}
                value={group}
                className="hover:bg-[hsl(var(--muted-foreground))] transition-colors cursor-pointer"
              >
                Group {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className={`my-6 w-full flex justify-center transition-transform duration-500 ${
            selectedGroup ? 'scale-100 opacity-100 animate-scaleUp' : 'scale-95 opacity-50'
          }`}
        >
          {selectedGroup ? (
            <Viewer group={selectedGroup} />
          ) : (
            <div className={`${theme === 'dark' ? "text-blue-200" : "text-main-darkBlue"} text-sm italic animate-fadeIn`}>
              Please select a group to load the 3D Viewer.
            </div>
          )}
        </div>

        <button
          onClick={handleStartTest}
          className="px-6 py-3 text-base font-semibold text-white bg-main-green rounded-md shadow-md hover:bg-secondary-red hover:scale-105 transition-transform transition-shadow duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!selectedGroup}
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default LandingPage;