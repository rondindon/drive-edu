import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Viewer from '../components/3DViewer';

const LandingPage: React.FC = () => {
  const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; // Available groups
  const [selectedGroup, setSelectedGroup] = useState<string>(''); // Selected group
  const navigate = useNavigate(); // For navigation

  // Makeshift start test function
  const handleStartTest = () => {
    if (!selectedGroup) {
      alert('Please select a group to start the test.');
      return;
    }
    // For now, we'll just alert the user with the selected group.
    // Later, this can redirect to the test page with the questions.
    alert(`Starting test for group ${selectedGroup}`);
    // Future functionality: navigate(`/test/${selectedGroup}`);
  };

  return (
    <div className="p-5 text-center bg-secondary-lightGray min-h-screen">
      <h1 className="text-4xl font-bold text-main-darkBlue mb-4">
        Driving License Test
      </h1>
      <p className="text-lg text-main-darkBlue mb-6">Select your group to begin the test:</p>

      {/* Group selection dropdown */}
      <div className="mb-6">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="p-2 text-base border border-secondary-lightGray rounded-md focus:outline-none focus:ring focus:ring-main-green"
        >
          <option value="" disabled>
            Select a group
          </option>
          {allGroups.map((group) => (
            <option key={group} value={group}>
              Group {group}
            </option>
          ))}
        </select>
      </div>

      {/* 3D Viewer */}
      <div className="my-6">
        <Viewer group={selectedGroup} />
      </div>

      {/* Start test button */}
      <button
        onClick={handleStartTest}
        className="px-6 py-3 text-base font-semibold text-white bg-main-green rounded-md shadow-md hover:bg-secondary-red transition-colors"
      >
        Start Test
      </button>
    </div>
  );
};

export default LandingPage;