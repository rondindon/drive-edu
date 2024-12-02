import React, { useState, useEffect } from 'react';

type TrafficLightProps = {
  position: { x: number; y: number };
};

const TrafficLight: React.FC<TrafficLightProps> = ({ position }) => {
  const [state, setState] = useState<'red' | 'yellow' | 'green'>('red');

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) =>
        prev === 'red' ? 'green' : prev === 'green' ? 'yellow' : 'red'
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute w-8 h-20 border border-black bg-${state}`}
      style={{
        top: `${position.x * 50}px`,
        left: `${position.y * 50}px`,
      }}
    />
  );
};

export default TrafficLight;