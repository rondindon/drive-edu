import React, { useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

const Simulation: React.FC = () => {
  const { state } = useSimulation();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Simulating vehicle movement:', state.order);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.order]);

  return <div className="text-center">Simulation running...</div>;
};

export default Simulation;