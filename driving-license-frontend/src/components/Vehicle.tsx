import React from 'react';

type VehicleProps = {
  vehicle: {
    id: string;
    type: 'car' | 'bus' | 'tram';
    position: { x: number; y: number };
    direction: 'north' | 'south' | 'east' | 'west';
  };
};

const Vehicle: React.FC<VehicleProps> = ({ vehicle }) => {
  const colors = {
    car: 'bg-blue-500',
    bus: 'bg-yellow-500',
    tram: 'bg-green-500',
  };

  return (
    <div
      className={`absolute w-12 h-12 ${colors[vehicle.type]} text-white flex items-center justify-center`}
      style={{
        top: `${vehicle.position.x * 100}%`,
        left: `${vehicle.position.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {vehicle.type[0].toUpperCase()}
    </div>
  );
};

export default Vehicle;