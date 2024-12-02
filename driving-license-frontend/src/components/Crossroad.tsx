import React from 'react';
import { Car, Scenario } from '../utils/scenarios';

type CrossroadProps = {
  scenario: Scenario;
  onCarClick: (carId: string) => void;
  selectedOrder: string[];
};

const Crossroad: React.FC<CrossroadProps> = ({ scenario, onCarClick, selectedOrder }) => {
  return (
    <div className="relative w-full h-96 border border-gray-400 bg-gray-100">
      {/* Render Cars */}
      {scenario.cars.map((car) => {
        // Determine the selected order index for each car
        const orderIndex = selectedOrder.indexOf(car.id) + 1;

        return (
          <div
            key={car.id}
            className={`absolute w-16 h-16 rounded-full bg-${car.color}-500 flex items-center justify-center cursor-pointer ${
              orderIndex > 0 ? 'border-4 border-yellow-400' : ''
            }`}
            style={{
              top: `${car.position.x * 30}%`,
              left: `${car.position.y * 30}%`,
            }}
            onClick={() => onCarClick(car.id)}
          >
            <span className="text-white font-bold">
              {orderIndex > 0 ? orderIndex : car.id.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Crossroad;