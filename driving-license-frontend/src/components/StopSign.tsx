import React from 'react';

type StopSignProps = {
  position: { x: number; y: number };
};

const StopSign: React.FC<StopSignProps> = ({ position }) => {
  return (
    <div
      className="absolute w-8 h-8 border border-red-500 bg-red-500 text-white text-center"
      style={{
        top: `${position.x * 50}px`,
        left: `${position.y * 50}px`,
      }}
    >
      STOP
    </div>
  );
};

export default StopSign;