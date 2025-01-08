import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import Viewer from '../components/3DViewer';
import { Separator } from '../components/ui/separator';
import LoadingSpinner from 'src/components/LoadingSpinner';

const LandingPage: React.FC = () => {
  const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; 
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const navigate = useNavigate();
  const token = localStorage.getItem("supabaseToken");

  const handleStartTest = async () => {
    if (!selectedGroup) {
      alert('Please select a group to start the test.');
      return;
    }

    try {
      // Make a request to start the test
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
        alert(`Error: ${errorData.message}`);
        return;
      }

      const data = await response.json();
      // data will contain { message, testId, questions }

      // Example: redirect to a test page with the testId and the questions
// Example in LandingPage's handleStartTest
      navigate(`/test/${data.testId}`, {
        state: { questions: data.questions, testId: data.testId },
      });
    } catch (error) {
      console.error(error);
      alert('Something went wrong starting the test.');
    }
  };

  return (
    <div className="p-5 text-center bg-secondary-lightGray min-h-screen flex flex-col items-center justify-center space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold text-main-darkBlue mb-4 font-bam">
        Driving License Test
      </h1>
      <LoadingSpinner />
      <Separator className="w-1/2" />
      <p className="text-lg text-main-darkBlue transition-opacity duration-500 ease-in-out">
        Select your group to begin the test:
      </p>

      <Select onValueChange={(value) => setSelectedGroup(value)}>
        <SelectTrigger className="w-60 py-1 px-2 transition-all duration-300 hover:py-5 hover:px-4">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {allGroups.map((group) => (
            <SelectItem
              key={group}
              value={group}
              className="hover:bg-gray-100 transition-colors cursor-pointer"
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
          <div className="text-main-darkBlue text-sm italic animate-fadeIn">
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
  );
};

export default LandingPage;