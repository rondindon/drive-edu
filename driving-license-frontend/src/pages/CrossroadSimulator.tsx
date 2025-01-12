// CrossroadSimulator.tsx
import React, { useState } from 'react';
import Crossroad from '../components/Crossroad';
import { scenarios, Scenario } from '../utils/scenarios';

const CrossroadSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const handleCarClick = (carId: string) => {
    if (selectedOrder.includes(carId)) {
      // remove
      setSelectedOrder(prev => prev.filter(id => id !== carId));
    } else {
      // add if not full
      if (selectedOrder.length < selectedScenario.cars.length) {
        setSelectedOrder(prev => [...prev, carId]);
      }
    }
  };

  const resetOrder = () => setSelectedOrder([]);

  const validateOrder = () => {
    // If there's a custom function, use that
    if (selectedScenario.validateOrder) {
      const isCorrect = selectedScenario.validateOrder(selectedOrder);
      if (isCorrect) {
        alert('Correct order! (Simultaneous logic scenario)');
      } else {
        alert('Incorrect. Please review the special rules for this scenario.');
      }
      return;
    }

    // Otherwise fallback to the normal array check
    if (selectedScenario.correctOrder) {
      const correct = JSON.stringify(selectedOrder) === JSON.stringify(selectedScenario.correctOrder);
      if (correct) {
        alert('Correct order!');
      } else {
        alert('Incorrect order! Check your priority rules.');
      }
    } else {
      alert('No correctOrder or custom validation provided for this scenario.');
    }
  };

  const canValidate = selectedOrder.length === selectedScenario.cars.length;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Crossroad Simulator</h1>
      <select
        className="p-2 border border-gray-400 rounded"
        value={selectedScenario.id}
        onChange={(e) => {
          const found = scenarios.find((scenario) => scenario.id === e.target.value);
          setSelectedScenario(found || scenarios[0]);
          setSelectedOrder([]);
        }}
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>

      <Crossroad
        scenario={selectedScenario}
        onCarClick={handleCarClick}
        selectedOrder={selectedOrder}
      />

      <div className="flex gap-4">
        <button onClick={resetOrder} className="px-4 py-2 bg-gray-500 text-white rounded">
          Reset
        </button>
        <button
          onClick={validateOrder}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          disabled={!canValidate}
        >
          Validate Order
        </button>
      </div>

      {/* Show scenario details, etc. */}
      <div className="mt-4 text-center">
        <h2 className="text-lg font-bold">{selectedScenario.name}</h2>
        <p>{selectedScenario.description}</p>
        <ul className="list-disc list-inside text-sm text-left mt-2">
          {selectedScenario.rules.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </div>

      {/* Show the user's chosen order */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Selected Order</h2>
        <div className="flex gap-2">
          {selectedOrder.map((carId, index) => (
            <div key={carId} className="px-2 py-1 bg-gray-200 rounded border text-black">
              {index + 1}. {carId.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossroadSimulator;