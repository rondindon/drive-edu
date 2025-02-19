import React from 'react';
import { Scenario } from '../utils/scenarios';

type CrossroadProps = {
  scenario: Scenario;
  onCarClick: (carId: string) => void;
  selectedOrder: string[];
};

const Crossroad: React.FC<CrossroadProps> = ({ scenario, onCarClick, selectedOrder }) => {
  const rotationAngles: { [key: string]: string } = {
    north: 'rotate-0',
    south: 'rotate-180',
    east: 'rotate-90',
    west: '-rotate-90',
  };

  const signMap: { [key: string]: string } = {
    stop: '/images/stop.png',
    'main-road': '/images/main_road.png',
  };

  const signRotationMap: { [key: string]: string } = {
    north: 'rotate(0deg)',
    south: 'rotate(180deg)',
    east: 'rotate(90deg)',
    west: 'rotate(-90deg)',
  };

  const carColorClasses: { [key: string]: string } = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-900',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500',
  };

  return (
    <div className="relative w-[60vw] h-[60vh] mx-auto my-2 bg-gray-200 border border-gray-400">
      {/* Horizontal Road */}
      <div className="absolute top-1/2 left-0 w-full h-[15vh] bg-gray-400 transform -translate-y-1/2">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white transform -translate-y-1/2 dashed"></div>
      </div>

      {/* Vertical Road */}
      <div className="absolute left-1/2 top-0 h-full w-[15vh] bg-gray-400 transform -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-full w-1 bg-white transform -translate-x-1/2 dashed-up"></div>
      </div>

      {/* Traffic Signs */}
      {scenario.signs.map((sign, index) => {
        const imgSrc = signMap[sign.type];
        if (!imgSrc) return null;

        const rotation = signRotationMap[sign.direction] || 'rotate(0deg)';

        return (
          <img
            key={index}
            src={imgSrc}
            alt={sign.type}
            className="absolute"
            style={{
              top: `${sign.position.x}%`,
              left: `${sign.position.y}%`,
              width: '3vw',
              height: '3vw',
              transform: `translate(-50%, -50%) ${rotation}`,
            }}
          />
        );
      })}

      {scenario.cars.map((car) => {
        const orderIndex = selectedOrder.indexOf(car.id) + 1;
        const bgClass = carColorClasses[car.color] || 'bg-gray-500';

        return (
          <div
            key={car.id}
            className="absolute w-[5%] h-[9%] flex items-center justify-center cursor-pointer"
            style={{
              top: `${car.position.x}%`,
              left: `${car.position.y}%`,
              transformOrigin: 'center center',
            }}
            onClick={() => onCarClick(car.id)}
          >
            {/* Car Body */}
            <div
              className={`w-full h-full ${bgClass} rounded-md relative transform ${rotationAngles[car.direction]}`}
            >
              {/* Left Blinker */}
              {car.blinker === 'left' && (
                <div className="absolute top-1/3 left-0 w-2 h-2 bg-yellow-400 animate-blink transform -translate-y-1/2"></div>
              )}
              {/* Right Blinker */}
              {car.blinker === 'right' && (
                <div className="absolute top-1/3 right-0 w-2 h-2 bg-yellow-400 animate-blink transform -translate-y-1/2"></div>
              )}
            </div>

            {/* Car Label */}
            <div className="absolute flex items-center justify-center w-full h-full">
              <span className="text-white font-bold text-xs">
                {orderIndex > 0 ? orderIndex : car.id.toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Crossroad;