import React, { useState } from 'react';
import Crossroad from '../components/Crossroad';
import { scenarios, Scenario } from '../utils/scenarios';

const CrossroadSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const handleCarClick = (carId: string) => {
    if (!selectedOrder.includes(carId) && selectedOrder.length < selectedScenario.cars.length) {
      setSelectedOrder((prev) => [...prev, carId]);
    }
  };

  const resetOrder = () => setSelectedOrder([]);

  const validateOrder = () => {
    const correctOrder = ['blue', 'red', 'you']; // Example: Yield to the right
    if (JSON.stringify(selectedOrder) === JSON.stringify(correctOrder)) {
      alert('Correct order!');
    } else {
      alert('Incorrect order! Remember the priority rules.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Crossroad Simulator</h1>

      {/* Scenario Selector */}
      <select
        className="p-2 border border-gray-400 rounded"
        value={selectedScenario.id}
        onChange={(e) =>
          setSelectedScenario(scenarios.find((scenario) => scenario.id === e.target.value) || scenarios[0])
        }
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>

      {/* Crossroad */}
      <Crossroad
        scenario={selectedScenario}
        onCarClick={handleCarClick}
        selectedOrder={selectedOrder}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={resetOrder}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
        <button
          onClick={validateOrder}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Validate Order
        </button>
      </div>

      {/* Selected Order */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Selected Order</h2>
        <div className="flex gap-2">
          {selectedOrder.map((carId, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-gray-200 rounded border text-black"
            >
              {index + 1}. {carId.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossroadSimulator;