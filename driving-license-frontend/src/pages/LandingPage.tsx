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
    // Future functionality: navigate(/test/${selectedGroup});
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Driving License Test</h1>
      <p>Select your group to begin the test:</p>

      {/* {/* Group selection dropdown */}
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ padding: '10px', fontSize: '16px', marginBottom: '20px' }}
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

      {/* 3D Viewer */}
      <div style={{ marginTop: '20px' }}>
        <Viewer group={selectedGroup} />
      </div>

      <br />

      {/* Start test button */}
      <button
        onClick={handleStartTest}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Start Test
      </button>
    </div>
  );
};

export default LandingPage;