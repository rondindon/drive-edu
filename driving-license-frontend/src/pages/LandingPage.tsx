import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import Viewer from '../components/3DViewer';
import { Separator } from '../components/ui/separator';

const LandingPage: React.FC = () => {
  const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; // Available groups
  const [selectedGroup, setSelectedGroup] = useState<string>(''); // Selected group
  const navigate = useNavigate(); // For navigation

  const handleStartTest = () => {
    if (!selectedGroup) {
      alert('Please select a group to start the test.');
      return;
    }
    alert(`Starting test for group ${selectedGroup}`);
    // Future functionality: navigate(`/test/${selectedGroup}`);
  };

  return (
    <div className="p-5 text-center bg-secondary-lightGray min-h-screen flex flex-col items-center justify-center space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold text-main-darkBlue mb-4 font-bam">
        Driving License Test
      </h1>
      <Separator className='w-1/2' />
      <p className="text-lg text-main-darkBlue transition-opacity duration-500 ease-in-out">
        Select your group to begin the test:
      </p>

      {/* Group selection */}
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

      {/* 3D Viewer */}
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

      {/* Start test button */}
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