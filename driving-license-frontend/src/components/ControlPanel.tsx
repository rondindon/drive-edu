import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const ControlPanel: React.FC = () => {
  const { loadScenario, resetSimulation } = useSimulation();

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => loadScenario('1')} className="px-4 py-2 bg-blue-500 text-white">
        Load T-Intersection
      </button>
      <button onClick={() => loadScenario('2')} className="px-4 py-2 bg-green-500 text-white">
        Load Roundabout
      </button>
      <button onClick={resetSimulation} className="px-4 py-2 bg-red-500 text-white">
        Reset Simulation
      </button>
    </div>
  );
};

export default ControlPanel;